import { Vector3 } from './Vector3';
export declare class Quaternion {
    private _array;
    constructor(x?: number, y?: number, z?: number, w?: number);
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
    extract(): Float32Array;
    setFromEuler(x: number, y: number, z: number, order: string): this;
    setFromAxisAngle(axis: Vector3, angle: number): this;
    multiply(q: Quaternion): this;
    multiplyQuaternions(a: Quaternion, b: Quaternion): this;
}
