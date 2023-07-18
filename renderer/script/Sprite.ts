import { Texture } from '../Texture';
import { VertexAssemble2D } from '../VertexAssemble2D';
import { SpriteDefaultMaterial } from '../material/SpriteDefaultMaterial';
import { RenderScript } from './RenderScript';

export class Sprite extends RenderScript {
    private __texture: Texture | null = null;
    public get rawWidth(): number {
        if (!this.__texture) {
            return 0;
        }
        return this.__texture.width;
    }

    public get rawHeight(): number {
        if (!this.__texture) {
            return 0;
        }
        return this.__texture.height;
    }

    public onInit(): void {
        this.__texture = new Texture();
        this.assembler = new VertexAssemble2D(this.node);
        this.material = new SpriteDefaultMaterial(this.__texture);
    }

    public async setURL(url: string): Promise<void> {
        if (!this.__texture) {
            return;
        }
        return this.__texture.loadTexture(url);
    }
}
