import { Texture } from '../Texture';
import { VertexAssemble2D } from '../VertexAssemble2D';
import { RenderScript } from './RenderScript';

export class Sprite extends RenderScript {
    private __texture: Texture | null = null;

    protected afterConstructor(): void {
        this.__texture = new Texture();
        this.assembler = new VertexAssemble2D(this.node);
    }

    public setURL(url: string): void {
        if (!this.__texture) {
            return;
        }
        this.__texture.loadTexture(url);
    }
}
