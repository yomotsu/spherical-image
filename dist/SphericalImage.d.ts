import { TextureSource } from './SphereMesh';
interface Options {
    initialRotationPhi: number;
    initialRotationTheta: number;
}
export declare class SphericalImage {
    private _canvas;
    private _width;
    private _height;
    private _willRender;
    private _gl;
    private _shaderProgram;
    private _projectionMatrix;
    private _viewMatrix;
    private _cameraRotation;
    private _webGLProperties;
    private _sphereMesh0;
    constructor(canvas: HTMLCanvasElement, textureSource: TextureSource, options?: Options);
    setSize(width: number, height: number): void;
    private _render;
    private _renderObject;
}
export {};
