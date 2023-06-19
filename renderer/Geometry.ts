import { BUILT_IN_NORMAL, BUILT_IN_POSITION, BUILT_IN_UV } from './common';

export type VertexAttribType = {
    name: string;
    array: ArrayBufferView;
};

export class Geometry {
    static getPlane(): Geometry {
        // prettier-ignore
        const vertPos = [
            -1, -1, -1,
            1, -1, -1,
            1, 1, -1,
            -1, 1, -1
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

    constructor(
        public vertAttrib: {
            positions: VertexAttribType;
            indices: Uint32Array;
            normals?: VertexAttribType;
            uvs?: VertexAttribType;
        }
    ) {}

    get count(): number {
        return this.vertAttrib.indices.length;
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
}
