import { Session } from "./classes/session"

class App {

    private static contentEntry: string = "content"

    constructor() {
        this.drawData()
        this.main()
    }

    async main(): Promise<void> {
        console.log("Hello World")
    }

    async drawData(): Promise<void> {
        const session = Session.getInstance()
        const contentRoot = <HTMLDivElement>document.getElementById(App.contentEntry)
        const body = document.createElement("div")
        const title = document.createElement("h1")
        const text = document.createElement("p")
        title.innerText = "Hello World"
        text.innerText = session.contentTest
        body.appendChild(title)
        body.appendChild(text)
        contentRoot.appendChild(body)
    }
}

new App();
