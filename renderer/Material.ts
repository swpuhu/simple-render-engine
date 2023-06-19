import * as _ from 'lodash';
import { Effect } from './Effect';
import { BlendMacro } from './glMacro';
import { MaterialPropertyType, PipeLineStateType } from './type';

const defaultPipelineConfig: PipeLineStateType = {
    cullMode: 'back',
    depthStencilState: {
        depthTest: true,
        depthWrite: true,
    },
    blendState: {
        blend: false,
        blendSrc: BlendMacro.SRC_ALPHA,
        blendDst: BlendMacro.ONE_MINUS_SRC_ALPHA,
    },
};
export class Material {
    constructor(
        public effect: Effect,
        protected properties: MaterialPropertyType[] = [],
        protected pipelineState: Partial<PipeLineStateType> = {}
    ) {
        if (this.pipelineState) {
            this.pipelineState = _.merge(
                defaultPipelineConfig,
                this.pipelineState
            );
        }
    }

    get program(): PossibleNullObject<WebGLProgram> {
        return this.effect.program;
    }

    public setPipelineState(gl: RenderContext): void {
        if (this.pipelineState.cullMode === 'none') {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
            if (this.pipelineState.cullMode === 'back') {
                gl.cullFace(gl.BACK);
            } else {
                gl.cullFace(gl.FRONT);
            }
        }

        if (this.pipelineState.depthStencilState!.depthTest) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
        if (this.pipelineState.depthStencilState!.depthWrite) {
            gl.depthMask(true);
        } else {
            gl.depthMask(false);
        }

        if (this.pipelineState.blendState!.blend) {
            gl.enable(gl.BLEND);
            gl.blendFunc(
                this.pipelineState.blendState!.blendSrc,
                this.pipelineState.blendState!.blendDst
            );
        } else {
            gl.disable(gl.BLEND);
        }
    }

    public setProperty(name: string, value: any): void {
        this.effect.setProperty(name, value);
    }

    public setProperties(): void {
        for (let i = 0; i < this.properties.length; i++) {
            const prop = this.properties[i];
            this.effect.setProperty(prop.name, prop.value);
        }
    }

    public use(): void {
        this.effect.use();
    }
}
