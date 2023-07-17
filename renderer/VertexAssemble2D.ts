import { mat3, vec3 } from 'gl-matrix';
import { Node2D } from './Node2D';
import { EngineScript } from './script/EngineScript';

export class VertexAssemble2D extends EngineScript {
    private __tempVec3: vec3 = vec3.create();
    private __node: Node2D | null = null;

    public setNode(node: Node2D) {
        this.__node = node;
    }

    public uploadData(
        posBufferView: Float32Array,
        uvBufferView: Float32Array,
        indexBufferView: Uint16Array,
        offset: number,
        indexOffset: number
    ): number[] {
        if (!this.__node) {
            return [offset, indexOffset];
        }
        const worldMat = this.__node.getWorldMat();
        const minX = this.__node.x - this.__node.width * this.__node.anchorX;
        const minY = this.__node.y - this.__node.height * this.__node.anchorY;
        const maxX =
            this.__node.x + this.__node.width * (1 - this.__node.anchorX);
        const maxY =
            this.__node.y + this.__node.height * (1 - this.__node.anchorY);
        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(minX, minY, 0),
            worldMat
        );
        const lb = vec3.clone(this.__tempVec3);
        vec3.transformMat4(lb, lb, worldMat);

        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(maxX, minY, 0),
            worldMat
        );
        const rb = vec3.clone(this.__tempVec3);
        vec3.transformMat4(rb, rb, worldMat);

        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(minX, maxY, 0),
            worldMat
        );
        const lt = vec3.clone(this.__tempVec3);
        vec3.transformMat4(lt, lt, worldMat);

        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(maxX, maxY, 0),
            worldMat
        );
        const rt = vec3.clone(this.__tempVec3);
        vec3.transformMat4(rt, rt, worldMat);

        posBufferView.set(lb, offset);
        uvBufferView.set([0, 0], offset);

        posBufferView.set(rb, offset + 3);
        uvBufferView.set([1, 0], offset);

        posBufferView.set(lt, offset + 6);
        uvBufferView.set([0, 1], offset);

        posBufferView.set(rt, offset + 9);
        uvBufferView.set([1, 1], offset);

        const indices = [0, 1, 2, 2, 1, 3].map(i => i + indexOffset);
        indexBufferView.set(indices);

        return [offset + 12, indexOffset + 6];
    }
}
