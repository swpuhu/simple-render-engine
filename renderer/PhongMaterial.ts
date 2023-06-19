import { Effect } from './Effect';
import { Material } from './Material';
import frag from '../renderer/shader/11-light-frag.glsl';
import vert from '../renderer/shader/11-light-vert.glsl';
import { MaterialPropertyEnum } from './type';

export class PhongMaterial extends Material {
    constructor(diffuse = [0.5, 0.5, 0.5], specular = [1, 1, 1]) {
        const phongEffect = new Effect(vert, frag);
        super(
            phongEffect,
            [
                {
                    name: 'u_gloss',
                    value: 80,
                    type: MaterialPropertyEnum.FLOAT,
                },
                {
                    name: 'u_diffuse',
                    value: diffuse,
                    type: MaterialPropertyEnum.FLOAT3,
                },
                {
                    name: 'u_specular',
                    value: specular,
                    type: MaterialPropertyEnum.FLOAT3,
                },
            ],
            {
                depthStencilState: {
                    depthTest: true,
                    depthWrite: true,
                },
            }
        );
    }
}
