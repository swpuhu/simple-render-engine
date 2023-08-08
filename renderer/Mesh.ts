import { Camera } from './Camera';
import { Geometry } from './Geometry';
import { BEFORE_DRAW_CALL, globalEvent } from './GlobalEvent';
import { Material } from './Material';
import { Node } from './Node';
import { Node2D } from './Node2D';
import {
    BUILT_IN_CAMERA_POS,
    BUILT_IN_LIGHT_DIR,
    BUILT_IN_PROJ,
    BUILT_IN_VIEW_INV,
} from './common';

export class Mesh {
    private __destroyed = false;
    private vertexBuffer: WebGLBuffer | null = null;
    private normalBuffer: WebGLBuffer | null = null;
    private indicesBuffer: WebGLBuffer | null = null;
    private uvBuffer: WebGLBuffer | null = null;
    private _dataUploaded = false;
    private __gl: RenderContext | null = null;
    private __globalEventManager = globalEvent;
    constructor(
        protected _geometry: Geometry,
        protected _material: Material,
        protected _node: Node
    ) {
        if (_node instanceof Node2D) {
            throw new Error('node2D is not allowed mounted to Mesh');
        }
        _node.setMesh(this);
    }

    get geometry(): Geometry {
        return this._geometry;
    }

    get dataUploaded(): boolean {
        return this._dataUploaded;
    }

    private __updateData(gl: RenderContext): void {
        if (this._geometry.posIsDirty) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferSubData(
                gl.ARRAY_BUFFER,
                0,
                this._geometry.vertAttrib.positions.array
            );
        }

        if (this._geometry.normalIsDirty) {
            if (this._geometry.hasNormal()) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
                gl.bufferSubData(
                    gl.ARRAY_BUFFER,
                    0,
                    this._geometry.vertAttrib.normals!.array
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }

        if (this._geometry.uvIsDirty) {
            if (this._geometry.hasUV()) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
                gl.bufferSubData(
                    gl.ARRAY_BUFFER,
                    0,
                    this._geometry.vertAttrib.uvs!.array
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }
    }

    private __uploadData(gl: RenderContext): void {
        this.__gl = gl;
        this._dataUploaded = true;
        this.vertexBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
        this.indicesBuffer = gl.createBuffer();
        if (!this.vertexBuffer || !this.normalBuffer || !this.uvBuffer) {
            throw new Error('WebGLBuffer初始化失败！');
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this._geometry.vertAttrib.positions.array,
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (this._geometry.hasNormal()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                this._geometry.vertAttrib.normals!.array,
                gl.STATIC_DRAW
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        if (this._geometry.hasUV()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                this._geometry.vertAttrib.uvs!.array,
                gl.STATIC_DRAW
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this._geometry.vertAttrib.indices,
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    private bindMaterialParams(gl: RenderContext): void {
        if (!gl) {
            return;
        }
        this._material.setPipelineState(gl);

        this._material.setProperty('u_world', this._node.getWorldMat());
        this._material.setProperties();
    }

    private bindVertexInfo(gl: RenderContext): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        let vertName = this._geometry.vertAttrib.positions.name;
        let layoutIndex = this._material.effect.attribs[vertName];
        if (layoutIndex !== void 0) {
            gl.vertexAttribPointer(layoutIndex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(layoutIndex);
        }

        if (this._geometry.hasNormal()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            vertName = this._geometry.vertAttrib.normals!.name;
            layoutIndex = this._material.effect.attribs[vertName];
            if (layoutIndex !== void 0) {
                gl.vertexAttribPointer(layoutIndex, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(layoutIndex);
            }
        }

        if (this._geometry.hasUV()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            vertName = this._geometry.vertAttrib.uvs!.name;
            layoutIndex = this._material.effect.attribs[vertName];
            if (layoutIndex !== void 0) {
                gl.vertexAttribPointer(layoutIndex, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(layoutIndex);
            }
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    }

    private bindCameraParams(camera: Camera): void {
        const projMat = camera.getProjMat();
        const viewInvMat = camera.getViewInvMat();
        const worldPos = camera.convertToWorldSpace({
            x: 0,
            y: 0,
            z: 0,
        });

        this._material.setProperty(BUILT_IN_PROJ, projMat);
        this._material.setProperty(BUILT_IN_VIEW_INV, viewInvMat);
        this._material.setProperty(BUILT_IN_CAMERA_POS, worldPos);
        this._material.setProperty(BUILT_IN_LIGHT_DIR, [-1, -0.4, -1]);
        this._material.setProperties();
    }

    public render(gl: RenderContext, camera: Camera): void {
        this._material.use();

        if (!this.dataUploaded) {
            this.__uploadData(gl);
        } else {
            this.__updateData(gl);
        }

        if (!this._material.effect.compiled) {
            this._material.effect.compile(gl);
        }

        this.bindVertexInfo(gl);

        this.bindCameraParams(camera);

        this.bindMaterialParams(gl);

        const vertexCount = this._geometry.count;
        this.__globalEventManager.emit(BEFORE_DRAW_CALL);
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_INT, 0);
    }

    public destroy(): void {
        if (!this.__gl || this.__destroyed) {
            return;
        }
        if (this.vertexBuffer) {
            this.__gl.deleteBuffer(this.vertexBuffer);
        }
        if (this.uvBuffer) {
            this.__gl.deleteBuffer(this.uvBuffer);
        }

        if (this.normalBuffer) {
            this.__gl.deleteBuffer(this.normalBuffer);
        }

        if (this.indicesBuffer) {
            this.__gl.deleteBuffer(this.indicesBuffer);
        }

        this.__destroyed = true;
    }
}
