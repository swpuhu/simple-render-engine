import { Mesh } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Geometry } from './Geometry';
import { BUILT_IN_NORMAL, BUILT_IN_POSITION, BUILT_IN_UV } from './common';

export class ObjLoader {
    private loader: OBJLoader = new OBJLoader();
    constructor() {}

    public load(url: string): Promise<Geometry> {
        return new Promise(resolve => {
            this.loader.load(url, group => {
                group.traverse(obj => {
                    if (obj instanceof Mesh) {
                        const geo = obj.geometry;
                        const attrs = geo.attributes;
                        const pos =
                            (attrs.position &&
                                attrs.position.array.copyWithin()) ||
                            [];
                        const normal =
                            (attrs.normal && attrs.normal.array.copyWithin()) ||
                            [];
                        const uv =
                            (attrs.uv && attrs.uv.array.copyWithin()) || [];
                        const indices = new Uint32Array(pos.length / 3);
                        for (let i = 0; i < indices.length; i++) {
                            indices[i] = i;
                        }
                        resolve(
                            new Geometry({
                                positions: {
                                    name: BUILT_IN_POSITION,
                                    array: pos,
                                },
                                uvs: {
                                    name: BUILT_IN_UV,
                                    array: uv,
                                },
                                normals: {
                                    name: BUILT_IN_NORMAL,
                                    array: normal,
                                },
                                indices: indices,
                            })
                        );
                    }
                });
            });
        });
    }
}
