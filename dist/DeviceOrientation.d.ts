import { EventDispatcher } from './EventDispatcher';
import { Quaternion } from './Math/Quaternion';
export declare class DeviceOrientation extends EventDispatcher {
    offsetAlpha: number;
    offsetBeta: number;
    offsetGamma: number;
    destroy: () => void;
    private _quaternion;
    private _deviceOrientation;
    private _screenOrientation;
    constructor();
    readonly quaternion: Quaternion;
    readonly alpha: number;
    readonly beta: number;
    readonly gamma: number;
    calibrate(): void;
}
