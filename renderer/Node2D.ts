import { mat4, vec2, vec3 } from 'gl-matrix';
import { Node } from './Node';
import { Event } from './Event';
import { VertexAssemble2D } from './VertexAssemble2D';
import { RectInterface, Vec2Interface, Vec3Interface, clamp } from './util';
import { Node2DOptions } from './script/util';
import { EventManager } from './EventManager';

export class Node2D extends Node {
    private __anchor: vec2 = vec2.fromValues(0.5, 0.5);
    private __assembler: PossibleNullObject<VertexAssemble2D> = null;
    private __width: number = 0;
    private __height: number = 0;
    private __rotation: number = 0;

    public get anchorX(): number {
        return this.__anchor[0];
    }
    public get anchorY(): number {
        return this.__anchor[1];
    }
    public set anchorX(v: number) {
        this.__anchor[0] = clamp(v, 0, 1);
    }
    public set anchorY(v: number) {
        this.__anchor[1] = clamp(v, 0, 1);
    }

    public get width(): number {
        return this.__width;
    }

    public set width(v: number) {
        this.__width = v;
    }

    public get height(): number {
        return this.__height;
    }

    public set height(v: number) {
        this.__height = v;
    }

    public get rotation(): number {
        return this.__rotation;
    }

    public set rotation(v: number) {
        this.__rotation = v;
        this._updateLocalMat();
    }

    public get position(): Vec2Interface {
        return {
            x: this.translate.x,
            y: this.translate.y,
        };
    }

    constructor(name: string, options?: Node2DOptions) {
        super(name);
        if (options) {
            this.__width = options.width || 0;
            this.__height = options.height || 0;
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.anchorX = options.anchorX !== void 0 ? options.anchorX : 0.5;
            this.anchorY = options.anchorY !== void 0 ? options.anchorY : 0.5;
            this.rotation = options.rotation || 0;
        }
    }

    protected _updateLocalMat(): void {
        this._localMat = mat4.translate(this._localMat, this._tempIdentityMat, [
            this.translate.x,
            this.translate.y,
            this.translate.z,
        ]);
        mat4.rotateZ(this._localMat, this._localMat, this.__rotation);
        this._updateWorldMat();
    }

    public $hitTest(pointWorldPos: vec2): boolean {
        vec3.zero(this._tempVec3);
        const worldPos = this.convertToWorldSpace({
            x: this._tempVec3[0],
            y: this._tempVec3[1],
            z: this._tempVec3[2],
        });
        const wL = worldPos.x - this.width * this.anchorX;
        const wR = worldPos.x + this.width * (1 - this.anchorX);
        const wB = worldPos.y - this.height * this.anchorY;
        const wT = worldPos.y + this.height * (1 - this.anchorY);
        if (
            pointWorldPos[0] >= wL &&
            pointWorldPos[0] <= wR &&
            pointWorldPos[1] >= wB &&
            pointWorldPos[1] <= wT
        ) {
            return true;
        }
        return false;
    }

    public propagateEvent(e: Event) {
        this.emit(e.eventName, e);
        if (!this.parent || !(this.parent instanceof Node2D)) {
            return;
        }
        if (e.allowPropagation) {
            this.parent.propagateEvent(e);
        }
    }

    public on(
        event: string | symbol,
        fn: (...args: any[]) => void,
        context?: any
    ): this {
        const eventManager = EventManager.getInstance();
        eventManager.on(event, this);
        super.on(event, fn, context);
        return this;
    }

    public off<T extends string | symbol>(
        event: T,
        fn: (...args: any[]) => void,
        context?: any
    ): this {
        super.off(event, fn, context);
        return this;
    }

    public getRect(): RectInterface {
        return {
            x: -this.width * this.anchorX,
            y: -this.height * this.anchorY,
            width: this.width,
            height: this.height,
        };
    }

    public getWorldRect(): RectInterface {
        const rect = this.getRect();
        const worldLB = this.convertToWorldSpace({ x: rect.x, y: rect.y });
        const wolrdRT = this.convertToWorldSpace({
            x: rect.x + rect.width,
            y: rect.y + rect.height,
        });
        return {
            x: worldLB.x,
            y: worldLB.y,
            width: wolrdRT.x - worldLB.x,
            height: wolrdRT.y - worldLB.y,
        };
    }
}
