import { Session } from './classes/session';
import './sass/app.sass';

class App {
  private static readonly CONTENT_ENTRY = 'content';
  private session: Session | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.session = await Session.getInstance();
      await this.drawData();
      await this.main();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleError('Failed to initialize application');
    }
  }

  private async main(): Promise<void> {
    console.log('Hello World');
  }

  private async drawData(): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    const contentRoot = document.getElementById(App.CONTENT_ENTRY) as HTMLDivElement | null;
    if (!contentRoot) {
      throw new Error(`Element with id '${App.CONTENT_ENTRY}' not found`);
    }

    const body = document.createElement('div');
    body.className = 'app-content';

    const title = document.createElement('h1');
    title.innerText = 'Hello World';

    const text = document.createElement('p');
    text.innerText = this.session.contentTest;

    body.appendChild(title);
    body.appendChild(text);
    contentRoot.appendChild(body);
  }

  private handleError(message: string): void {
    console.error(message);
    const contentRoot = document.getElementById(App.CONTENT_ENTRY);
    if (contentRoot) {
      contentRoot.innerHTML = `<div class="error-message">${message}</div>`;
    }
  }
}

new App();
