import { safeHtml } from '@bquery/bquery/component';
import { $, sleep } from '@bquery/bquery/core';
import { createForm, required } from '@bquery/bquery/forms';
import { useAnnouncer } from '@bquery/bquery/platform';
import { effect } from '@bquery/bquery/reactive';
import { sanitizeHtml } from '@bquery/bquery/security';
import { Session } from './classes/session';
import './components/button';
import './sass/app.sass';

const CONTENT_TEST_REQUIRED_MESSAGE = 'Content test must not be empty';
const requiredContentTestValidator = required(CONTENT_TEST_REQUIRED_MESSAGE);
const validateRequiredContentTest = (
  value: string
): true | typeof CONTENT_TEST_REQUIRED_MESSAGE => {
  return requiredContentTestValidator(value) === true ? true : CONTENT_TEST_REQUIRED_MESSAGE;
};

class Settings {
  private session: Session | null = null;

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
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
    const announcer = useAnnouncer({ politeness: 'polite' });

    // Render the surrounding form scaffold with `safeHtml` so interpolated
    // values in this template are escaped here. The nested `<bet-button>`
    // renders its own internal markup separately.
    root.empty().append(
      safeHtml`<form id="bet-settings-form" novalidate>
        <div class="form-group">
          <label for="contentTest">Content Test</label>
          <input
            type="text"
            class="form-control text-input"
            id="contentTest"
            placeholder="Enter content test"
            value="${session.contentTest$.value}"
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

    // Build a reactive form with field-level validation. The initial value
    // is seeded from the persisted session so existing data round-trips.
    const form = createForm<{ contentTest: string }>({
      fields: {
        contentTest: {
          initialValue: session.contentTest$.value,
          validators: [validateRequiredContentTest],
        },
      },
      onSubmit: async values => {
        // Defense in depth: normalize stored markup before persistence, while
        // still requiring context-appropriate escaping/sanitization at every
        // render sink.
        const sanitizedValue = sanitizeHtml(values.contentTest);
        form.setValues({ contentTest: sanitizedValue });
        input.val(sanitizedValue);
        const sanitizedValidationResult = validateRequiredContentTest(sanitizedValue);

        if (sanitizedValidationResult !== true) {
          const validationMessage = sanitizedValidationResult;
          form.fields.contentTest.touch();
          form.setErrors({ contentTest: validationMessage });
          this.showNotification(validationMessage, 'error');
          return;
        }

        session.contentTest = sanitizedValue;
        await session.save();
        announcer.announce('Settings saved successfully');
        this.showNotification('Settings saved successfully!', 'success');
      },
    });
    const submitSettings = async (event: Event): Promise<void> => {
      event.preventDefault();
      try {
        await form.handleSubmit();
      } catch (error) {
        console.error('Failed to save settings:', error);
        announcer.announce('Failed to save settings', { politeness: 'assertive' });
        this.showNotification('Failed to save settings', 'error');
      }
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

    formElement.on('submit', submitSettings);
    submitButton.on('click', submitSettings);
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // Everything past the initial host attach goes through bQuery: class
    // toggles, safe text content (no `innerHTML`), inline styling, and the
    // teardown timer (`sleep` instead of a raw `setTimeout`).
    const host = document.body.appendChild(document.createElement('div'));
    const $host = $(host);
    $host.addClass('notification', `notification-${type}`);
    $host.text(message);
    $host.css({
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px 20px',
      'border-radius': '4px',
      color: 'white',
      'background-color': type === 'success' ? '#28a745' : '#dc3545',
      'z-index': '1000',
    });

    void sleep(3000).then(() => {
      $host.remove();
    });
  }

  private handleError(message: string): void {
    console.error(message);
    if (document.getElementById('settings')) {
      $('#settings').html(safeHtml`<div class="error-message">${message}</div>`);
    }
  }
}

new Settings();
