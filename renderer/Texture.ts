import { createTexture, loadImage } from './util';

export class Texture {
    private __texture: PossibleNullObject<WebGLTexture> = null;
    private __gl: PossibleNullObject<RenderContext> = null;
    private __compiled = false;

    get texture(): PossibleNullObject<WebGLTexture> {
        return this.__texture;
    }

    constructor(private __imgData?: TexImageSource) {}

    public createTexture(gl: RenderContext) {
        if (this.__compiled) {
            return;
        }
        this.__texture = createTexture(gl);
        this.__gl = gl;
        if (this.__imgData) {
            this.setImageData(this.__imgData);
            this.__compiled = true;
        }
    }

    private setImageData(imgData: TexImageSource): void {
        if (this.__gl) {
            this.__gl.texImage2D(
                this.__gl.TEXTURE_2D,
                0,
                this.__gl.RGBA,
                this.__gl.RGBA,
                this.__gl.UNSIGNED_BYTE,
                imgData
            );
        }
    }

    public async loadTexture(src: string): Promise<void> {
        const img = await loadImage(src);
        this.__imgData = img;
        this.setImageData(this.__imgData);
    }
}
