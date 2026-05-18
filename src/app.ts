import { $ } from '@bquery/bquery/core';
import { effect } from '@bquery/bquery/reactive';
import { escapeHtml } from '@bquery/bquery/security';
import { Session } from './classes/session';
import './sass/app.sass';

class App {
  private static readonly CONTENT_ENTRY = 'content';
  private session: Session | null = null;

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      this.session = await Session.getInstance();
      this.drawData();
      await this.main();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleError('Failed to initialize application');
    }
  }

  private async main(): Promise<void> {
    console.log('Hello World');
  }

  private drawData(): void {
    const session = this.session;
    if (!session) {
      throw new Error('Session not initialized');
    }

    if (!document.getElementById(App.CONTENT_ENTRY)) {
      throw new Error(`Element with id '${App.CONTENT_ENTRY}' not found`);
    }

    // Scaffold the static structure once using bQuery's chainable DOM API.
    $(`#${App.CONTENT_ENTRY}`).empty().append(
      `<div class="app-content">
        <h1>Hello World</h1>
        <p id="bet-content-test"></p>
      </div>`
    );

    // Reactively mirror the session's content into the DOM. The `effect`
    // re-runs automatically whenever `session.contentTest$` changes, so any
    // update from the Settings page is reflected here in real time without
    // additional plumbing.
    effect(() => {
      $('#bet-content-test').text(session.contentTest$.value);
    });
  }

  private handleError(message: string): void {
    console.error(message);
    const root = $(`#${App.CONTENT_ENTRY}`);
    if (document.getElementById(App.CONTENT_ENTRY)) {
      root.html(`<div class="error-message">${escapeHtml(message)}</div>`);
    }
  }
}

new App();
