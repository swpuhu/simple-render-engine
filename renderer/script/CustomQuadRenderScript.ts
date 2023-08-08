import { VertexAssemble2D } from '../VertexAssemble2D';
import { RenderScript } from './RenderScript';

export class CustomQuadRenderScript extends RenderScript {
    public onInit(): void {
        this.assembler = new VertexAssemble2D(this.node);
        // this.material = new SolidColorMaterial();
    }

    protected onDestroy(): void {
        this.material?.destroy();
    }
}
