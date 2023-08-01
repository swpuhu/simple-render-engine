import { mat3, vec3 } from 'gl-matrix';
import { Node2D } from './Node2D';
import { EngineScript } from './script/EngineScript';

export class VertexAssemble2D extends EngineScript {
    private __tempVec3: vec3 = vec3.create();

    public uploadData(
        posBufferView: Float32Array,
        uvBufferView: Float32Array,
        indexBufferView: Uint32Array,
        offset: number,
        indexOffset: number
    ): number[] {
        if (!this.node || !(this.node instanceof Node2D)) {
            return [offset, indexOffset];
        }
        const worldMat = this.node.getWorldMat();
        const minX = -this.node.width * this.node.anchorX;
        const minY = -this.node.height * this.node.anchorY;
        const maxX = this.node.width * (1 - this.node.anchorX);
        const maxY = this.node.height * (1 - this.node.anchorY);
        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(minX, minY, 0),
            worldMat
        );
        const lb = vec3.clone(this.__tempVec3);

        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(maxX, minY, 0),
            worldMat
        );
        const rb = vec3.clone(this.__tempVec3);

        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(minX, maxY, 0),
            worldMat
        );
        const lt = vec3.clone(this.__tempVec3);

        vec3.transformMat4(
            this.__tempVec3,
            vec3.fromValues(maxX, maxY, 0),
            worldMat
        );
        const rt = vec3.clone(this.__tempVec3);

        const oIndex = offset;
        posBufferView.set(lb, oIndex * 3);
        uvBufferView.set([0, 0], oIndex * 2);

        posBufferView.set(rb, (oIndex + 1) * 3);
        uvBufferView.set([1, 0], (oIndex + 1) * 2);

        posBufferView.set(lt, (oIndex + 2) * 3);
        uvBufferView.set([0, 1], (oIndex + 2) * 2);

        posBufferView.set(rt, (oIndex + 3) * 3);
        uvBufferView.set([1, 1], (oIndex + 3) * 2);

        const indices = [0, 1, 2, 2, 1, 3].map(i => i + offset);
        indexBufferView.set(indices, indexOffset);

        return [offset + 4, indexOffset + 6];
    }
}
