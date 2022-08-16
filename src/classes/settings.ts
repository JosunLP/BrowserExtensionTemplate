import { Session } from "./session.js";

class Settings {

    private session = Session.getInstance();

    constructor() {
        this.renderSettings();
    }

    private async renderSettings(): Promise<void> {
        const settings = <HTMLDivElement>document.getElementById('settings');
        settings.innerHTML = `
            <div class="form-group">
                <label for="contentTest">Content Test</label>
                <input type="text" class="form-control" id="contentTest" placeholder="Enter content test" value="${this.session.contentTest}">
            </div>
            <button type="button" class="btn btn-primary" id="saveSettings">Save</button>
        `;
        const saveSettings = <HTMLButtonElement>document.getElementById('saveSettings');
        saveSettings.addEventListener('click', () => {
            this.session.contentTest = (<HTMLInputElement>document.getElementById('contentTest')).value;
            Session.save();
            Session.reloadSession();
        });
    }
}

new Settings();