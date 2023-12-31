import { mat4 } from 'gl-matrix';
import { Effect } from '../Effect';
import { BlendFactor } from '../Macro';
import { Material } from '../Material';
import frag from '../shader/solidColor-frag.glsl';
import vert from '../shader/sprite-vert.glsl';
import { MaterialPropertyEnum } from '../type';

export class SolidColorMaterial extends Material {
    constructor() {
        const unlitEffect = new Effect(vert, frag);
        super(
            unlitEffect,
            [
                {
                    name: 'u_proj',
                    value: mat4.create(),
                    type: MaterialPropertyEnum.MATRIX4,
                },
                {
                    name: 'u_color',
                    value: [1, 1, 1, 1],
                    type: MaterialPropertyEnum.FLOAT4,
                },
            ],
            {
                blendState: {
                    blend: true,
                    blendSrc: BlendFactor.SRC_ALPHA,
                    blendDst: BlendFactor.ONE_MINUS_SRC_ALPHA,
                },
                depthStencilState: {
                    depthTest: false,
                    depthWrite: false,
                },
            }
        );
    }
}
