import _ from 'lodash';
import { Texture } from './Texture';
import { PipeLineStateType } from './type';
import { ASSERT, initWebGL } from './util';
import { BlendFactor } from './Macro';

const defaultPipelineConfig: PipeLineStateType = {
    cullMode: 'back',
    depthStencilState: {
        depthTest: true,
        depthWrite: true,
    },
    blendState: {
        blend: false,
        blendSrc: BlendFactor.SRC_ALPHA,
        blendDst: BlendFactor.ONE_MINUS_SRC_ALPHA,
    },
};
type UniformInfoType = {
    type: number;
    name: string;
    location: PossibleNullObject<WebGLUniformLocation>;
    texIndex?: number;
    programIndex: number;
};

type AttribInfoType = {
    name: string;
    location: number;
    programIndex: number;
};

type ShaderString = {
    vert: string;
    frag: string;
    pipelineState?: Partial<PipeLineStateType>;
};

type Shader = {
    vert: WebGLShader;
    frag: WebGLShader;
    program: WebGLProgram;
    pipelineState: Partial<PipeLineStateType>;
};

export class Effect {
    private uniformsMap: UniformInfoType[] = [];
    private attribsMap: AttribInfoType[] = [];
    private textureCount = 0;
    private _gl: PossibleNullObject<RenderContext> = null;
    private _compiled = false;
    private __vertexShader: WebGLShader | null = null;
    private __fragmentShader: WebGLShader | null = null;
    private __shaders: Shader[] = [];
    constructor(private shaderSrcs: ShaderString[]) {}

    get compiled(): boolean {
        return this._compiled;
    }

    get gl(): PossibleNullObject<RenderContext> {
        return this._gl;
    }

    get passes(): number {
        return this.__shaders.length;
    }
    public compile(_gl: RenderContext): void {
        this._compiled = true;
        this._gl = _gl;
        for (let i = 0; i < this.shaderSrcs.length; i++) {
            const [vertexShader, fragShader, program] = initWebGL(
                _gl,
                this.shaderSrcs[i].vert,
                this.shaderSrcs[i].frag
            );

            if (!program) {
                throw new Error('Shader程序初始化失败！');
            }

            const pipelineState = _.merge(
                defaultPipelineConfig,
                this.shaderSrcs[i].pipelineState || {}
            );
            this.__shaders.push({
                vert: vertexShader,
                frag: fragShader,
                program: program,
                pipelineState: pipelineState,
            });

            _gl.useProgram(program);
            const uniformNums: number = _gl.getProgramParameter(
                program,
                _gl.ACTIVE_UNIFORMS
            );
            for (let j = 0; j < uniformNums; j++) {
                const info = _gl.getActiveUniform(program, j);
                if (!info) {
                    continue;
                }
                const uniformInfo: UniformInfoType = {
                    type: info.type,
                    name: info.name,
                    location: _gl.getUniformLocation(program, info.name),
                    programIndex: i,
                };
                if (info.type === _gl.SAMPLER_2D) {
                    uniformInfo.texIndex = this.textureCount++;
                }
                this.uniformsMap.push(uniformInfo);
            }

            const attribNums = _gl.getProgramParameter(
                program,
                _gl.ACTIVE_ATTRIBUTES
            );
            for (let j = 0; j < attribNums; j++) {
                const attrib = _gl.getActiveAttrib(program, j);
                if (attrib) {
                    this.attribsMap.push({
                        location: j,
                        name: attrib.name,
                        programIndex: i,
                    });
                }
            }
        }
    }

    public getAttribLayoutIndex(name: string, passIndex = 0): number {
        for (let i = 0; i < this.attribsMap.length; i++) {
            if (
                this.attribsMap[i].name === name &&
                this.attribsMap[i].programIndex === passIndex
            ) {
                return this.attribsMap[i].location;
            }
        }
        return -1;
    }

    public setProperty(name: string, value: any, passIndex: number): void {
        if (value === void 0 || value === null) {
            return;
        }
        const uniform = this.uniformsMap.find(
            item => item.name === name && item.programIndex === passIndex
        );
        if (!uniform) {
            return;
        }
        if (!this._gl) {
            return;
        }
        const gl = this._gl;

        switch (uniform.type) {
            case gl.FLOAT:
                gl.uniform1f(uniform.location, value);
                break;
            case gl.FLOAT_VEC2:
                gl.uniform2fv(uniform.location, value);
                break;
            case gl.FLOAT_VEC3:
                gl.uniform3fv(uniform.location, value);
                break;
            case gl.FLOAT_VEC4:
                gl.uniform4fv(uniform.location, value);
                break;
            case gl.FLOAT_MAT2:
                gl.uniformMatrix2fv(uniform.location, false, value);
                break;
            case gl.FLOAT_MAT3:
                gl.uniformMatrix3fv(uniform.location, false, value);
                break;
            case gl.FLOAT_MAT4:
                gl.uniformMatrix4fv(uniform.location, false, value);
                break;
            case gl.SAMPLER_2D:
                ASSERT(uniform.texIndex);
                gl.activeTexture(gl.TEXTURE0 + uniform.texIndex!);
                if (value instanceof Texture) {
                    value.createTexture(gl);
                }
                gl.bindTexture(gl.TEXTURE_2D, value.texture);
                gl.uniform1i(uniform.location, uniform.texIndex!);
                break;
        }
    }

    public setPipelineState(gl: RenderContext, passIndex: number): void {
        const pipelineState = this.__shaders[passIndex].pipelineState;
        if (pipelineState.cullMode === 'none') {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
            if (pipelineState.cullMode === 'back') {
                gl.cullFace(gl.BACK);
            } else {
                gl.cullFace(gl.FRONT);
            }
        }

        if (pipelineState.depthStencilState!.depthTest) {
            gl.enable(gl.DEPTH_TEST);
            if (pipelineState.depthStencilState?.depthFunc !== void 0) {
                gl.depthFunc(pipelineState.depthStencilState?.depthFunc);
            }
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
        if (pipelineState.depthStencilState!.depthWrite) {
            gl.depthMask(true);
        } else {
            gl.depthMask(false);
        }

        if (pipelineState.blendState!.blend) {
            gl.enable(gl.BLEND);
            gl.blendFunc(
                pipelineState.blendState!.blendSrc,
                pipelineState.blendState!.blendDst
            );
        } else {
            gl.disable(gl.BLEND);
        }
    }

    public use(passIndex: number): void {
        if (!this._gl) {
            return;
        }
        this._gl.useProgram(this.__shaders[passIndex].program);
    }

    public destroy(): void {
        if (this._gl && this.__vertexShader && this.__fragmentShader) {
            for (let i = 0; i < this.__shaders.length; i++) {
                this._gl.deleteProgram(this.__shaders[i].program);
                this._gl.deleteShader(this.__shaders[i].vert);
                this._gl.deleteShader(this.__shaders[i].frag);
            }
        }
    }
}
