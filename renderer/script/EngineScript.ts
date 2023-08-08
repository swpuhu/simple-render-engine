import EventEmitter from 'eventemitter3';
import { Node } from '../Node';

export class EngineScript {
    private __initialized = false;
    private __eventEmitter = new EventEmitter();
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
        this.__eventEmitter.removeAllListeners();
    }
    public on(
        event: string,
        fn: (...args: any[]) => void,
        context?: any
    ): void {
        this.__eventEmitter.on(event, fn, context);
    }

    public off(
        event: string,
        fn: (...args: any[]) => void,
        context?: any
    ): void {
        this.__eventEmitter.off(event, fn, context);
    }

    public emit(event: string, ...args: any[]): void {
        this.__eventEmitter.emit(event, ...args);
    }
}
