import { vec2, vec3 } from 'gl-matrix';
import { Node } from './Node';
import { Event } from './Event';

export class Node2D extends Node {
    private __anchor: vec2 = vec2.fromValues(0.5, 0.5);

    public get anchorX(): number {
        return this.__anchor[0];
    }
    public get anchorY(): number {
        return this.__anchor[1];
    }

    public get width(): number {
        const geo = this.mesh?.geometry;
        if (geo) {
            return geo.xRange;
        }
        return 0;
    }

    public get height(): number {
        const geo = this.mesh?.geometry;
        if (geo) {
            return geo.yRange;
        }
        return 0;
    }
    public $hitTest(pointWorldPos: vec2): boolean {
        vec3.zero(this._tempVec3);
        const worldPos = this.convertToWorldSpace(this._tempVec3);
        const wL = worldPos[0] - this.width * this.anchorX;
        const wR = worldPos[1] + this.width * (1 - this.anchorX);
        const wB = worldPos[0] - this.height * this.anchorY;
        const wT = worldPos[1] + this.height * this.anchorY;
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
        this.parent.propagateEvent(e);
    }
}
