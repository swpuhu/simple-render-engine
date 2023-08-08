import { vec2 } from 'gl-matrix';
import { Scene } from './Scene';
import { isActive, postOrderTravelNodes } from './util';
import { Node2D } from './Node2D';
import { Event, TouchEvent } from './Event';
import { globalEvent } from './GlobalEvent';

export class EventManager {
    private static __eventManager: EventManager | null = null;
    static getInstance(): EventManager {
        if (this.__eventManager) {
            return this.__eventManager;
        }
        this.__eventManager = new EventManager();
        return this.__eventManager;
    }
    private __domWidth = 0;
    private __domHeight = 0;

    private __touchEvent = new TouchEvent();
    private __scene: Scene | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private __eventsMap: Record<string | symbol, Node2D[]> | null = {};
    private __mouseIsDown = false;
    private __globalEvent = globalEvent;

    private constructor() {
        this.__handleMouseDown = this.__handleMouseDown.bind(this);
        this.__handleMouseMove = this.__handleMouseMove.bind(this);
        this.__handleMouseUp = this.__handleMouseUp.bind(this);
    }

    public init(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.__domWidth = this.canvas.clientWidth;
        this.__domHeight = this.canvas.clientHeight;
        this.__handleBrowserEvents();
    }

    public setScene(scene: Scene) {
        this.__scene = scene;
    }

    private __handleBrowserEvents(): void {
        if (!this.canvas) {
            return;
        }
        this.canvas.addEventListener(
            'mousedown',
            this.__handleMouseDown as EventListener
        );

        this.canvas.addEventListener(
            'mousemove',
            this.__handleMouseMove as EventListener
        );

        this.canvas.addEventListener(
            'mouseup',
            this.__handleMouseUp as EventListener
        );
    }

    private __handleMouseEvents(
        nativeEvent: MouseEvent,
        eventName: string,
        cb: (x: number, y: number) => Event
    ): void {
        if (!this.__scene || !this.canvas || !this.__eventsMap) {
            return;
        }

        const x = (nativeEvent.offsetX / this.__domWidth) * this.canvas.width;
        const y =
            ((this.__domHeight - nativeEvent.offsetY) / this.__domHeight) *
            this.canvas.height;
        const syntheticEvent = cb(x, y);

        const events = this.__globalEvent.getEventCallback(eventName);
        if (events) {
            events.forEach(event => {
                event.func.call(event.context, syntheticEvent);
            });
        }
        // syntheticEvent.$setPosition(x, y);
        if (this.__scene) {
            let tempVec2 = vec2.create();
            const eventNodes = this.__eventsMap[eventName];
            if (!eventNodes) {
                return;
            }
            for (let i = 0; i < eventNodes.length; i++) {
                const node = eventNodes[i];
                if (node instanceof Node2D && isActive(node)) {
                    vec2.set(tempVec2, x, y);
                    const hitted = node.$hitTest(tempVec2);
                    if (hitted) {
                        node.propagateEvent(syntheticEvent);
                    }
                }
            }
        }
    }

    private __handleMouseDown(e: MouseEvent): void {
        this.__touchEvent.eventName = Event.TOUCH_START;
        this.__mouseIsDown = true;
        this.__handleMouseEvents(
            e,
            this.__touchEvent.eventName,
            (x: number, y: number) => {
                const syntheticEvent = this.__touchEvent;
                syntheticEvent.$setPosition(x, y);
                syntheticEvent.$setTouchStartPosition(x, y);
                return syntheticEvent;
            }
        );
    }

    private __handleMouseMove(e: MouseEvent): void {
        if (!this.__mouseIsDown) {
            return;
        }
        this.__touchEvent.eventName = Event.TOUCHING;
        const startPos = this.__touchEvent.$getTouchStartPosition();
        this.__handleMouseEvents(
            e,
            this.__touchEvent.eventName,
            (x: number, y: number) => {
                const syntheticEvent = this.__touchEvent;
                const deltaX = x - startPos.x;
                const deltaY = y - startPos.y;
                syntheticEvent.$setPosition(x, y);
                syntheticEvent.$setDelta(deltaX, deltaY);
                return syntheticEvent;
            }
        );
    }

    private __handleMouseUp(e: MouseEvent): void {
        if (!this.__mouseIsDown) {
            return;
        }
        this.__touchEvent.eventName = Event.TOUCH_END;
        const startPos = this.__touchEvent.$getTouchStartPosition();
        this.__handleMouseEvents(
            e,
            this.__touchEvent.eventName,
            (x: number, y: number) => {
                const syntheticEvent = this.__touchEvent;
                const deltaX = x - startPos.x;
                const deltaY = y - startPos.y;
                syntheticEvent.$setPosition(x, y);
                syntheticEvent.$setDelta(deltaX, deltaY);
                return syntheticEvent;
            }
        );

        this.__mouseIsDown = false;
    }

    public destroy(): void {
        if (!this.canvas) {
            return;
        }
        this.canvas.removeEventListener(
            'mousedown',
            this.__handleMouseDown as EventListener
        );
        this.canvas.removeEventListener(
            'mousemove',
            this.__handleMouseMove as EventListener
        );
        this.canvas.removeEventListener(
            'mouseup',
            this.__handleMouseUp as EventListener
        );
    }

    public on(eventName: string | symbol, node: Node2D) {
        if (!this.__eventsMap) {
            return;
        }
        if (!this.__eventsMap[eventName]) {
            this.__eventsMap[eventName] = [];
        }
        this.__eventsMap[eventName].push(node);
    }
}
