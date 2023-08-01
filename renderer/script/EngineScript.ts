import { Node } from '../Node';

export class EngineScript {
    private __initialized = false;
    public constructor(public node: Node) {}

    public $init(): void {
        if (this.__initialized) {
            return;
        }
        this.__initialized = true;
        this.onInit();
    }

    protected onInit(): void {}

    protected onLoad(): void {
        this.$init();
    }

    protected onStart(): void {}

    protected onDestroy(): void {}

    protected onUpdate(dt: number) {}

    public load(): void {
        this.onLoad();
    }

    public update(dt: number): void {
        this.onUpdate(dt);
    }

    public destroy(): void {
        this.onDestroy();
    }
}
