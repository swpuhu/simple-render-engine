import { mat4 } from 'gl-matrix';
import { Effect } from '../Effect';
import { BlendFactor } from '../Macro';
import { Material } from '../Material';
import frag from '../shader/solidColor-frag.glsl';
import frag2 from '../shader/solidColor-frag2.glsl';
import vert from '../shader/sprite-vert.glsl';
import { MaterialPropertyEnum } from '../type';

export class SolidColorMaterial extends Material {
    constructor() {
        const unlitEffect = new Effect([
            {
                vert,
                frag,
            },
        ]);
        super(unlitEffect, [
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
            {
                name: 'u_color2',
                value: [1.0, 0.0, 1.0, 0.5],
                type: MaterialPropertyEnum.FLOAT4,
            },
        ]);
    }
}
