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
        name?: string
    );
    constructor(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number,
        name?: string
    );
    constructor(
        arg1: number,
        arg2: number,
        arg3: number,
        arg4: number,
        arg5?: number | string,
        arg6?: number,
        arg7?: string
    ) {
        super(arg7 ? arg7 : typeof arg5 === 'string' ? arg5 : '');
        if (arg6 && arg7) {
            // 正交相机
            const near = typeof arg5 === 'number' ? arg5 : 0;
            mat4.ortho(this.__projMat, arg1, arg2, arg3, arg4, near, arg6);
        } else {
            mat4.perspective(this.__projMat, arg2, arg1, arg3, arg4);
        }
    }

    public getViewInvMat(): mat4 {
        mat4.invert(this.__viewInvMat, this.getWorldMat());
        return this.__viewInvMat;
    }

    public getProjMat(): mat4 {
        return this.__projMat;
    }
}
