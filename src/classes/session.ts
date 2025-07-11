interface SessionData {
  sessionId: string;
  contentTest: string;
}

interface StorageService {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
}

class LocalStorageService implements StorageService {
  async save(key: string, data: unknown): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Storage operation failed');
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      throw new Error('Storage operation failed');
    }
  }
}

export class Session implements SessionData {
  private static instance: Session | null = null;
  private static readonly STORAGE_KEY = 'browser_extension_session';
  private static readonly storageService: StorageService = new LocalStorageService();

  public readonly sessionId: string;
  public contentTest: string;

  private constructor(data?: Partial<SessionData>) {
    this.sessionId = data?.sessionId ?? crypto.randomUUID();
    this.contentTest = data?.contentTest ?? 'This is a simple example of a web application';
  }

  public static async getInstance(): Promise<Session> {
    if (!Session.instance) {
      await Session.loadOrCreate();
    }
    return Session.instance!;
  }

  private static async loadOrCreate(): Promise<void> {
    try {
      const savedData = await Session.storageService.load<SessionData>(Session.STORAGE_KEY);
      Session.instance = new Session(savedData ?? undefined);
      await Session.instance.save();
    } catch (error) {
      console.error('Failed to load session, creating new one:', error);
      Session.instance = new Session();
      await Session.instance.save();
    }
  }

  public async save(): Promise<void> {
    try {
      const data: SessionData = {
        sessionId: this.sessionId,
        contentTest: this.contentTest,
      };
      await Session.storageService.save(Session.STORAGE_KEY, data);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  public static async reset(): Promise<void> {
    try {
      await Session.storageService.remove(Session.STORAGE_KEY);
      Session.instance = new Session();
      await Session.instance.save();

      // Reload page only if we're in a browser environment
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
      contentTest: this.contentTest,
    };
  }
}
