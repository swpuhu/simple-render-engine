import { mat4 } from 'gl-matrix';
import { Node } from './Node';

export class Camera extends Node {
    private __viewInvMat: mat4 = mat4.create();
    private __projMat: mat4 = mat4.create();
    constructor(
        asp: number,
        fov: number,
        near: number,
        far: number,
        name = ''
    ) {
        super(name);
        mat4.perspective(this.__projMat, fov, asp, near, far);
    }

    public getViewInvMat(): mat4 {
        mat4.invert(this.__viewInvMat, this.getWorldMat());
        return this.__viewInvMat;
    }

    public getProjMat(): mat4 {
        return this.__projMat;
    }
}
