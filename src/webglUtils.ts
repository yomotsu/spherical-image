import { WebGLProperty } from './types';
import { SphereMesh, BaseTexture } from './SphereMesh';

interface ContextAttributes {
	alpha?: boolean;
	depth?: boolean;
	stencil?: boolean;
	antialias?: boolean;
	premultipliedAlpha?: boolean;
	preserveDrawingBuffer?: boolean;
	powerPreference?: boolean;
};

export function getWebglContext(
	canvas: HTMLCanvasElement,
	contextAttributes: ContextAttributes,
): WebGLRenderingContext {

	return (
		canvas.getContext( 'webgl', contextAttributes ) ||
		canvas.getContext( 'experimental-webgl', contextAttributes )
	) as WebGLRenderingContext;

}

const VERTEX_SHADER_SOURCE = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

varying vec2 vTextureCoord;

void main(void) {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4( aVertexPosition, 1.0 );
	vTextureCoord = aTextureCoord;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main( void ) {
	vec4 textureColor = texture2D( uSampler, vTextureCoord );
	gl_FragColor = vec4( textureColor.rgb, 1.0 );
}
`;

export function createVertexShader( gl: WebGLRenderingContext ): WebGLShader {

	const vertexShader = gl.createShader( gl.VERTEX_SHADER )!;
	gl.shaderSource( vertexShader, VERTEX_SHADER_SOURCE );
	gl.compileShader( vertexShader );

	return vertexShader;
}

export function createFragmentShader( gl: WebGLRenderingContext ): WebGLShader {

	const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )!;
	gl.shaderSource( fragmentShader, FRAGMENT_SHADER_SOURCE );
	gl.compileShader( fragmentShader );

	return fragmentShader;

}

export function createShaderProgram(
	gl: WebGLRenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader,
): WebGLProgram {

	const shaderProgram = gl.createProgram()!;
	gl.attachShader( shaderProgram, vertexShader );
	gl.attachShader( shaderProgram, fragmentShader );
	gl.linkProgram( shaderProgram );

	gl.useProgram( shaderProgram );

	return shaderProgram;

}

export function uploadObject(
	gl: WebGLRenderingContext,
	shaderProgram: WebGLProgram,
	object: SphereMesh,
): WebGLProperty {

	const webGLProperty = {
		attributeBuffers: {
			indexBuffer: gl.createBuffer(),
			positionBuffer: gl.createBuffer(),
			textureCoordBuffer: gl.createBuffer(),
		},
		attributeLocations: {
			positionLocation: gl.getAttribLocation( shaderProgram, 'aVertexPosition' ),
			textureCoordLocation: gl.getAttribLocation( shaderProgram, 'aTextureCoord' ),
		},
		uniformValues: {
			textureValue: gl.createTexture()!,
		},
		uniformLocations: {
			projectionMatrixLocation: gl.getUniformLocation( shaderProgram, 'uProjectionMatrix' ),
			viewMatrixLocation: gl.getUniformLocation( shaderProgram, 'uViewMatrix' ),
			modelMatrixLocation: gl.getUniformLocation( shaderProgram, 'uModelMatrix' ),
			textureLocation: gl.getUniformLocation( shaderProgram, 'uSampler' ),
		}
	};

	// buffer
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, object.attributes.index.array, gl.STATIC_DRAW );

	gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, object.attributes.textureCoord.array, gl.STATIC_DRAW );

	gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, object.attributes.position.array, gl.STATIC_DRAW );

	// enable attrs
	gl.enableVertexAttribArray( webGLProperty.attributeLocations.positionLocation );
	gl.enableVertexAttribArray( webGLProperty.attributeLocations.textureCoordLocation );

	uploadTexture( gl, object.baseTexture, webGLProperty.uniformValues.textureValue );

	// texture upload
	object.addEventListener( 'textureUpdated', () => {

		uploadTexture( gl, object.baseTexture, webGLProperty.uniformValues.textureValue );

	} );

	return webGLProperty;

}

function uploadTexture( gl: WebGLRenderingContext, baseTexture: BaseTexture, webglTexture: WebGLTexture ): void {

	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, + true );
	gl.bindTexture( gl.TEXTURE_2D, webglTexture );
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGB,
		gl.RGB,
		gl.UNSIGNED_BYTE,
		baseTexture,
	);
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
	gl.generateMipmap( gl.TEXTURE_2D );

	gl.bindTexture( gl.TEXTURE_2D, null );

}
