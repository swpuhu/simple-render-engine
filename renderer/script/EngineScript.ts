import { Node } from '../Node';

export class EngineScript {
    private __initialized = false;
    public constructor(public node: Node) {}

    public $init(): void {
        this.__initialized = true;
        this.onInit();
    }

    protected onInit(): void {}

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
