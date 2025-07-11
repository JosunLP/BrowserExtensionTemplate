interface ExtensionMessage {
  type: string;
  payload?: unknown;
}

class Background {
  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
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
      this.handleInstall(details.reason);
    });

    // Message handling
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
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
    });
  }

  private async handleInstall(reason: string): Promise<void> {
    if (reason === 'install') {
      // First time installation
      console.log('Extension installed for the first time');
    } else if (reason === 'update') {
      // Extension updated
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
        return { type: 'pong', timestamp: Date.now() };

      case 'getVersion':
        return {
          type: 'version',
          version: chrome.runtime.getManifest().version,
        };

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async main(): Promise<void> {
    // Main background logic can be implemented here
    // This method is called after initialization
  }
}

new Background();
