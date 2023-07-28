import { mat4 } from 'gl-matrix';
import { DEFAULT_VERT_POS_NAME, DEFAULT_VERT_UV_NAME } from './Enum';
import { Material } from './Material';
import { Node2D } from './Node2D';
import { RenderScript } from './script/RenderScript';

export const MAX_BUFFER_SIZE = 65000;

export class Node2DRenderer {
    private __posBufferView: Float32Array;
    private __uvBufferView: Float32Array;
    private __indexBufferView: Uint32Array;

    private __posBuffer: WebGLBuffer | null;
    private __uvBuffer: WebGLBuffer | null;
    private __indexBuffer: WebGLBuffer | null;

    private __offset = 0;
    private __indexOffset = 0;
    private __currentMaterial: Material | null = null;
    private __projMat: mat4 = mat4.create();

    public get posBufferView(): Float32Array {
        return this.__posBufferView;
    }

    public get uvBufferView(): Float32Array {
        return this.__uvBufferView;
    }

    public get indexBufferView(): Uint32Array {
        return this.__indexBufferView;
    }

    public get offset(): number {
        return this.__offset;
    }

    public get indexOffset(): number {
        return this.__indexOffset;
    }
    public set offset(v: number) {
        this.__offset = v;
    }

    public set indexOffset(v: number) {
        this.__indexOffset = v;
    }

    constructor(private gl: RenderContext) {
        this.__posBufferView = new Float32Array(MAX_BUFFER_SIZE);
        this.__uvBufferView = new Float32Array(MAX_BUFFER_SIZE);
        this.__indexBufferView = new Uint32Array(MAX_BUFFER_SIZE);

        this.__posBuffer = gl.createBuffer();
        if (!this.__posBuffer) {
            throw new Error('create posBuffer failed!');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.__posBufferView, gl.STATIC_DRAW);

        this.__uvBuffer = gl.createBuffer();
        if (!this.__uvBuffer) {
            throw new Error('create uvBuffer failed!');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.__uvBufferView, gl.STATIC_DRAW);

        this.__indexBuffer = gl.createBuffer();
        if (!this.__indexBuffer) {
            throw new Error('create indexBuffer failed!');
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this.__indexBufferView,
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        this.__projMat = this.__getProjMatrix();
    }

    private __getProjMatrix(): mat4 {
        return mat4.ortho(
            this.__projMat,
            0,
            this.gl.canvas.width,
            0,
            this.gl.canvas.height,
            -100,
            100
        );
    }

    private __updateData(): void {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.__posBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.__posBufferView);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.__uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.__uvBufferView);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this.__indexBufferView);
    }

    private __bindVertexInfo(): void {
        if (!this.__currentMaterial) {
            return;
        }
        const gl = this.gl;

        const vertPosName = DEFAULT_VERT_POS_NAME;
        const vertUVName = DEFAULT_VERT_UV_NAME;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__posBuffer);
        let layoutIndex = this.__currentMaterial.effect.attribs[vertPosName];
        if (layoutIndex !== void 0) {
            gl.vertexAttribPointer(layoutIndex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(layoutIndex);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.__uvBuffer);
        layoutIndex = this.__currentMaterial.effect.attribs[vertUVName];
        if (layoutIndex !== void 0) {
            gl.vertexAttribPointer(layoutIndex, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(layoutIndex);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);
    }

    private __bindMaterialParams(): void {
        const gl = this.gl;
        if (!this.__currentMaterial) {
            return;
        }
        this.__currentMaterial.use();
        this.__currentMaterial.setPipelineState(gl);

        this.__currentMaterial.setProperty('u_proj', this.__projMat);
        this.__currentMaterial.setProperties();
    }

    public render(renderScript: RenderScript) {
        if (!renderScript.material || !renderScript.assembler) {
            return;
        }
        if (!this.__currentMaterial) {
            this.__currentMaterial = renderScript.material;
        }
        if (
            this.__currentMaterial !== null &&
            this.__currentMaterial !== renderScript.material
        ) {
            this.batchRender();
            this.__currentMaterial = renderScript.material;
        }

        const [newOffset, newIndexOffset] = renderScript.assembler?.uploadData(
            this.__posBufferView,
            this.__uvBufferView,
            this.__indexBufferView,
            this.__offset,
            this.__indexOffset
        );
        this.__offset = newOffset;
        this.__indexOffset = newIndexOffset;
    }

    public batchRender(): void {
        if (!this.__currentMaterial) {
            return;
        }
        const gl = this.gl;

        if (!this.__currentMaterial.effect.compiled) {
            this.__currentMaterial.effect.compile(gl);
        }

        this.__updateData();
        this.__bindVertexInfo();
        this.__bindMaterialParams();
        const vertexCount = this.__indexOffset;
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_INT, 0);
        this.__offset = 0;
        this.__indexOffset = 0;
        this.__currentMaterial = null;
    }
}
