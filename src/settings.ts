import { Session } from './classes/session';
import { BasicButton } from './components/button';
import './sass/app.sass';

class Settings {
  private session: Session | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.session = await Session.getInstance();
      await this.renderSettings();
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      this.handleError('Failed to load settings');
    }
  }

  private async renderSettings(): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    const settingsElement = document.getElementById('settings') as HTMLDivElement | null;
    if (!settingsElement) {
      throw new Error('Settings element not found');
    }

    const saveButton = new BasicButton('success', 'Save', 'saveSettings').render();

    settingsElement.innerHTML = `
            <div class="form-group">
                <label for="contentTest">Content Test</label>
                <input
                    type="text"
                    class="form-control text-input"
                    id="contentTest"
                    placeholder="Enter content test"
                    value="${this.escapeHtml(this.session.contentTest)}"
                >
            </div>
            ${saveButton}
        `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const saveButton = document.getElementById('saveSettings') as HTMLButtonElement | null;
    const contentInput = document.getElementById('contentTest') as HTMLInputElement | null;

    if (!saveButton || !contentInput) {
      console.error('Required elements not found');
      return;
    }

    saveButton.addEventListener('click', async () => {
      try {
        await this.saveSettings(contentInput.value);
      } catch (error) {
        console.error('Failed to save settings:', error);
        this.showNotification('Failed to save settings', 'error');
      }
    });
  }

  private async saveSettings(contentTest: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    this.session.contentTest = contentTest;
    await this.session.save();
    this.showNotification('Settings saved successfully!', 'success');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // Simple notification - could be enhanced with a proper notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
            z-index: 1000;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  private handleError(message: string): void {
    console.error(message);
    const settingsElement = document.getElementById('settings');
    if (settingsElement) {
      settingsElement.innerHTML = `<div class="error-message">${message}</div>`;
    }
  }
}

new Settings();
