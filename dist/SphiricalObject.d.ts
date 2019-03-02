import { EventDispatcher } from './EventDispatcher';
export declare type BaseTexture = HTMLImageElement | HTMLCanvasElement;
interface Attributes {
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
}
export declare class SphiricalObject extends EventDispatcher {
    baseTexture: BaseTexture;
    attributes: Attributes;
    constructor(textureSource: string | HTMLCanvasElement);
    updateTexture(textureSource: string | HTMLCanvasElement): void;
}
export {};
