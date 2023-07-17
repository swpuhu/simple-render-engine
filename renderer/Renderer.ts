import { Node2DRenderer } from './Node2DRenderer';
import { Scene } from './Scene';

export class Renderer {
    private __node2DRenderer: Node2DRenderer | null = null;
    constructor(private gl: RenderContext) {
        this.__node2DRenderer = new Node2DRenderer(gl);
    }

    render(scene: Scene): void {
        const meshes = scene.getAllMesh();
        const cameras = scene.getCameras();

        for (let i = 0; i < meshes.length; i++) {
            meshes[i].render(this.gl, cameras[0]);
        }

        const render2DObj = scene.get2DRenderObject();
        if (!this.__node2DRenderer) {
            return;
        }
        for (let i = 0; i < render2DObj.length; i++) {
            render2DObj[i].assembler?.uploadData();
        }
    }
}
