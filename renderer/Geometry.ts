import * as _ from 'lodash';

import { BUILT_IN_NORMAL, BUILT_IN_POSITION, BUILT_IN_UV } from './common';
import { vec3 } from 'gl-matrix';

export type VertexAttribType = {
    name: string;
    array: ArrayBufferView;
};

export class Geometry {
    static getQuad(width: number = 1, height: number = 1): Geometry {
        // prettier-ignore
        const vertPos = [
            -width / 2, -height / 2, -1,
            width / 2, -height / 2, -1,
            width / 2, height / 2, -1,
            -width / 2, height / 2, -1
        ]
        const uvPos = [0, 0, 1, 0, 1, 1, 0, 1];
        const indices = [0, 1, 2, 2, 3, 0];
        return new Geometry({
            positions: {
                name: BUILT_IN_POSITION,
                array: new Float32Array(vertPos),
            },
            uvs: {
                name: BUILT_IN_UV,
                array: new Float32Array(uvPos),
            },
            indices: new Uint32Array(indices),
        });
    }

    static getCube(size = 1): Geometry {
        const halfSize = size / 2;
        // prettier-ignore
        const vertPos = [
            -halfSize, -halfSize, halfSize,
            halfSize, -halfSize, halfSize,
            halfSize, halfSize, halfSize,
            -halfSize, halfSize, halfSize,

            -halfSize, -halfSize, -halfSize,
            halfSize, -halfSize, -halfSize,
            halfSize, halfSize, -halfSize,
            -halfSize, halfSize, -halfSize,

            -halfSize, halfSize, halfSize,
            halfSize, halfSize, halfSize,
            halfSize, halfSize, -halfSize,
            -halfSize, halfSize, -halfSize,

            -halfSize, -halfSize, halfSize,
            halfSize, -halfSize, halfSize,
            halfSize, -halfSize, -halfSize,
            -halfSize, -halfSize, -halfSize,

            -halfSize, -halfSize, halfSize,
            -halfSize, -halfSize, -halfSize,
            -halfSize, halfSize, -halfSize,
            -halfSize, halfSize, halfSize,

            halfSize, -halfSize, halfSize,
            halfSize, -halfSize, -halfSize,
            halfSize, halfSize, -halfSize,
            halfSize, halfSize, halfSize,

        ]
        // prettier-ignore
        const uvPos = [
            0, 0,
            1, 0,
            1, 1,
            0, 1,

            0, 0,
            1, 0,
            1, 1,
            0, 1,

            0, 0,
            1, 0,
            1, 1,
            0, 1,

            0, 0,
            1, 0,
            1, 1,
            0, 1,

            0, 0,
            1, 0,
            1, 1,
            0, 1,

            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ];

        // prettier-ignore
        const normalPos = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
        ]
        const indices = [0, 1, 2, 2, 3, 0];
        let temp = indices.slice();
        for (let i = 0; i < 5; i++) {
            temp = temp.map(item => item + 4);
            indices.push(...temp);
        }

        return new Geometry({
            positions: {
                name: BUILT_IN_POSITION,
                array: new Float32Array(vertPos),
            },
            uvs: {
                name: BUILT_IN_UV,
                array: new Float32Array(uvPos),
            },
            normals: {
                name: BUILT_IN_NORMAL,
                array: new Float32Array(normalPos),
            },
            indices: new Uint32Array(indices),
        });
    }

    private __posIsDirty = false;
    private __normalIsDirty = false;
    private __uvIsDirty = false;
    private __xRange = 0;
    private __yRange = 0;
    constructor(
        public vertAttrib: {
            positions: VertexAttribType;
            indices: Uint32Array;
            normals?: VertexAttribType;
            uvs?: VertexAttribType;
        }
    ) {
        this.__computeRange();
    }

    get count(): number {
        return this.vertAttrib.indices.length;
    }

    get posIsDirty(): boolean {
        return this.__posIsDirty;
    }

    get normalIsDirty(): boolean {
        return this.__normalIsDirty;
    }

    get uvIsDirty(): boolean {
        return this.__uvIsDirty;
    }

    get xRange(): number {
        return this.__xRange;
    }

    get yRange(): number {
        return this.__yRange;
    }

    private __computeRange(): void {
        let pos: vec3 = vec3.create();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const array = this.vertAttrib.positions.array as Float32Array;
        for (let i = 0; i < array.length; i += 3) {
            vec3.set(pos, array[i], array[i + 1], array[i + 2]);
            if (pos[0] < minX) {
                minX = pos[0];
            } else if (pos[0] > maxX) {
                maxX = pos[0];
            }
            if (pos[1] < minY) {
                minY = pos[1];
            } else if (pos[1] > maxY) {
                maxY = pos[1];
            }
        }

        this.__xRange = maxX - minX;
        this.__yRange = maxY - minY;
    }

    public hasNormal(): boolean {
        return (
            !!this.vertAttrib.normals &&
            !!this.vertAttrib.normals.array.byteLength
        );
    }

    public hasUV(): boolean {
        return !!this.vertAttrib.uvs && !!this.vertAttrib.uvs.array.byteLength;
    }

    public setPosData(array: ArrayBufferView): void {
        this.__posIsDirty = true;
        this.vertAttrib.positions.array = _.cloneDeep(array);
        this.__computeRange();
    }

    public setUVData(uv: VertexAttribType): void {
        this.__uvIsDirty = true;
        this.vertAttrib.uvs = uv;
    }

    public setNormalData(normal: VertexAttribType): void {
        this.__posIsDirty = true;
        this.vertAttrib.normals = normal;
    }

    public copyFrom(geo: Geometry) {
        this.vertAttrib = _.cloneDeep(geo.vertAttrib);
        this.__computeRange();
    }
}
