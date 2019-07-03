import { WebGLProperty } from './types';
import { SphereMesh } from './SphereMesh';
interface ContextAttributes {
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: boolean;
}
export declare function getWebglContext(canvas: HTMLCanvasElement, contextAttributes: ContextAttributes): WebGLRenderingContext;
export declare function createVertexShader(gl: WebGLRenderingContext): WebGLShader;
export declare function createFragmentShader(gl: WebGLRenderingContext): WebGLShader;
export declare function createShaderProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
export declare function uploadObject(gl: WebGLRenderingContext, shaderProgram: WebGLProgram, object: SphereMesh): WebGLProperty;
export {};
