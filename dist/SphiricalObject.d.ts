import { EventDispatcher } from './EventDispatcher';
export declare type BaseTexture = HTMLImageElement | HTMLCanvasElement;
export declare class SphiricalObject extends EventDispatcher {
    private _baseTexture;
    constructor(textureSource: string | HTMLCanvasElement);
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
    readonly baseTexture: BaseTexture;
    updateTexture(textureSource: string | HTMLCanvasElement): void;
}
