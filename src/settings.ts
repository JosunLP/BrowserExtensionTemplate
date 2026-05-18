import { $ } from '@bquery/bquery/core';
import { createForm, required } from '@bquery/bquery/forms';
import { useAnnouncer } from '@bquery/bquery/platform';
import { effect } from '@bquery/bquery/reactive';
import { escapeHtml, sanitizeHtml } from '@bquery/bquery/security';
import { Session } from './classes/session';
import { registerBetButton } from './components/button';
import './sass/app.sass';

class Settings {
  private session: Session | null = null;

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      // Ensure the <bet-button> custom element is registered before any
      // template that references it is parsed.
      registerBetButton();

      this.session = await Session.getInstance();
      this.renderSettings();
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      this.handleError('Failed to load settings');
    }
  }

  private renderSettings(): void {
    const session = this.session;
    if (!session) {
      throw new Error('Session not initialized');
    }

    if (!document.getElementById('settings')) {
      throw new Error('Settings element not found');
    }
    const root = $('#settings');

    // Build a reactive form with field-level validation. The initial value
    // is seeded from the persisted session so existing data round-trips.
    const form = createForm<{ contentTest: string }>({
      fields: {
        contentTest: {
          initialValue: session.contentTest$.value,
          validators: [required('Content test must not be empty')],
        },
      },
      onSubmit: async values => {
        // Use sanitizeHtml in addition to escaping at render time so any
        // markup pasted into the field is stripped before persistence. This
        // hardens against stored-XSS even when the value is later rendered
        // through an unsanitized sink.
        session.contentTest = sanitizeHtml(values.contentTest);
        await session.save();
        announcer.announce('Settings saved successfully');
        this.showNotification('Settings saved successfully!', 'success');
      },
    });

    // Live region used to announce status updates to assistive technologies.
    const announcer = useAnnouncer({ politeness: 'polite' });

    // Render the form scaffold using the new bQuery web component button.
    // `safeHtml`-style sanitization is provided implicitly through the
    // component pipeline; user-supplied content is HTML-escaped here.
    root.empty().append(
      `<form id="bet-settings-form" novalidate>
        <div class="form-group">
          <label for="contentTest">Content Test</label>
          <input
            type="text"
            class="form-control text-input"
            id="contentTest"
            placeholder="Enter content test"
            value="${escapeHtml(session.contentTest$.value)}"
            aria-describedby="contentTest-error"
            autocomplete="off"
          />
          <small id="contentTest-error" class="form-text text-danger" role="alert"></small>
        </div>
        <bet-button id="saveSettings" variant="success" text="Save"></bet-button>
      </form>`
    );

    const formElement = $('#bet-settings-form');
    const input = $('#contentTest');
    const errorLabel = $('#contentTest-error');
    const submitButton = $('#saveSettings');
    const submitSettings = async (): Promise<void> => {
      await form.handleSubmit();
    };

    // Two-way binding between the input and the reactive form field.
    input.on('input', event => {
      const target = event.target as HTMLInputElement | null;
      if (target) {
        form.fields.contentTest.value.value = target.value;
      }
    });

    input.on('blur', () => {
      form.fields.contentTest.touch();
    });

    // Reflect field validation state into the DOM reactively.
    effect(() => {
      const error = form.fields.contentTest.error.value;
      const touched = form.fields.contentTest.isTouched.value;
      const visibleError = touched ? error : '';
      errorLabel.text(visibleError);
      input.attr('aria-invalid', visibleError ? 'true' : 'false');
    });

    // Disable the submit button while submission is in flight.
    effect(() => {
      const submitting = form.isSubmitting.value;
      if (submitting) {
        submitButton.attr('disabled', 'true');
      } else {
        submitButton.removeAttr('disabled');
      }
    });

    formElement.on('submit', async event => {
      event.preventDefault();
      try {
        await submitSettings();
      } catch (error) {
        console.error('Failed to save settings:', error);
        announcer.announce('Failed to save settings', { politeness: 'assertive' });
        this.showNotification('Failed to save settings', 'error');
      }
    });

    submitButton.on('click', async event => {
      event.preventDefault();
      try {
        await submitSettings();
      } catch (error) {
        console.error('Failed to save settings:', error);
        announcer.announce('Failed to save settings', { politeness: 'assertive' });
        this.showNotification('Failed to save settings', 'error');
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    const safeMessage = escapeHtml(message);
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = safeMessage;
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
    if (document.getElementById('settings')) {
      $('#settings').html(`<div class="error-message">${escapeHtml(message)}</div>`);
    }
  }
}

new Settings();
