import { Material } from '../Material';
import { VertexAssemble2D } from '../VertexAssemble2D';
import { EngineScript } from './EngineScript';

export abstract class AbRenderScript extends EngineScript {
    public abstract assembler: VertexAssemble2D | null;
    public abstract material: Material | null;
}
