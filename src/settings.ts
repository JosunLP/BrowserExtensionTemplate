import { Session } from "./classes/session";
import { BasicButton } from "./components/button";

class Settings {

    private session = Session.getInstance();

    constructor() {
        this.renderSettings();
    }

    private async renderSettings(): Promise<void> {
        const settings = <HTMLDivElement>document.getElementById('settings');
		const saveButton = new BasicButton('success', 'Save', 'saveSettings').render();
        settings.innerHTML = `
            <div class="form-group">
				<label for="contentTest">Content Test</label>
                <input type="text" class="form-control text-input" id="contentTest" placeholder="Enter content test" value="${this.session.contentTest}">
            </div>
        `;
		settings.innerHTML += saveButton;

        const saveSettings = <HTMLButtonElement>document.getElementById('saveSettings');
        saveSettings.addEventListener('click', () => {
            this.session.contentTest = (<HTMLInputElement>document.getElementById('contentTest')).value;
            Session.save();
            Session.reloadSession();
        });
    }
}

new Settings();
