import { Vector3 } from './Vector3';
import { Quaternion } from './Quaternion';
export declare class Matrix4 {
    private _array;
    constructor();
    extract(): Float32Array;
    identity(): this;
    multiplyMatrices(a: Matrix4, b: Matrix4): this;
    makeRotationFromEulerXYZ(x: number, y: number, z: number): this;
    makeRotationFromQuaternion(q: Quaternion): this;
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    perspective(fovy: number, aspect: number, near: number, far: number): this;
}
