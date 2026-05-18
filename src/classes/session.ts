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

  public readonly sessionId: string;
  /** Reactive signal holding the current `contentTest` value. */
  public readonly contentTest$: Signal<string>;
  /**
   * Chains successive persistence writes so that a slower backend (e.g.
   * IndexedDB) cannot let an older value overwrite a newer one when the
   * signal updates faster than the storage adapter can flush.
   */
  private writeQueue: Promise<void> = Promise.resolve();

  private constructor(data?: Partial<SessionData>) {
    this.sessionId = data?.sessionId ?? crypto.randomUUID();
    this.contentTest$ = signal<string>(
      data?.contentTest ?? 'This is a simple example of a web application'
    );

    // Auto-persist whenever the reactive value changes. The first run is a
    // no-op write of the seeded value which guarantees the storage backend
    // contains the latest snapshot at all times.
    effect(() => {
      const value = this.contentTest$.value;
      this.enqueueWrite({
        sessionId: this.sessionId,
        contentTest: value,
      });
    });
  }

  private enqueueWrite(data: SessionData): void {
    this.writeQueue = this.writeQueue
      .then(() => Session.storageAdapter.set<SessionData>(Session.STORAGE_KEY, data))
      .catch(error => {
        console.error('Failed to persist session:', error);
      });
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
    try {
      const savedData = await Session.storageAdapter.get<SessionData>(Session.STORAGE_KEY);
      Session.instance = new Session(savedData ?? undefined);
    } catch (error) {
      console.error('Failed to load session, creating new one:', error);
      Session.instance = new Session();
    }
  }

  /** Explicit save kept for backwards compatibility with the previous API. */
  public async save(): Promise<void> {
    this.enqueueWrite({
      sessionId: this.sessionId,
      contentTest: this.contentTest$.value,
    });
    await this.writeQueue;
  }

  public static async reset(): Promise<void> {
    try {
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
    return {
      sessionId: this.sessionId,
      contentTest: this.contentTest$.value,
    };
  }
}
