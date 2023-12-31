import { render } from 'vue';
import { Camera } from './Camera';
import { Mesh } from './Mesh';
import { Node } from './Node';
import { Node2D } from './Node2D';
import { RenderScript } from './script/RenderScript';
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

    get2DRenderObject(): RenderScript[] {
        const renderObj: RenderScript[] = [];
        travelNode(this, node => {
            if (node instanceof Node2D) {
                const renderComp = node.getScript(RenderScript);
                if (renderComp) {
                    renderObj.push(renderComp);
                }
            }
        });

        return renderObj;
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
