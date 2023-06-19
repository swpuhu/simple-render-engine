import { Camera } from './Camera';
import { Mesh } from './Mesh';
import { Node } from './Node';
import { travelNode } from './util';

export class Scene extends Node {
    getAllMesh(): Mesh[] {
        const meshes: Mesh[] = [];
        travelNode(this, node => {
            if (node.mesh) {
                meshes.push(node.mesh);
            }
        });

        return meshes;
    }

    getCameras(): Camera[] {
        const cameras: Camera[] = [];
        travelNode(this, node => {
            if (node instanceof Camera) {
                cameras.push(node);
            }
        });
        return cameras;
    }
}
