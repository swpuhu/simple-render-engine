import { Node } from './Node';
import { mat4, vec3 } from 'gl-matrix';


export function travelNode(node: Node, callback?: (node: Node) => void): void {
    callback && callback(node);
    node.children.forEach(item => travelNode(item, callback));
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    // 创建 shader 对象
    const shader = gl.createShader(type);
    // 往 shader 中传入源代码
    gl.shaderSource(shader!, source);
    // 编译 shader
    gl.compileShader(shader!);
    // 判断 shader 是否编译成功
    const success = gl.getShaderParameter(shader!, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    // 如果编译失败，则打印错误信息
    console.log(gl.getShaderInfoLog(shader!));
    gl.deleteShader(shader);
}

function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram | null {
    // 创建 program 对象
    const program = gl.createProgram();
    // 往 program 对象中传入 WebGLShader 对象
    gl.attachShader(program!, vertexShader);
    gl.attachShader(program!, fragmentShader);
    // 链接 program
    gl.linkProgram(program!);
    // 判断 program 是否链接成功
    const success = gl.getProgramParameter(program!, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    // 如果 program 链接失败，则打印错误信息
    console.log(gl.getProgramInfoLog(program!));
    gl.deleteProgram(program);
    return null;
}

export function initWebGL(
    gl: RenderContext,
    vertexSource: string,
    fragmentSource: string
) {
    // 根据源代码创建顶点着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    // 根据源代码创建片元着色器
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    // 创建 WebGLProgram 程序
    const program = createProgram(gl, vertexShader!, fragmentShader!);
    return program;
}

export enum REPEAT_MODE {
    NONE,
    REPEAT,
    MIRRORED_REPEAT,
}

export function createTexture(gl: WebGLRenderingContext, repeat?: REPEAT_MODE) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    let mod: number = gl.CLAMP_TO_EDGE;
    switch (repeat) {
        case REPEAT_MODE.REPEAT:
            mod = gl.REPEAT;
            break;
        case REPEAT_MODE.MIRRORED_REPEAT:
            mod = gl.MIRRORED_REPEAT;
            break;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mod);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mod);
    return texture;
}

export function isMobile(): boolean {
    if (typeof window !== 'undefined' && window.navigator) {
        const userAgent = window.navigator.userAgent;
        return /(mobile)/i.test(userAgent);
    }
    return false;
}

export function clamp(x: number, min: number, max: number) {
    if (x < min) {
        x = min;
    } else if (x > max) {
        x = max;
    }
    return x;
}

export function readLUTCube(file: string): {
    size: number;
    data: number[];
} {
    let lineString = '';
    let isStart = true;
    let size = 0;
    let i = 0;
    let result: number[] = [];
    const processToken = (token: string) => {
        if (token === 'LUT size') {
            i++;
            let sizeStart = false;
            let sizeStr = '';
            while (file[i] !== '\n') {
                if (file[i - 1] === ' ' && /\d/.test(file[i])) {
                    sizeStart = true;
                    sizeStr += file[i];
                } else if (sizeStart) {
                    sizeStr += file[i];
                }
                i++;
            }
            size = +sizeStr;
            result = new Array(size * size * size);
        } else if (token === 'LUT data points') {
            // 读取数据
            i++;
            let numStr = '';
            let count = 0;

            while (i < file.length) {
                if (/\s|\n/.test(file[i])) {
                    result[count++] = +numStr;
                    numStr = '';
                } else if (/\d|\./.test(file[i])) {
                    numStr += file[i];
                }
                i++;
            }
        }
    };

    for (; i < file.length; i++) {
        if (file[i] === '#') {
            isStart = true;
        } else if (isStart && file[i] === '\n') {
            processToken(lineString);
            lineString = '';
            isStart = false;
        } else if (isStart) {
            lineString += file[i];
        }
    }

    return {
        size,
        data: result,
    };
}

export async function loadImage(src: string, img?: HTMLImageElement) {
    return new Promise<HTMLImageElement>(resolve => {
        const imgEle = img || new Image();
        imgEle.src = src;
        imgEle.onload = () => {
            resolve(imgEle);
        };
    });
}

export function compute8ssedt(image: ImageData): number[][] {
    // Initialize distance transform image
    const distImage: number[][] = [];
    for (let i = 0; i < image.height; i++) {
        distImage[i] = [];
        for (let j = 0; j < image.width; j++) {
            distImage[i][j] = 0;
        }
    }

    // Initialize queue for distance transform
    const queue: number[][] = [];
    const data = image.data;
    for (let i = 0; i < image.height; i++) {
        for (let j = 0; j < image.width; j++) {
            const index = (i * image.width + j) * 4;
            if (data[index] == 255) {
                queue.push([i, j]);
            }
        }
    }

    // Compute distance transform
    while (queue.length > 0) {
        const p = queue.shift()!;
        const x = p[0];
        const y = p[1];
        let minDist = Number.MAX_SAFE_INTEGER;
        let minDir = [-1, -1];

        // Compute distance to nearest foreground pixel in 8 directions
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (
                    nx >= 0 &&
                    nx < image.height &&
                    ny >= 0 &&
                    ny < image.width
                ) {
                    const d = distImage[nx][ny] + Math.sqrt(i * i + j * j);
                    if (d < minDist) {
                        minDist = d;
                        minDir = [i, j];
                    }
                }
            }
        }

        // Update distance transform image and queue
        distImage[x][y] = minDist;
        if (minDir[0] != -1 && minDir[1] != -1) {
            const nx = x + minDir[0];
            const ny = y + minDir[1];
            if (distImage[nx][ny] == 0) {
                queue.push([nx, ny]);
            }
        }
    }

    return distImage;
}
// #region createFramebuffer
export function createFramebufferAndTexture(
    gl: WebGLRenderingContext,
    width: number,
    height: number
): [WebGLFramebuffer | null, WebGLTexture | null] {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const texture = createTexture(gl, REPEAT_MODE.NONE);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status === gl.FRAMEBUFFER_COMPLETE) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return [framebuffer, texture];
    }
    return [null, null];
}
// #endregion createFramebuffer

// #region lookat
export function lookAt(cameraPos: vec3, targetPos: vec3): mat4 {
    const z = vec3.create();
    const y = vec3.fromValues(0, 1, 0);
    const x = vec3.create();
    vec3.sub(z, cameraPos, targetPos);
    vec3.normalize(z, z);
    vec3.cross(x, y, z);
    vec3.normalize(x, x);
    vec3.cross(y, z, x);
    vec3.normalize(y, y);

    // prettier-ignore
    return mat4.fromValues(
        x[0], x[1], x[2], 0, 
        y[0], y[1], y[2], 0, 
        z[0], z[1], z[2], 0, 
        cameraPos[0], cameraPos[1], cameraPos[2], 1
    );
}

// #endregion lookat

export function ASSERT(v: any) {
    if (v === void 0 || v === null || isNaN(v)) {
        throw new Error(v + 'is illegal value');
    }
}
const lightAttenuationTable: Record<string, number[]> = {
    '7': [1, 0.7, 1.8],
    '13': [1, 0.35, 0.44],
    '20': [1, 0.22, 0.2],
    '32': [1, 0.14, 0.07],
    '50': [1, 0.09, 0.032],
    '65': [1, 0.07, 0.017],
    '100': [1, 0.045, 0.0075],
    '160': [1, 0.027, 0.0028],
    '200': [1, 0.022, 0.0019],
    '325': [1, 0.014, 0.0007],
    '600': [1, 0.007, 0.0002],
    '3250': [1, 0.0014, 0.000007],
};

// #region attenuation
export function lightAttenuationLookUp(dist: number): number[] {
    const distKeys = Object.keys(lightAttenuationTable);
    const first = +distKeys[0];
    if (dist <= first) {
        return lightAttenuationTable['7'];
    }

    for (let i = 0; i < distKeys.length - 1; i++) {
        const key = distKeys[i];
        const nextKey = distKeys[i + 1];
        if (+key <= dist && dist < +nextKey) {
            const value = lightAttenuationTable[key];
            const nextValue = lightAttenuationTable[nextKey];
            const k = (dist - +key) / (+nextKey - +key);
            const kl = value[1] + (nextValue[1] - value[1]) * k;
            const kq = value[2] + (nextValue[2] - value[2]) * k;
            return [1, kl, kq];
        }
    }

    return lightAttenuationTable['3250'];
}

// #endregion attenuation

// #region lesscode
export type BufferInfo = {
    name: string;
    buffer: WebGLBuffer;
    numComponents: number;
    isIndices?: boolean;
};
export function createBufferInfoFromArrays(
    gl: RenderContext,
    arrays: {
        name: string;
        numComponents: number;
        data: Iterable<number>;
        isIndices?: boolean;
    }[]
): BufferInfo[] {
    const result: BufferInfo[] = [];

    for (let i = 0; i < arrays.length; i++) {
        const buffer = gl.createBuffer();
        if (!buffer) {
            continue;
        }
        result.push({
            name: arrays[i].name,
            buffer: buffer,
            numComponents: arrays[i].numComponents,
            isIndices: arrays[i].isIndices,
        });
        if (arrays[i].isIndices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint32Array(arrays[i].data),
                gl.STATIC_DRAW
            );
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(arrays[i].data),
                gl.STATIC_DRAW
            );
        }
    }
    return result;
}

export type AttributeSetters = Record<string, (bufferInfo: BufferInfo) => void>;
export function createAttributeSetter(
    gl: RenderContext,
    program: WebGLProgram
): AttributeSetters {
    const createAttribSetter = (index: number) => {
        return function (b: BufferInfo) {
            if (!b.isIndices) {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(
                    index,
                    b.numComponents,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
            }
        };
    };
    const attribSetter: AttributeSetters = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
        const attribInfo = gl.getActiveAttrib(program, i);
        if (!attribInfo) {
            break;
        }
        const index = gl.getAttribLocation(program, attribInfo.name);
        attribSetter[attribInfo.name] = createAttribSetter(index);
    }
    return attribSetter;
}

export type UniformSetters = Record<string, (v: any) => void>;
export function createUniformSetters(
    gl: RenderContext,
    program: WebGLProgram
): UniformSetters {
    let textUnit = 0;
    const createUniformSetter = (
        program: WebGLProgram,
        uniformInfo: {
            name: string;
            type: number;
        }
    ): ((v: any) => void) => {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;
        if (type === gl.FLOAT) {
            return function (v: number) {
                gl.uniform1f(location, v);
            };
        } else if (type === gl.FLOAT_VEC2) {
            return function (v: number[]) {
                gl.uniform2fv(location, v);
            };
        } else if (type === gl.FLOAT_VEC3) {
            return function (v: number[]) {
                gl.uniform3fv(location, v);
            };
        } else if (type === gl.FLOAT_VEC4) {
            return function (v: number[]) {
                gl.uniform4fv(location, v);
            };
        } else if (type === gl.FLOAT_MAT2) {
            return function (v: number[]) {
                gl.uniformMatrix2fv(location, false, v);
            };
        } else if (type === gl.FLOAT_MAT3) {
            return function (v: number[]) {
                gl.uniformMatrix3fv(location, false, v);
            };
        } else if (type === gl.FLOAT_MAT4) {
            return function (v: number[]) {
                gl.uniformMatrix4fv(location, false, v);
            };
        } else if (type === gl.SAMPLER_2D) {
            const currentTexUnit = textUnit;
            ++textUnit;
            return function (v: WebGLTexture) {
                gl.uniform1i(location, currentTexUnit);
                gl.activeTexture(gl.TEXTURE0 + currentTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, v);
            };
        }
        return function () {
            throw new Error('cannot find corresponding type of value.');
        };
    };

    const uniformsSetters: UniformSetters = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        if (!uniformInfo) {
            break;
        }
        let name = uniformInfo.name;
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }
        uniformsSetters[uniformInfo.name] = createUniformSetter(
            program,
            uniformInfo
        );
    }
    return uniformsSetters;
}

export function setAttribute(
    attribSetters: AttributeSetters,
    bufferInfos: BufferInfo[]
) {
    for (let i = 0; i < bufferInfos.length; i++) {
        const info = bufferInfos[i];
        const setter = attribSetters[info.name];
        setter && setter(info);
    }
}

export function setUniform(
    uniformSetters: UniformSetters,
    uniforms: Record<string, any>
): void {
    const keys = Object.keys(uniforms);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const v = uniforms[key];

        const setter = uniformSetters[key];
        setter && setter(v);
    }
}

// #endregion lesscode
