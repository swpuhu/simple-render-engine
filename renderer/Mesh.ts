import { Camera } from './Camera';
import { Geometry } from './Geometry';
import { Material } from './Material';
import { Node } from './Node';
import {
    BUILT_IN_CAMERA_POS,
    BUILT_IN_LIGHT_DIR,
    BUILT_IN_PROJ,
    BUILT_IN_VIEW_INV,
} from './common';

export class Mesh {
    private vertexBuffer: WebGLBuffer | null = null;
    private normalBuffer: WebGLBuffer | null = null;
    private indicesBuffer: WebGLBuffer | null = null;
    private uvBuffer: WebGLBuffer | null = null;
    private _dataUploaded = false;
    constructor(
        protected geometry: Geometry,
        protected material: Material,
        protected node: Node
    ) {
        node.setMesh(this);
    }

    get dataUploaded(): boolean {
        return this._dataUploaded;
    }

    private uploadData(gl: RenderContext): void {
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
            this.geometry.vertAttrib.positions.array,
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (this.geometry.hasNormal()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                this.geometry.vertAttrib.normals!.array,
                gl.STATIC_DRAW
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        if (this.geometry.hasUV()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                this.geometry.vertAttrib.uvs!.array,
                gl.STATIC_DRAW
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this.geometry.vertAttrib.indices,
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    private bindMaterialParams(gl: RenderContext): void {
        if (!gl) {
            return;
        }
        this.material.setPipelineState(gl);
        this.material.setProperties();

        this.material.effect.setProperty('u_world', this.node.getWorldMat());
    }

    private bindVertexInfo(gl: RenderContext): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        let vertName = this.geometry.vertAttrib.positions.name;
        let layoutIndex = this.material.effect.attribs[vertName];
        if (layoutIndex !== void 0) {
            gl.vertexAttribPointer(layoutIndex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(layoutIndex);
        }

        if (this.geometry.hasNormal()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            vertName = this.geometry.vertAttrib.normals!.name;
            layoutIndex = this.material.effect.attribs[vertName];
            if (layoutIndex !== void 0) {
                gl.vertexAttribPointer(layoutIndex, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(layoutIndex);
            }
        }

        if (this.geometry.hasUV()) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            vertName = this.geometry.vertAttrib.uvs!.name;
            layoutIndex = this.material.effect.attribs[vertName];
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

        this.material.setProperty(BUILT_IN_PROJ, projMat);
        this.material.setProperty(BUILT_IN_VIEW_INV, viewInvMat);
        const worldPos = camera.convertToWorldSpace([0, 0, 0]);
        this.material.setProperty(BUILT_IN_CAMERA_POS, worldPos);
        this.material.setProperty(BUILT_IN_LIGHT_DIR, [-1, -0.4, -1]);
    }

    render(gl: RenderContext, camera: Camera): void {
        this.material.use();

        if (!this.dataUploaded) {
            this.uploadData(gl);
        }

        if (!this.material.effect.compiled) {
            this.material.effect.compile(gl);
        }

        this.bindVertexInfo(gl);

        this.bindCameraParams(camera);

        this.bindMaterialParams(gl);

        const vertexCount = this.geometry.count;
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_INT, 0);
    }
}
