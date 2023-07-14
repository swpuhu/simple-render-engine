export class EngineScript {
    private constructor() {}

    protected onLoad(): void {}

    protected onStart(): void {}

    protected onDestroy(): void {}

    protected update(dt: number) {}

    public load(): void {
        this.onLoad();
    }

    public destroy(): void {
        this.onDestroy();
    }
}
