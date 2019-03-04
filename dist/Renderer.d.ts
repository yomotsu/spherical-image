export declare class Renderer {
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
    private _sphiricalObject0;
    constructor(canvas: HTMLCanvasElement, textureSource: string | HTMLCanvasElement);
    setSize(width: number, height: number): void;
    private _render;
    private _renderObject;
}
