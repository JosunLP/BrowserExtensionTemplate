/**
 * Background service worker.
 *
 * Uses bQuery's reactive primitives to track lightweight runtime state
 * (install reason, message counters) even outside of a DOM environment.
 * Reactive state is convenient for diagnostics and can be inspected via the
 * `getVersion` / `ping` messages from privileged extension pages.
 */
import { computed, effect, signal } from '@bquery/bquery/reactive';

interface ExtensionMessage {
  type: string;
  payload?: unknown;
}

class Background {
  private readonly installReason = signal<string | null>(null);
  private readonly lifecycleEvent = signal<string | null>(null);
  private readonly messageCount = signal(0);
  private readonly isReady = computed(() => this.lifecycleEvent.value !== null);

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      effect(() => {
        if (this.isReady.value) {
          console.log(
            `Background ready (lifecycleEvent=${String(this.lifecycleEvent.value)}, installReason=${String(this.installReason.value)})`
          );
        }
      });

      await this.setupEventListeners();
      await this.main();
      console.log('Background service worker initialized');
    } catch (error) {
      console.error('Failed to initialize background service worker:', error);
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Install event
    chrome.runtime.onInstalled.addListener(details => {
      console.log('Extension installed:', details.reason);
      this.installReason.value = details.reason;
      this.lifecycleEvent.value = details.reason;
      this.handleInstall(details.reason);
    });

    // Message handling
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      this.messageCount.value += 1;
      this.handleMessage(message, sender)
        .then(response => sendResponse(response))
        .catch(error => {
          console.error('Error handling message:', error);
          sendResponse({ error: error.message });
        });
      return true; // Indicates we will send a response asynchronously
    });

    // Startup event
    chrome.runtime.onStartup.addListener(() => {
      console.log('Extension started');
      this.lifecycleEvent.value = 'startup';
    });
  }

  private handleInstall(reason: string): void {
    if (reason === 'install') {
      console.log('Extension installed for the first time');
    } else if (reason === 'update') {
      console.log('Extension updated');
    }
  }

  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ): Promise<unknown> {
    console.log('Received message:', message, 'from:', sender);

    switch (message.type) {
      case 'ping':
        return {
          type: 'pong',
          timestamp: Date.now(),
          messageCount: this.messageCount.value,
          lifecycleEvent: this.lifecycleEvent.value,
        };

      case 'getVersion':
        return {
          type: 'version',
          version: chrome.runtime.getManifest().version,
          installReason: this.installReason.value,
          lifecycleEvent: this.lifecycleEvent.value,
        };

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async main(): Promise<void> {
    // Main background logic can be implemented here.
  }
}

new Background();
