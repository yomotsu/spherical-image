export declare class Matrix4 {
    private _array;
    constructor();
    extract(): Float32Array;
    identity(): this;
    makeRotationFromEulerXYZ(x: number, y: number, z: number): this;
    perspective(fovy: number, aspect: number, near: number, far: number): this;
}
