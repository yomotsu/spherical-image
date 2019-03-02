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

const vsSource = `
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

const fsSource = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main( void ) {
	vec4 textureColor = texture2D( uSampler, vTextureCoord );
	gl_FragColor = vec4( textureColor.rgb, 1.0 );
}
`;

export class Renderer {

	private canvas: HTMLCanvasElement;
	private width: number;
	private height: number;
	private willRender: boolean;
	private gl: WebGLRenderingContext;
	private shaderProgram: WebGLProgram;
	private projectionMatrix: Matrix4;
	private viewMatrix: Matrix4;
	private cameraRotation: [ number, number, number ];
	private webGLProperties: WeakMap<SphiricalObject, WebGLProperty>;
	private sphiricalObject0: SphiricalObject;

	constructor( canvas: HTMLCanvasElement, textureSource: string | HTMLCanvasElement ) {

		const scope = this;

		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.willRender = true;

		this.gl = canvas.getContext( 'experimental-webgl' )!;
		this.gl.viewport( 0, 0, this.width, this.height );
		this.gl.clearColor( 0, 0, 0, 1 );
		this.gl.enable( this.gl.DEPTH_TEST );

		this.shaderProgram = createShaderProgram( this.gl );

		this.projectionMatrix = new Matrix4();
		this.projectionMatrix.perspective( 45, this.width / this.height, 0.1, 100 );

		this.viewMatrix = new Matrix4();

		this.cameraRotation = [ 0, 0, 0 ];
		this.webGLProperties = new WeakMap();

		this.sphiricalObject0 = new SphiricalObject( textureSource );
		this.webGLProperties.set(
			this.sphiricalObject0,
			uploadObject( this.gl, this.shaderProgram, this.sphiricalObject0 )
		);

		this.willRender = true;
		this.sphiricalObject0.addEventListener( 'textureUpdated', () => this.willRender = true );

		// ( function tick( elapsed: number ) {
		( function tick() {

			// if ( elapsed > 10000 ) return;
			requestAnimationFrame( tick );
			scope.render();

		} )();


		// mouse events
		let lastDragX = 0;
		let lastDragY = 0;

		this.canvas.addEventListener( 'mousedown', onMouseDown );
		this.canvas.addEventListener( 'touchstart', onTouchStart );
		this.canvas.addEventListener( 'contextmenu', onContextMenu );

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

		function dragging( event: MouseEvent | TouchEvent ):void {

			const _event = normalizePointerEvent( event );

			const deltaX = _event.pageX - lastDragX;
			const deltaY = _event.pageY - lastDragY;

			scope.cameraRotation[ 0 ] += ( deltaY * - 0.1 ) * DEG2RAD;
			scope.cameraRotation[ 1 ] += ( deltaX * - 0.1 ) * DEG2RAD;
			scope.willRender = true;

			lastDragX = _event.pageX;
			lastDragY = _event.pageY;

		}

		function endDragging():void {

			document.removeEventListener( 'mousemove', dragging );
			document.removeEventListener( 'touchmove', dragging );
			document.removeEventListener( 'mouseup',  endDragging );
			document.removeEventListener( 'touchend', endDragging );

		}

	}

	render() {

		if ( ! this.willRender ) return;

		const gl = this.gl;

		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		this.cameraRotation[ 0 ] = Math.min(
			this.cameraRotation[ 0 ], PI_HALF - 1e-10
		);
		this.cameraRotation[ 0 ] = Math.max(
			this.cameraRotation[ 0 ], - PI_HALF + 1e-10
		);

		this.viewMatrix.makeRotationFromEulerXYZ(
			this.cameraRotation[ 0 ],
			this.cameraRotation[ 1 ],
			0
		);

		this.renderObject( this.sphiricalObject0 );
		this.willRender = false;

	}

	renderObject( object: SphiricalObject ): void {

		const gl = this.gl;
		const webGLProperty = this.webGLProperties.get( object )!;

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, webGLProperty.uniformValues.textureValue );
		gl.uniform1i( webGLProperty.uniformLocations.textureLocation, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer );

		gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer );
		gl.vertexAttribPointer(
			webGLProperty.attributeLocations.positionLocation,
			this.sphiricalObject0.attributes.position.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.bindBuffer( gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer );
		gl.vertexAttribPointer(
			webGLProperty.attributeLocations.textureCoordLocation,
			this.sphiricalObject0.attributes.textureCoord.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.projectionMatrixLocation,
			false,
			this.projectionMatrix.extract()
		);
		gl.uniformMatrix4fv(
			webGLProperty.uniformLocations.viewMatrixLocation,
			false,
			this.viewMatrix.extract()
		);


		gl.drawElements(
			gl.TRIANGLES,
			this.sphiricalObject0.attributes.index.numItems,
			gl.UNSIGNED_SHORT,
			0
		);

	}

}

function createShaderProgram( gl: WebGLRenderingContext ) {

	const vertexShader = gl.createShader( gl.VERTEX_SHADER )!;
	gl.shaderSource( vertexShader, vsSource );
	gl.compileShader( vertexShader );

	const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )!;
	gl.shaderSource( fragmentShader, fsSource );
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

function uploadTexture( gl: WebGLRenderingContext, baseTexture: BaseTexture, webglTexture: WebGLTexture ) {

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
