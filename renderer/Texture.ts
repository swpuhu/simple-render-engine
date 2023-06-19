import { createTexture, loadImage } from '../util';

export class Texture {
    public texture: PossibleNullObject<WebGLTexture> = null;
    constructor(protected gl: RenderContext, imgData?: TexImageSource) {
        this.texture = createTexture(gl);
        if (imgData) {
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                imgData
            );
        }
    }

    async loadTexture(src: string): Promise<void> {
        const img = await loadImage(src);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            img
        );
    }
}
