import { TextureSource } from './SphereMesh';
interface Options {
    offsetAzimuth?: number;
    offsetAltitude?: number;
}
export declare class SphericalImage {
    dampingFactor: number;
    destroy: () => void;
    private _canvas;
    private _width;
    private _height;
    private _willRender;
    private _gl;
    private _vertexShader;
    private _fragmentShader;
    private _shaderProgram;
    private _projectionMatrix;
    private _viewMatrix;
    private _cameraRotation;
    private _cameraRotationTo;
    private _webGLProperties;
    private _sphereMesh0;
    private _destroyed;
    private _deviceOrientation;
    constructor(canvas: HTMLCanvasElement, textureSource: TextureSource, options?: Options);
    setSize(width: number, height: number): void;
    reset(): void;
    calibrate(): void;
    private _render;
    private _renderObject;
}
export {};
