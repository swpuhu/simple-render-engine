import { Node } from '../Node';

export class EngineScript {
    public constructor(public node: Node) {
        this.afterConstructor();
    }

    protected afterConstructor(): void {}

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
