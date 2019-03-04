import { Matrix4 } from './Matrix4';
import { SphiricalObject, BaseTexture } from './SphiricalObject';

interface WebGLProperty {
	attributeBuffers: {
		indexBuffer: WebGLBuffer | null,
		positionBuffer: WebGLBuffer | null,
		textureCoordBuffer: WebGLBuffer | null,
	},
	attributeLocations: {
		positionLocation: number,
		textureCoordLocation: number,
	},
	uniformValues: {
		textureValue: WebGLTexture | null,
	},
	uniformLocations: {
		projectionMatrixLocation: WebGLUniformLocation | null,
		viewMatrixLocation: WebGLUniformLocation | null,
		textureLocation: WebGLUniformLocation | null,
	}
}

const DEG2RAD = Math.PI / 180;
const PI_HALF = Math.PI * 0.5;
const CAMERA_FOV = 45; // in deg
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

const VERTEX_SHADER_SOURCE = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec2 vTextureCoord;

void main(void) {
	gl_Position = uProjectionMatrix * uViewMatrix * vec4( aVertexPosition, 1.0 );
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

export class Renderer {

	private _canvas: HTMLCanvasElement;
	private _width: number;
	private _height: number;
	private _willRender: boolean;
	private _gl: WebGLRenderingContext;
	private _shaderProgram: WebGLProgram;
	private _projectionMatrix: Matrix4;
	private _viewMatrix: Matrix4;
	private _cameraRotation: [ number, number, number ];
	private _webGLProperties: WeakMap<SphiricalObject, WebGLProperty>;
	private _sphiricalObject0: SphiricalObject;

	constructor( canvas: HTMLCanvasElement, textureSource: string | HTMLCanvasElement ) {

		const scope = this;

		this._canvas = canvas;
		this._width = canvas.width;
		this._height = canvas.height;
		this._willRender = true;

		this._gl = canvas.getContext( 'experimental-webgl' )!;
		this._gl.viewport( 0, 0, this._width, this._height );
		this._gl.clearColor( 0, 0, 0, 1 );
		this._gl.enable( this._gl.DEPTH_TEST );

		this._shaderProgram = createShaderProgram( this._gl );

		this._projectionMatrix = new Matrix4();
		this._projectionMatrix.perspective( CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR );

		this._viewMatrix = new Matrix4();

		this._cameraRotation = [ 0, 0, 0 ];
		this._webGLProperties = new WeakMap();

		this._sphiricalObject0 = new SphiricalObject( textureSource );
		this._webGLProperties.set(
			this._sphiricalObject0,
			uploadObject( this._gl, this._shaderProgram, this._sphiricalObject0 )
		);

		this._willRender = true;
		this._sphiricalObject0.addEventListener( 'textureUpdated', () => this._willRender = true );

		// ( function tick( elapsed: number ) {
		( function tick() {

			// if ( elapsed > 10000 ) return;
			requestAnimationFrame( tick );
			scope._render();

		} )();


		// mouse events
		let lastDragX: number = 0;
		let lastDragY: number = 0;

		this._canvas.addEventListener( 'mousedown', onMouseDown );
		this._canvas.addEventListener( 'touchstart', onTouchStart );
		this._canvas.addEventListener( 'contextmenu', onContextMenu );

		function onMouseDown( event: MouseEvent ):void {

			event.preventDefault();
			startDragging( event );

		}

		function onTouchStart( event: TouchEvent ):void {

			event.preventDefault();
			startDragging( event );

		}

		function onContextMenu( event: MouseEvent | TouchEvent ):void {

			event.preventDefault();

		}

		function startDragging( event: MouseEvent | TouchEvent ):void {

			const _event = normalizePointerEvent( event );

			lastDragX = _event.pageX;
			lastDragY = _event.pageY;

			document.addEventListener( 'mousemove', dragging, { passive: false } );
			document.addEventListener( 'touchmove', dragging, { passive: false } );
			document.addEventListener( 'mouseup', endDragging );
			document.addEventListener( 'touchend', endDragging );

		}

		function dragging( event: MouseEvent | TouchEvent ): void {

			const _event = normalizePointerEvent( event );

			const deltaX = _event.pageX - lastDragX;
			const deltaY = _event.pageY - lastDragY;

			scope._cameraRotation[ 0 ] += ( deltaY * - 0.1 ) * DEG2RAD;
			scope._cameraRotation[ 1 ] += ( deltaX * - 0.1 ) * DEG2RAD;
			scope._willRender = true;

			lastDragX = _event.pageX;
			lastDragY = _event.pageY;

		}

		function endDragging(): void {

			document.removeEventListener( 'mousemove', dragging );
			document.removeEventListener( 'touchmove', dragging );
			document.removeEventListener( 'mouseup',  endDragging );
			document.removeEventListener( 'touchend', endDragging );

		}

	}

	public setSize( width: number, height: number ): void {

		this._width = width;
		this._height = height;

		this._gl.viewport( 0, 0, this._width, this._height );
		this._projectionMatrix.perspective( CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR );
		this._willRender = true;

	}

	private _render(): void {

		if ( ! this._willRender ) return;

		const gl = this._gl;

		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		this._cameraRotation[ 0 ] = Math.min(
			this._cameraRotation[ 0 ], PI_HALF - 1e-10
		);
		this._cameraRotation[ 0 ] = Math.max(
			this._cameraRotation[ 0 ], - PI_HALF + 1e-10
		);

		this._viewMatrix.makeRotationFromEulerXYZ(
			this._cameraRotation[ 0 ],
			this._cameraRotation[ 1 ],
			0
		);

		this._renderObject( this._sphiricalObject0 );
		this._willRender = false;

	}

	private _renderObject( object: SphiricalObject ): void {

		const gl = this._gl;
		const webGLProperty = this._webGLProperties.get( object )!;

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, webGLProperty.uniformValues.textureValue );
		gl.uniform1i( webGLProperty.uniformLocations.textureLocation, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer );

		gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer );
		gl.vertexAttribPointer(
			webGLProperty.attributeLocations.positionLocation,
			this._sphiricalObject0.attributes.position.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer );
		gl.vertexAttribPointer(
			webGLProperty.attributeLocations.textureCoordLocation,
			this._sphiricalObject0.attributes.textureCoord.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.projectionMatrixLocation,
			false,
			this._projectionMatrix.extract()
		);
		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.viewMatrixLocation,
			false,
			this._viewMatrix.extract()
		);


		gl.drawElements(
			gl.TRIANGLES,
			this._sphiricalObject0.attributes.index.numItems,
			gl.UNSIGNED_SHORT,
			0
		);

	}

}

function createShaderProgram( gl: WebGLRenderingContext ): WebGLProgram {

	const vertexShader = gl.createShader( gl.VERTEX_SHADER )!;
	gl.shaderSource( vertexShader, VERTEX_SHADER_SOURCE );
	gl.compileShader( vertexShader );

	const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )!;
	gl.shaderSource( fragmentShader, FRAGMENT_SHADER_SOURCE );
	gl.compileShader( fragmentShader );

	const shaderProgram = gl.createProgram()!;
	gl.attachShader( shaderProgram, vertexShader );
	gl.attachShader( shaderProgram, fragmentShader );
	gl.linkProgram( shaderProgram );

	gl.useProgram( shaderProgram );

	return shaderProgram;

}

function uploadObject( gl: WebGLRenderingContext, shaderProgram: WebGLProgram, object: SphiricalObject ): WebGLProperty {

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

function normalizePointerEvent( event: MouseEvent | TouchEvent | WheelEvent ): any {

	return 'ontouchstart' in window && event instanceof TouchEvent ? event.touches[ 0 ] : event;

}
