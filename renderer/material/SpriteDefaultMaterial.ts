import { mat4 } from 'gl-matrix';
import { Effect } from '../Effect';
import { BlendFactor } from '../Macro';
import { Material } from '../Material';
import { Texture } from '../Texture';
import frag from '../shader/sprite-frag.glsl';
import vert from '../shader/sprite-vert.glsl';
import { MaterialPropertyEnum } from '../type';

export class SpriteDefaultMaterial extends Material {
    constructor(texture?: Texture) {
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
                    name: 'u_tex',
                    value: texture ? texture : undefined,
                    type: MaterialPropertyEnum.SAMPLER_2D,
                },
                {
                    name: 'u_texTransform',
                    value: [0, 0, 1, 1],
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
                cullMode: 'none',
            }
        );
    }
}
