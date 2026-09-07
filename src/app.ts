import { safeHtml } from '@bquery/bquery/component';
import { $ } from '@bquery/bquery/core';
import { effect } from '@bquery/bquery/reactive';
import { Session } from './classes/session';
import './sass/app.sass';
import './sass/tailwind.css';

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
    $(`#${App.CONTENT_ENTRY}`)
      .empty()
      .append(
        `<main class="app-content">
          <section class="welcome-card">
            <div class="welcome-icon" aria-hidden="true">✦</div>
            <div class="welcome-copy">
              <span class="section-kicker">Your personal space</span>
              <h1>Welcome back</h1>
              <p>Everything important, right where you left it.</p>
            </div>
          </section>
          <section class="content-card" aria-labelledby="saved-content-title">
            <div class="content-card-header">
              <div>
                <span class="section-kicker">Saved for you</span>
                <h2 id="saved-content-title">Your content</h2>
              </div>
              <span class="card-icon" aria-hidden="true">↗</span>
            </div>
            <p id="bet-content-test" class="saved-content"></p>
          </section>
          <footer class="app-footer">
            <span class="footer-dot"></span>
            Stored securely on this device
          </footer>
        </main>`
      );

    // Cache the target element wrapper once so the reactive effect does not
    // re-query the DOM on every signal update.
    const contentTest = $('#bet-content-test');

    // Reactively mirror this popup's in-memory session signal into the DOM.
    // This keeps the UI in sync with updates made through the same Session
    // instance, but it does not add cross-page storage synchronization.
    effect(() => {
      contentTest.text(session.contentTest$.value);
    });
  }

  private handleError(message: string): void {
    console.error(message);
    if (document.getElementById(App.CONTENT_ENTRY)) {
      $(`#${App.CONTENT_ENTRY}`).html(safeHtml`<div class="error-message">${message}</div>`);
    }
  }
}

new App();
