import { customButton } from '../types/buttonType';

export interface ButtonConfig {
  type: customButton;
  text: string;
  id?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  onClick?: (() => void) | undefined;
}

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
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = this.config.text;
    button.className = this.getBootstrapClass();

    if (this.config.id) {
      button.id = this.config.id;
    }

    if (this.config.className) {
      button.className += ` ${this.config.className}`;
    }

    if (this.config.disabled) {
      button.disabled = true;
    }

    return button.outerHTML;
  }

  public createElement(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = this.config.text;
    button.className = this.getBootstrapClass();

    if (this.config.id) {
      button.id = this.config.id;
    }

    if (this.config.className) {
      button.className += ` ${this.config.className}`;
    }

    if (this.config.disabled) {
      button.disabled = true;
    }

    if (this.config.onClick) {
      button.addEventListener('click', this.config.onClick);
    }

    return button;
  }

  private getBootstrapClass(): string {
    const typeMap: Record<customButton, string> = {
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

    return typeMap[this.config.type] ?? 'btn btn-primary';
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
