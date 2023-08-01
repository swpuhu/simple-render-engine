import { Texture } from '../Texture';
import { VertexAssemble2D } from '../VertexAssemble2D';
import { SolidColorMaterial } from '../material/SolidColorMaterial';
import { RenderScript } from './RenderScript';

export class SolidColor extends RenderScript {
    public onInit(): void {
        this.assembler = new VertexAssemble2D(this.node);
        // this.material = new SolidColorMaterial();
    }

    setColor(r: number, g: number, b: number, a: number) {
        this.material?.setProperty('u_color', [r, g, b, a]);
    }

    protected onDestroy(): void {
        this.material?.destroy();
    }
}
