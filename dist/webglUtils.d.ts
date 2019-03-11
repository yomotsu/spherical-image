import { WebGLProperty } from './types';
import { SphereMesh } from './SphereMesh';
export declare function createVertexShader(gl: WebGLRenderingContext): WebGLShader;
export declare function createFragmentShader(gl: WebGLRenderingContext): WebGLShader;
export declare function createShaderProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
export declare function uploadObject(gl: WebGLRenderingContext, shaderProgram: WebGLProgram, object: SphereMesh): WebGLProperty;
