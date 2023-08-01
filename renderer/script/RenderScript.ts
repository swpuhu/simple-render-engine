import { Material } from '../Material';
import { VertexAssemble2D } from '../VertexAssemble2D';
import { AbRenderScript } from './AbRenderScript';

export class RenderScript extends AbRenderScript {
    public assembler: VertexAssemble2D | null = null;
    public material: Material | null = null;

    setMaterial(material: Material) {
        this.material = material;
    }
}
