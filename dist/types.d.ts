export interface WebGLProperty {
    attributeBuffers: {
        indexBuffer: WebGLBuffer | null;
        positionBuffer: WebGLBuffer | null;
        textureCoordBuffer: WebGLBuffer | null;
    };
    attributeLocations: {
        positionLocation: number;
        textureCoordLocation: number;
    };
    uniformValues: {
        textureValue: WebGLTexture | null;
    };
    uniformLocations: {
        projectionMatrixLocation: WebGLUniformLocation | null;
        viewMatrixLocation: WebGLUniformLocation | null;
        modelMatrixLocation: WebGLUniformLocation | null;
        textureLocation: WebGLUniformLocation | null;
    };
}
