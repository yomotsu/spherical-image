import { TextureSource } from './SphereMesh';
interface Options {
    defaultRotationPhi?: number;
    defaultRotationTheta?: number;
}
export declare class SphericalImage {
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
    private _destoried;
    dampingFactor: number;
    destory: () => void;
    constructor(canvas: HTMLCanvasElement, textureSource: TextureSource, options?: Options);
    setSize(width: number, height: number): void;
    private _render;
    private _renderObject;
    reset(): void;
}
export {};
