import { Texture } from '../Texture';
import { TextureCache } from '../TextureCache';
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
        this.material = new SpriteDefaultMaterial();
    }

    public async setURL(url: string): Promise<void> {
        const texture = await TextureCache.getTexture(url);
        if (texture) {
            this.__texture = texture;
            this.material?.setProperty('u_tex', this.__texture);
        }
    }

    protected onDestroy(): void {
        this.material?.destroy();
    }
}
