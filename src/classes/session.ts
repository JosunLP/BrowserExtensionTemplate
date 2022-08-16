export class Session {

    private static instance: Session;

    private constructor() {
    }

    static getInstance() {
        if (!Session.instance && !Session.load()) {
            Session.instance = new Session();
        }
        if (!Session.instance && Session.load()) {
            Session.instance = <Session>Session.load();
        }
        Session.save();
        return Session.instance;
    }

    public static save() {
        localStorage.setItem('session', JSON.stringify(this.instance));
    }

    public static load(): Session | null {
        const session = localStorage.getItem('session');
        if (session) {
            const obj = <Session>JSON.parse(session);
            const result = new Session();
            result.contentTest = obj.contentTest;
            return result;
        }
        return null;
    }

    public static reloadSession() {
        const session = localStorage.getItem('session');
        if (session) {
            const obj = <Session>JSON.parse(session);
            const result = new Session();
            result.contentTest = obj.contentTest;
            Session.instance = result;
        }
    }

    public static resetSession() {
        localStorage.removeItem('session');
        sessionStorage.removeItem('session');
        this.instance = new Session();
        Session.save();
        location.reload();
    }

    public readonly sessionId: string = crypto.randomUUID();

    public contentTest: string = 'This is a simple example of a web application';
}