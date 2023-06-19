import { Scene } from './Scene';

export class Renderer {
    constructor(private gl: RenderContext) {}

    render(scene: Scene): void {
        const meshes = scene.getAllMesh();
        const cameras = scene.getCameras();
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].render(this.gl, cameras[0]);
        }
    }
}
