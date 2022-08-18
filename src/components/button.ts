import { customButton } from "../types/buttonType";

export class BasicButton {

    private type: customButton;

    private text: string;

    private id: string | undefined;

    private className: string | undefined;

    constructor(type: customButton, text: string, id?: string, className?: string) {
        this.type = type;
        this.text = text;
        this.id = id;
        this.className = className;
    }

    public render(): string {
        const result = document.createElement('button');
        result.type = "button";
        result.className = this.type;
        result.textContent = this.text;

		switch (this.type) {
			case "primary":
				result.className = "btn btn-primary";
				break;
			case "success":
				result.className = "btn btn-success";
				break;
			case "danger":
				result.className = "btn btn-danger";
				break;
			case "warning":
				result.className = "btn btn-warning";
				break;
			case "info":
				result.className = "btn btn-info";
				break;
			case "light":
				result.className = "btn btn-light";
				break;
			case "dark":
				result.className = "btn btn-dark";
				break;
			default:
				result.className = "btn btn-primary";
				break;
		}

        if (this.id) {
            result.id = this.id;
        }
        if (this.className) {
            result.className += ' ' + this.className;
        }

        return result.outerHTML;
    }

}
