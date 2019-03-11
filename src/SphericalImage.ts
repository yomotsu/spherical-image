import { WebGLProperty } from './types';
import { Matrix4 } from './Matrix4';
import { SphereMesh, TextureSource } from './SphereMesh';
import { createVertexShader, createFragmentShader, createShaderProgram, uploadObject } from './webglUtils';

interface Options {
	defaultRotationPhi?: number;
	defaultRotationTheta?: number;
}

const DEG2RAD = Math.PI / 180;
const PI_HALF = Math.PI * 0.5;
const PI_2 = Math.PI * 2;
const CAMERA_FOV = 45; // in deg
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

export class SphericalImage {

	private _canvas: HTMLCanvasElement;
	private _width: number;
	private _height: number;
	private _willRender: boolean = true;
	private _gl: WebGLRenderingContext;
	private _vertexShader: WebGLShader;
	private _fragmentShader: WebGLShader;
	private _shaderProgram: WebGLProgram;
	private _projectionMatrix: Matrix4;
	private _viewMatrix: Matrix4 = new Matrix4();
	private _cameraRotation: Float32Array = new Float32Array( [ 0, 0, 0 ] );
	private _cameraRotationTo: Float32Array = new Float32Array( [ 0, 0, 0 ] );
	private _webGLProperties: WeakMap<SphereMesh, WebGLProperty> = new WeakMap();
	private _sphereMesh0: SphereMesh;
	private _destoried: boolean = false;

	public dampingFactor: number = 0.1;
	public destory: () => void;

	constructor(
		canvas: HTMLCanvasElement,
		textureSource: TextureSource,
		options: Options = {},
	) {

		const scope = this;

		this._canvas = canvas;
		this._width = canvas.width;
		this._height = canvas.height;

		this._gl = getWebglContext( canvas );
		this._gl.viewport( 0, 0, this._width, this._height );
		this._gl.clearColor( 0, 0, 0, 1 );
		this._gl.enable( this._gl.DEPTH_TEST );

		this._vertexShader = createVertexShader( this._gl );
		this._fragmentShader = createFragmentShader( this._gl );
		this._shaderProgram = createShaderProgram(
			this._gl,
			this._vertexShader,
			this._fragmentShader
		);

		this._projectionMatrix = new Matrix4();
		this._projectionMatrix.perspective( CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR );

		this._sphereMesh0 = new SphereMesh(
			textureSource,
			options.defaultRotationPhi || 0,
			options.defaultRotationTheta || 0,
		);
		this._webGLProperties.set(
			this._sphereMesh0,
			uploadObject( this._gl, this._shaderProgram, this._sphereMesh0 )
		);

		this._sphereMesh0.addEventListener( 'textureUpdated', () => this._willRender = true );

		let lastElapsedTime: number = 0;
		let requestAnimationFrameId: number = 0;

		( function tick( elapsed: number ) {

			// if ( elapsed > 10000 ) return;
			if ( scope._destoried ) return;

			requestAnimationFrameId = requestAnimationFrame( tick );

			const delta = elapsed - lastElapsedTime;
			updateCameraRotation( delta );
			scope._render();
			lastElapsedTime = elapsed;

		} )( 0 );


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

			scope._cameraRotationTo[ 0 ] += ( deltaY * - 0.1 ) * DEG2RAD;
			scope._cameraRotationTo[ 1 ] += ( deltaX * - 0.1 ) * DEG2RAD;

			lastDragX = _event.pageX;
			lastDragY = _event.pageY;

		}

		function endDragging(): void {

			document.removeEventListener( 'mousemove', dragging );
			document.removeEventListener( 'touchmove', dragging );
			document.removeEventListener( 'mouseup',  endDragging );
			document.removeEventListener( 'touchend', endDragging );

		}

		function updateCameraRotation( delta: number ): void {

			const lerpRatio = 1 - Math.exp( - scope.dampingFactor * delta / 16 );

			const deltaX = scope._cameraRotationTo[ 0 ] - scope._cameraRotation[ 0 ];
			const deltaY = scope._cameraRotationTo[ 1 ] - scope._cameraRotation[ 1 ];

			if ( Math.abs( deltaX ) > 1e-5 || Math.abs( deltaY ) > 1e-5 ) {

				scope._cameraRotation[ 0 ] += deltaX * lerpRatio;
				scope._cameraRotation[ 1 ] += deltaY * lerpRatio;
				scope._willRender = true;

			}

		}

		this.destory = (): void => {

			this._destoried = true;
			this._willRender = false;
			cancelAnimationFrame( requestAnimationFrameId );

			this._gl.activeTexture( this._gl.TEXTURE0 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			// this._gl.activeTexture( this._gl.TEXTURE1 );
			// this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, null );
			this._gl.bindBuffer( this._gl.ELEMENT_ARRAY_BUFFER, null );
			this._gl.bindRenderbuffer( this._gl.RENDERBUFFER, null );
			this._gl.bindFramebuffer( this._gl.FRAMEBUFFER, null );

			const webGLProperty = this._webGLProperties.get( this._sphereMesh0 )!;
			this._gl.deleteBuffer( webGLProperty.attributeBuffers.indexBuffer );
			this._gl.deleteBuffer( webGLProperty.attributeBuffers.positionBuffer );
			this._gl.deleteBuffer( webGLProperty.attributeBuffers.textureCoordBuffer );
			this._gl.deleteTexture( webGLProperty.uniformValues.textureValue );

			this._gl.deleteShader( this._vertexShader );
			this._gl.deleteShader( this._fragmentShader );
			this._gl.deleteProgram( this._shaderProgram );

			// const extension = this._gl.getExtension( 'WEBGL_lose_context' );
			// if ( extension ) extension.loseContext();

			this._canvas.removeEventListener( 'mousedown', onMouseDown );
			this._canvas.removeEventListener( 'touchstart', onTouchStart );
			this._canvas.removeEventListener( 'contextmenu', onContextMenu );

			document.removeEventListener( 'mousemove', dragging );
			document.removeEventListener( 'touchmove', dragging );
			document.removeEventListener( 'mouseup',  endDragging );
			document.removeEventListener( 'touchend', endDragging );

		}

	}

	public setSize( width: number, height: number ): void {

		this._width = width;
		this._height = height;
		this._canvas.width = this._width;
		this._canvas.height = this._height;
		this._gl.viewport( 0, 0, this._width, this._height );
		this._projectionMatrix.perspective( CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR );
		this._willRender = true;

	}

	private _render(): void {

		if ( ! this._willRender ) return;

		const gl = this._gl;

		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		this._cameraRotationTo[ 0 ] = Math.min( this._cameraRotationTo[ 0 ],   PI_HALF - 1e-10 );
		this._cameraRotationTo[ 0 ] = Math.max( this._cameraRotationTo[ 0 ], - PI_HALF + 1e-10 );

		this._viewMatrix.makeRotationFromEulerXYZ(
			this._cameraRotation[ 0 ],
			this._cameraRotation[ 1 ],
			0
		);

		this._renderObject( this._sphereMesh0 );
		this._willRender = false;

	}

	private _renderObject( object: SphereMesh ): void {

		const gl = this._gl;
		const webGLProperty = this._webGLProperties.get( object )!;

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, webGLProperty.uniformValues.textureValue );
		gl.uniform1i( webGLProperty.uniformLocations.textureLocation, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer );

		gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer );
		gl.vertexAttribPointer(
			webGLProperty.attributeLocations.positionLocation,
			this._sphereMesh0.attributes.position.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer );
		gl.vertexAttribPointer(
			webGLProperty.attributeLocations.textureCoordLocation,
			this._sphereMesh0.attributes.textureCoord.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.modelMatrixLocation,
			false,
			this._sphereMesh0.modelMatrix.extract()
		);
		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.viewMatrixLocation,
			false,
			this._viewMatrix.extract()
		);
		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.projectionMatrixLocation,
			false,
			this._projectionMatrix.extract()
		);

		gl.drawElements(
			gl.TRIANGLES,
			this._sphereMesh0.attributes.index.numItems,
			gl.UNSIGNED_SHORT,
			0
		);

	}

	public reset(): void {

		this._cameraRotation[ 0 ] = this._cameraRotation[ 0 ] % PI_2;
		this._cameraRotation[ 1 ] = this._cameraRotation[ 1 ] % PI_2;
		this._cameraRotationTo[ 0 ] = 0;
		this._cameraRotationTo[ 1 ] = 0;

	}

}

function getWebglContext( canvas: HTMLCanvasElement ): WebGLRenderingContext {

	const contextAttributes = {
		alpha: false,
		depth: false,
		stencil: false,
		antialias: false,
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		powerPreference: false,
	};

	return (
		canvas.getContext( 'webgl', contextAttributes ) ||
		canvas.getContext( 'experimental-webgl', contextAttributes )
	) as WebGLRenderingContext;

}

function normalizePointerEvent( event: MouseEvent | TouchEvent | WheelEvent ): any {

	return 'ontouchstart' in window && event instanceof TouchEvent ? event.touches[ 0 ] : event;

}
