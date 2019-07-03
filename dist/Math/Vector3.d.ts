export declare class Vector3 {
    private _array;
    constructor(x?: number, y?: number, z?: number);
    readonly x: number;
    readonly y: number;
    readonly z: number;
    extract(): Float32Array;
}
