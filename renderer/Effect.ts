import { ASSERT, initWebGL } from '../util';

type UniformInfoType = {
    type: number;
    name: string;
    location: PossibleNullObject<WebGLUniformLocation>;
    texIndex?: number;
};

export class Effect {
    public program: PossibleNullObject<WebGLProgram> = null;
    private uniformsMap: UniformInfoType[] = [];
    private attribsMap: Record<string, number> = {};
    private textureCount = 0;
    private _gl: PossibleNullObject<RenderContext> = null;
    private _compiled = false;
    constructor(private vertString: string, private fragString: string) {}

    get compiled(): boolean {
        return this._compiled;
    }

    get gl(): PossibleNullObject<RenderContext> {
        return this._gl;
    }

    get attribs(): Record<string, number> {
        return this.attribsMap;
    }

    public compile(_gl: RenderContext): void {
        this._compiled = true;
        this._gl = _gl;
        this.program = initWebGL(_gl, this.vertString, this.fragString);

        if (!this.program) {
            throw new Error('Shader程序初始化失败！');
        }
        _gl.useProgram(this.program);
        const uniformNums: number = _gl.getProgramParameter(
            this.program,
            _gl.ACTIVE_UNIFORMS
        );
        for (let i = 0; i < uniformNums; i++) {
            const info = _gl.getActiveUniform(this.program, i);
            if (!info) {
                continue;
            }
            const uniformInfo: UniformInfoType = {
                type: info.type,
                name: info.name,
                location: _gl.getUniformLocation(this.program, info.name),
            };
            if (info.type === _gl.SAMPLER_2D) {
                uniformInfo.texIndex = this.textureCount++;
            }
            this.uniformsMap.push(uniformInfo);
        }

        const attribNums = _gl.getProgramParameter(
            this.program,
            _gl.ACTIVE_ATTRIBUTES
        );
        for (let i = 0; i < attribNums; i++) {
            const attrib = _gl.getActiveAttrib(this.program, i);
            if (attrib) {
                this.attribsMap[attrib.name] = i;
            }
        }
    }

    public setProperty(name: string, value: any): void {
        const uniform = this.uniformsMap.find(item => item.name === name);
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
                gl.bindTexture(gl.TEXTURE_2D, value.texture);
                gl.uniform1i(uniform.location, uniform.texIndex!);
                break;
        }
    }

    public use(): void {
        if (!this._gl) {
            return;
        }
        this._gl.useProgram(this.program);
    }
}
