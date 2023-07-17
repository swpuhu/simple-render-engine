const MAX_BUFFER_SIZE = 65000;

export class Node2DRenderer {
    private __posBufferView: Float32Array;
    private __uvBufferView: Float32Array;
    private __indexBufferView: Uint16Array;

    private __posBuffer: WebGLBuffer | null;
    private __uvBuffer: WebGLBuffer | null;
    private __indexBuffer: WebGLBuffer | null;

    private __offset = 0;
    private __indexOffset = 0;
    constructor(private gl: RenderContext) {
        this.__posBufferView = new Float32Array(MAX_BUFFER_SIZE);
        this.__uvBufferView = new Float32Array(MAX_BUFFER_SIZE);
        this.__indexBufferView = new Uint16Array(MAX_BUFFER_SIZE);

        this.__posBuffer = gl.createBuffer();
        if (!this.__posBuffer) {
            throw new Error('create posBuffer failed!');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.__posBufferView, gl.DYNAMIC_DRAW);

        this.__uvBuffer = gl.createBuffer();
        if (!this.__uvBuffer) {
            throw new Error('create uvBuffer failed!');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.__uvBufferView, gl.DYNAMIC_DRAW);

        this.__indexBuffer = gl.createBuffer();
        if (!this.__indexBuffer) {
            throw new Error('create indexBuffer failed!');
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this.__indexBufferView,
            gl.DYNAMIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    private __batchRender(): void {}

    public render(): void {}
}
