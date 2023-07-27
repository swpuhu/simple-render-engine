import { createTexture, loadImage } from './util';

export class Texture {
    private __texture: PossibleNullObject<WebGLTexture> = null;
    private __gl: PossibleNullObject<WebGL2RenderingContext> = null;
    private __compiled = false;
    private __tempImg: HTMLImageElement = new Image();
    private __destroyed = false;

    get texture(): PossibleNullObject<WebGLTexture> {
        return this.__texture;
    }

    get width(): number {
        if (this.__imgData instanceof HTMLImageElement) {
            return this.__imgData.naturalWidth;
        } else if (
            this.__imgData instanceof ImageBitmap ||
            this.__imgData instanceof ImageData ||
            this.__imgData instanceof HTMLCanvasElement ||
            this.__imgData instanceof HTMLVideoElement
        ) {
            return this.__imgData.width;
        }

        return 0;
    }

    get height(): number {
        if (this.__imgData instanceof HTMLImageElement) {
            return this.__imgData.naturalHeight;
        } else if (
            this.__imgData instanceof ImageBitmap ||
            this.__imgData instanceof ImageData ||
            this.__imgData instanceof HTMLCanvasElement ||
            this.__imgData instanceof HTMLVideoElement
        ) {
            return this.__imgData.height;
        }

        return 0;
    }

    constructor(private __imgData?: TexImageSource) {
        if (__imgData instanceof HTMLImageElement) {
        }
    }

    public createTexture(gl: WebGL2RenderingContext) {
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
        if (this.__destroyed) {
            throw new Error('this texture has been destroyed!');
        }
        if (this.__gl) {
            this.__gl.bindTexture(this.__gl.TEXTURE_2D, this.texture);
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

    private __enableMipMap(): void {
        if (this.__gl) {
            this.__gl.generateMipmap(this.__gl.TEXTURE_2D);
            this.__gl.texParameteri(
                this.__gl.TEXTURE_2D,
                this.__gl.TEXTURE_MIN_FILTER,
                this.__gl.NEAREST_MIPMAP_NEAREST
            );
        }
    }

    public async loadTexture(src: string): Promise<void> {
        const img = await loadImage(src, this.__tempImg);
        this.__imgData = img;

        this.setImageData(this.__imgData);
    }

    public destroy(): void {
        if (this.__gl && !this.__destroyed) {
            this.__gl.deleteTexture(this.texture);
            this.__destroyed = true;
        }
    }
}
