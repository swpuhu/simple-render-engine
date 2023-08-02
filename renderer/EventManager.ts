import { vec2 } from 'gl-matrix';
import { Scene } from './Scene';
import { postOrderTravelNodes } from './util';
import { Node2D } from './Node2D';
import { Event, TouchEvent } from './Event';

export class EventManager {
    private __domWidth = 0;
    private __domHeight = 0;

    private __touchEvent = new TouchEvent();
    private __scene: Scene | null = null;
    constructor(private canvas: HTMLCanvasElement) {
        this.__handleMouseDown = this.__handleMouseDown.bind(this);
        this.__handleBrowserEvents();
    }

    public init(): void {
        this.__domWidth = this.canvas.clientWidth;
        this.__domHeight = this.canvas.clientHeight;
    }

    public setScene(scene: Scene) {
        this.__scene = scene;
    }

    private __handleBrowserEvents(): void {
        this.canvas.addEventListener(
            'mousedown',
            this.__handleMouseDown as EventListener
        );
    }

    private __handleMouseEvents(
        e: MouseEvent,
        cb: (x: number, y: number) => Event
    ): void {
        if (!this.__scene) {
            return;
        }

        const x = (e.offsetX / this.__domWidth) * this.canvas.width;
        const y =
            ((this.__domHeight - e.offsetY) / this.__domHeight) *
            this.canvas.height;
        const syntheticEvent = cb(x, y);
        // syntheticEvent.$setPosition(x, y);
        if (this.__scene) {
            let tempVec2 = vec2.create();
            postOrderTravelNodes(this.__scene, node => {
                if (node instanceof Node2D) {
                    vec2.set(tempVec2, x, y);
                    const hitted = node.$hitTest(tempVec2);
                    if (hitted) {
                        node.propagateEvent(syntheticEvent);
                    }
                    return !hitted;
                }
                return true;
            });
        }
    }

    private __handleMouseDown(e: MouseEvent): void {
        this.__handleMouseEvents(e, (x: number, y: number) => {
            const syntheticEvent = this.__touchEvent;
            syntheticEvent.eventName = Event.TOUCH_START;
            syntheticEvent.$setPosition(x, y);
            syntheticEvent.$setTouchStartPosition(x, y);
            return syntheticEvent;
        });
    }

    public destroy(): void {
        this.canvas.removeEventListener(
            'mousedown',
            this.__handleMouseDown as EventListener
        );
    }
}
