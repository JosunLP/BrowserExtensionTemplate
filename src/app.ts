class App {

    private static contentEntry: string = "content"

    constructor() {
        this.drawData()
        this.main()
    }

    async main(): Promise<void> {
        
    }

    async drawData(): Promise<void> {
        const contentRoot = <HTMLDivElement>document.getElementById(App.contentEntry)
        const body = document.createElement("div")
        const title = document.createElement("h1")
        title.innerText = "Hello World"
        body.appendChild(title)
        contentRoot.appendChild(body)
    }
}

new App();