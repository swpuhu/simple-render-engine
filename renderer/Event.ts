import { vec2 } from 'gl-matrix';

export abstract class Event {
    // static TOUCH = 'touchEvent';
    static TOUCH_START = 'touch_start';
    static TOUCHING = 'touching';
    static TOUCH_END = 'touch_end';
    protected __allowPropagation = true;
    public abstract eventName: string;

    public get allowPropagation(): boolean {
        return this.__allowPropagation;
    }
    public stopPropagation(): void {
        this.__allowPropagation = false;
    }
}

export class TouchEvent extends Event {
    public eventName = '';
    private __position: vec2 = vec2.create();
    private __startPosition: vec2 = vec2.create();

    public get position(): vec2 {
        return this.__position;
    }

    public get x(): number {
        return this.__position[0];
    }

    public get y(): number {
        return this.__position[1];
    }

    public $setPosition(x: number, y: number) {
        this.__position[0] = x;
        this.__position[1] = y;
    }

    public $setTouchStartPosition(x: number, y: number) {
        this.__startPosition[0] = x;
        this.__startPosition[1] = y;
    }
}
