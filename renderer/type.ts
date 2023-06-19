import { Texture } from './Texture';

export enum MaterialPropertyEnum {
    FLOAT,
    FLOAT2,
    FLOAT3,
    FLOAT4,
    MATRIX2,
    MATRIX3,
    MATRIX4,
    SAMPLER_2D,
    SAMPLER_CUBE,
}

type FloatType = {
    type: MaterialPropertyEnum.FLOAT;
    value: number;
};

type Float2Type = {
    type: MaterialPropertyEnum.FLOAT2;
    value: number[];
};
type Float3Type = {
    type: MaterialPropertyEnum.FLOAT3;
    value: number[];
};
type Float4Type = {
    type: MaterialPropertyEnum.FLOAT4;
    value: number[];
};
type Matrix2Type = {
    type: MaterialPropertyEnum.MATRIX2;
    value: number[];
};

type Matrix3Type = {
    type: MaterialPropertyEnum.MATRIX3;
    value: number[];
};

type Matrix4Type = {
    type: MaterialPropertyEnum.MATRIX4;
    value: number[];
};

type Sampler2DType = {
    type: MaterialPropertyEnum.SAMPLER_2D;
    value: Texture;
};

export type MaterialPropertyType = (
    | FloatType
    | Float2Type
    | Float3Type
    | Float4Type
    | Matrix2Type
    | Matrix3Type
    | Matrix4Type
    | Sampler2DType
) & {
    name: string;
};

type DepthStencilState = {
    depthTest: boolean;
    depthWrite: boolean;
};

type BlendState = {
    blend: boolean;
    blendSrc: number;
    blendDst: number;
};

type CullMode = 'front' | 'back' | 'none';

export type PipeLineStateType = {
    depthStencilState: DepthStencilState;
    blendState: BlendState;
    cullMode: CullMode;
};
