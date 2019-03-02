import { SphiricalObject } from './SphiricalObject';
export declare class Renderer {
    private canvas;
    private width;
    private height;
    private willRender;
    private gl;
    private shaderProgram;
    private projectionMatrix;
    private viewMatrix;
    private cameraRotation;
    private webGLProperties;
    private sphiricalObject0;
    constructor(canvas: HTMLCanvasElement, textureSource: string | HTMLCanvasElement);
    render(): void;
    renderObject(object: SphiricalObject): void;
}
