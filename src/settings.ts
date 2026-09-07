import { safeHtml } from '@bquery/bquery/component';
import { $, sleep } from '@bquery/bquery/core';
import { createForm, required } from '@bquery/bquery/forms';
import { useAnnouncer } from '@bquery/bquery/platform';
import { effect } from '@bquery/bquery/reactive';
import { sanitizeHtml } from '@bquery/bquery/security';
import { Session } from './classes/session';
import './components/button';
import './sass/app.sass';
import './sass/tailwind.css';

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
      safeHtml`<section class="settings-panel">
        <div class="settings-heading">
          <span class="section-kicker">Personalize your experience</span>
          <h1>Content settings</h1>
          <p>Choose what appears in your quick view. Your preference stays on this device.</p>
        </div>
        <form id="bet-settings-form" class="settings-form" novalidate>
          <div class="field-group">
            <label for="contentTest">Content to display</label>
            <span class="field-hint">A short message shown in your popup</span>
          <input
            type="text"
            class="text-input"
            id="contentTest"
            placeholder="e.g. Have a great day"
            value="${session.contentTest$.value}"
            aria-describedby="contentTest-error"
            autocomplete="off"
          />
            <small id="contentTest-error" class="field-error" role="alert"></small>
          </div>
          <div class="form-actions">
            <span class="save-hint"><span class="save-hint-icon">✓</span> Saved locally</span>
            <div id="saveSettingsSlot"></div>
          </div>
        </form>
      </section>`
    );

    const formElement = $('#bet-settings-form');
    const saveButton = document.createElement('bet-button');
    saveButton.id = 'saveSettings';
    saveButton.setAttribute('variant', 'success');
    saveButton.setAttribute('text', 'Save changes');
    $('#saveSettingsSlot').append(saveButton);

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
