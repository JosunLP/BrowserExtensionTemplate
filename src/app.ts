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
        const body = new HTMLDivElement()
        const title = new HTMLHeadingElement()
        title.innerText = "Hello World"
        body.appendChild(title)
        contentRoot.appendChild(body)
    }
}

new App();