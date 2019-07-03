import { EventDispatcher } from './EventDispatcher';
import { Matrix4 } from './Math/Matrix4';
export declare type TextureSource = string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
export declare type BaseTexture = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
export declare class SphereMesh extends EventDispatcher {
    private _baseTexture;
    private _modelMatrix;
    constructor(textureSource: TextureSource, offsetPhi: number, offsetTheta: number);
    readonly attributes: {
        index: {
            array: Uint16Array;
            itemSize: number;
            numItems: number;
        };
        position: {
            array: Float32Array;
            itemSize: number;
            numItems: number;
        };
        normal: {
            array: Float32Array;
            itemSize: number;
            numItems: number;
        };
        textureCoord: {
            array: Float32Array;
            itemSize: number;
            numItems: number;
        };
    };
    readonly modelMatrix: Matrix4;
    readonly baseTexture: BaseTexture;
    rotateTo(phi?: number, theta?: number): void;
    updateTexture(textureSource: TextureSource): void;
}
