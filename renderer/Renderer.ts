import { MAX_BUFFER_SIZE, Node2DRenderer } from './Node2DRenderer';
import { Scene } from './Scene';
import { SizeInterface } from './util';

export class Renderer {
    private __node2DRenderer: Node2DRenderer | null = null;
    constructor(private gl: RenderContext, designedSize: SizeInterface) {
        this.__node2DRenderer = new Node2DRenderer(gl, designedSize);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
    }

    render(scene: Scene): void {
        const meshes = scene.getAllMesh();
        const cameras = scene.getCameras();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].render(this.gl, cameras[0]);
        }

        const render2DObj = scene.get2DRenderObject();
        if (!this.__node2DRenderer) {
            return;
        }

        this.gl.disable(this.gl.DEPTH_TEST);

        for (let i = 0; i < render2DObj.length; i++) {
            this.__node2DRenderer.render(render2DObj[i]);
        }
        this.__node2DRenderer.batchRender();
    }
}
