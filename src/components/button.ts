/**
 * Button component implemented as a bQuery Web Component (`bet-button`).
 *
 * The custom element is registered via `@bquery/bquery/component`'s
 * `component()` helper, leveraging:
 *  - Typed `props` with automatic attribute coercion
 *  - `safeHtml` for sanitized template literals
 *  - `bool()` helper for boolean-attribute shorthand
 *
 * A thin `BasicButton` class is preserved to keep the historical imperative
 * API working for callers that still build HTML strings or HTMLButtonElements.
 * Its internals also route through bQuery's `safeHtml` template tag and the
 * `$`/chainable DOM API instead of raw `innerHTML` / `setAttribute` calls.
 */
import { bool, component, safeHtml } from '@bquery/bquery/component';
import { $ } from '@bquery/bquery/core';
import { customButton } from '../types/buttonType';

export interface ButtonConfig {
  type: customButton;
  text: string;
  id?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  onClick?: (() => void) | undefined;
}

const BOOTSTRAP_CLASS_MAP: Record<customButton, string> = {
  neutral: 'btn btn-secondary',
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  success: 'btn btn-success',
  danger: 'btn btn-danger',
  warning: 'btn btn-warning',
  info: 'btn btn-info',
  light: 'btn btn-light',
  dark: 'btn btn-dark',
};

const KNOWN_BUTTON_TYPES = new Set<customButton>(
  Object.keys(BOOTSTRAP_CLASS_MAP) as customButton[]
);

function resolveBootstrapClass(type: customButton): string {
  return BOOTSTRAP_CLASS_MAP[type] ?? BOOTSTRAP_CLASS_MAP.primary;
}

function splitClassNames(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

let registered = false;

/**
 * Registers the `<bet-button>` custom element. Importing this module already
 * attempts registration in browsing contexts, so calling this explicitly is
 * optional; it remains available for tests or callers that want idempotent,
 * explicit control over when registration happens.
 */
export function registerBetButton(): void {
  if (registered || typeof customElements === 'undefined') {
    return;
  }

  if (customElements.get('bet-button')) {
    registered = true;
    return;
  }

  component<{ variant: customButton; text: string; disabled: boolean }>('bet-button', {
    shadow: false,
    props: {
      variant: {
        type: (value: unknown): customButton => {
          if (typeof value === 'string' && KNOWN_BUTTON_TYPES.has(value as customButton)) {
            return value as customButton;
          }
          return 'primary';
        },
        default: 'primary' as customButton,
        validator: (value: unknown): boolean =>
          typeof value === 'string' && KNOWN_BUTTON_TYPES.has(value as customButton),
      },
      text: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
    },
    render({ props }) {
      const cls = resolveBootstrapClass(props.variant);
      return safeHtml`
        <button type="button" class="${cls}" ${bool('disabled', props.disabled)}>
          ${props.text}
        </button>
      `;
    },
  });

  registered = true;
}

// Auto-register on import for popup/options page consumers. The runtime guard
// keeps the side effect safe in contexts like the background worker where
// `customElements` is unavailable, and explicit `registerBetButton()` calls
// remain optional/idempotent for callers that prefer them.
registerBetButton();

/**
 * Imperative button helper. Internally uses the same bootstrap class map as
 * the `<bet-button>` web component so both APIs stay visually consistent.
 */
export class BasicButton {
  private readonly config: ButtonConfig;

  constructor(type: customButton, text: string, id?: string, className?: string) {
    this.config = {
      type,
      text,
      id,
      className,
    };
  }

  public render(): string {
    const baseClass = resolveBootstrapClass(this.config.type);
    const extraClass = this.config.className ?? '';
    const id = this.config.id ?? '';
    return safeHtml`<button
        type="button"
        class="${`${baseClass} ${extraClass}`.trim()}"
        ${id ? safeHtml`id="${id}"` : ''}
        ${bool('disabled', this.config.disabled)}
      >${this.config.text}</button>`;
  }

  public createElement(): HTMLButtonElement {
    const button = document.createElement('button');
    const $button = $(button);

    $button.attr('type', 'button');
    $button.text(this.config.text);
    $button.addClass(...splitClassNames(resolveBootstrapClass(this.config.type)));

    if (this.config.id) {
      $button.attr('id', this.config.id);
    }

    if (this.config.className) {
      $button.addClass(...splitClassNames(this.config.className));
    }

    if (this.config.disabled) {
      // Use the DOM property so the button reflects the disabled state via
      // its `HTMLButtonElement.disabled` flag, matching browser semantics
      // rather than relying on attribute string coercion.
      button.disabled = true;
    }

    if (this.config.onClick) {
      $button.on('click', this.config.onClick);
    }

    return button;
  }

  public static create(config: ButtonConfig): BasicButton {
    const button = new BasicButton(config.type, config.text, config.id, config.className);
    if (config.disabled !== undefined) {
      button.config.disabled = config.disabled;
    }
    if (config.onClick !== undefined) {
      button.config.onClick = config.onClick;
    }
    return button;
  }
}
