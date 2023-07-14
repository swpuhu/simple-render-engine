import { vec2 } from 'gl-matrix';

export abstract class Event {
    static TOUCH = 'touchEvent';
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
    public eventName = Event.TOUCH;
    private __position: vec2 = vec2.create();

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
}
