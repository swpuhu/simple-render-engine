import { Effect } from '../Effect';
import { BlendFactor } from '../Macro';
import { Material } from '../Material';
import { Texture } from '../Texture';
import frag from '../shader/unlit-frag.glsl';
import vert from '../shader/unlit-vert.glsl';
import { MaterialPropertyEnum } from '../type';

export class UnLitMaterial extends Material {
    constructor(texture: Texture) {
        const unlitEffect = new Effect(vert, frag);
        super(
            unlitEffect,
            [
                {
                    name: 'u_tex',
                    value: texture,
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
            }
        );
    }
}
