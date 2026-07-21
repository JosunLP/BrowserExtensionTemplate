/**
 * Session management built on top of the bQuery platform/storage adapter and
 * reactive signals from `@bquery/bquery/reactive`.
 *
 * The session exposes its mutable fields as `Signal`s so views and components
 * can subscribe to changes without manual polling. Persistence is handled
 * through `@bquery/bquery/platform`'s unified `StorageAdapter` so the
 * underlying backend (localStorage, sessionStorage, IndexedDB, …) can be
 * swapped without touching consumers.
 */
import type { StorageAdapter } from '@bquery/bquery/platform';
import { storage } from '@bquery/bquery/platform';
import { effect, signal, type Signal } from '@bquery/bquery/reactive';

interface SessionData {
  sessionId: string;
  contentTest: string;
}

export class Session implements SessionData {
  private static instance: Session | null = null;
  private static readonly STORAGE_KEY = 'browser_extension_session';
  private static readonly storageAdapter: StorageAdapter = storage.local();

  private static isSameData(
    left: SessionData | null | undefined,
    right: SessionData | null | undefined
  ): boolean {
    return (
      !!left &&
      !!right &&
      left.sessionId === right.sessionId &&
      left.contentTest === right.contentTest
    );
  }

  public readonly sessionId: string;
  /** Reactive signal holding the current `contentTest` value. */
  public readonly contentTest$: Signal<string>;
  /**
   * Chains successive persistence writes so that a slower backend (e.g.
   * IndexedDB) cannot let an older value overwrite a newer one when the
   * signal updates faster than the storage adapter can flush.
   */
  private writeQueue: Promise<void> = Promise.resolve();
  private lastQueuedData: SessionData | null = null;
  private lastQueuedWriteFailed = false;
  private isActive = true;
  private readonly stopAutoPersist: () => void;

  private static matchesNormalizedSnapshot(
    source: Partial<SessionData> | null | undefined,
    snapshot: SessionData
  ): boolean {
    return (
      typeof source?.sessionId === 'string' &&
      typeof source?.contentTest === 'string' &&
      source.sessionId === snapshot.sessionId &&
      source.contentTest === snapshot.contentTest
    );
  }

  private constructor(data?: Partial<SessionData>, options?: { skipInitialPersist?: boolean }) {
    this.sessionId = data?.sessionId ?? crypto.randomUUID();
    this.contentTest$ = signal<string>(
      data?.contentTest ?? 'This is a simple example of a web application'
    );
    const initialSnapshot = this.snapshot();

    if (options?.skipInitialPersist && Session.matchesNormalizedSnapshot(data, initialSnapshot)) {
      this.lastQueuedData = initialSnapshot;
    }

    // Auto-persist whenever the reactive value changes. Fresh sessions write
    // their seeded snapshot immediately; sessions loaded from storage seed the
    // queue state first so unchanged startup snapshots do not write again.
    this.stopAutoPersist = effect(() => {
      void this.enqueueWrite(this.snapshot()).catch(error => {
        console.error('Failed to persist session:', error);
      });
    });
  }

  private snapshot(): SessionData {
    return {
      sessionId: this.sessionId,
      contentTest: this.contentTest$.value,
    };
  }

  private enqueueWrite(data: SessionData): Promise<void> {
    if (!this.isActive) {
      return Promise.reject(new Error('Session instance is no longer active.'));
    }

    if (Session.isSameData(this.lastQueuedData, data) && !this.lastQueuedWriteFailed) {
      return this.writeQueue;
    }

    this.lastQueuedData = data;
    this.lastQueuedWriteFailed = false;

    const write = this.writeQueue
      .catch(() => undefined)
      .then(() => Session.storageAdapter.set<SessionData>(Session.STORAGE_KEY, data));

    this.writeQueue = write.catch(error => {
      if (Session.isSameData(this.lastQueuedData, data)) {
        this.lastQueuedWriteFailed = true;
      }
      throw error;
    });

    return this.writeQueue;
  }

  private async waitForQueuedWrites(): Promise<void> {
    await this.writeQueue.catch(() => undefined);
  }

  private deactivate(): void {
    if (!this.isActive) {
      return;
    }

    this.stopAutoPersist();
    this.isActive = false;
  }

  /** Backwards compatible accessor for the non-reactive content value. */
  public get contentTest(): string {
    return this.contentTest$.value;
  }

  public set contentTest(value: string) {
    this.contentTest$.value = value;
  }

  public static async getInstance(): Promise<Session> {
    if (!Session.instance) {
      await Session.loadOrCreate();
    }
    return Session.instance!;
  }

  private static async loadOrCreate(): Promise<void> {
    let savedData: SessionData | null | undefined;

    try {
      savedData = await Session.storageAdapter.get<SessionData>(Session.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to load session, creating new one:', error);
    }

    const instance = new Session(savedData ?? undefined, {
      skipInitialPersist: savedData != null,
    });
    Session.instance = instance;

    if (savedData == null) {
      await instance.save();
    }
  }

  /** Explicit save kept for backwards compatibility with the previous API. */
  public async save(): Promise<void> {
    await this.enqueueWrite(this.snapshot());
  }

  public static async reset(): Promise<void> {
    try {
      const previousInstance = Session.instance;
      if (previousInstance) {
        previousInstance.deactivate();
        await previousInstance.waitForQueuedWrites();
      }

      await Session.storageAdapter.remove(Session.STORAGE_KEY);
      Session.instance = new Session();
      await Session.instance.save();

      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to reset session:', error);
      throw error;
    }
  }

  public toJSON(): SessionData {
    return this.snapshot();
  }
}
