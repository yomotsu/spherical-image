import { EventDispatcher } from './EventDispatcher';
import { Matrix4 } from 'Matrix4';
export type TextureSource = string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
export type BaseTexture = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

const EMPTY_TEXTURE = document.createElement( 'canvas' );
EMPTY_TEXTURE.width = 1;
EMPTY_TEXTURE.height = 1;

const RADIUS = 1;
const LATITUDE_BANDS = 32;
const LONGITUDE_BANDS = 32;

const vertexPositionData = [];
const normalData = [];
const textureCoordData = [];

for ( let latNumber = 0; latNumber <= LATITUDE_BANDS; latNumber ++ ) {

	const theta = latNumber * Math.PI / LATITUDE_BANDS;
	const sinTheta = Math.sin( theta );
	const cosTheta = Math.cos( theta );

	for ( let longNumber = 0; longNumber <= LONGITUDE_BANDS; longNumber ++ ) {

		const phi = longNumber * 2 * Math.PI / LONGITUDE_BANDS + Math.PI / 2;
		const sinPhi = Math.sin( phi );
		const cosPhi = Math.cos( phi );

		const x = cosPhi * sinTheta;
		const y = cosTheta;
		const z = sinPhi * sinTheta;
		const u = ( longNumber / LONGITUDE_BANDS );
		const v = 1 - ( latNumber / LATITUDE_BANDS );

		normalData.push( x );
		normalData.push( y );
		normalData.push( z );
		textureCoordData.push( u );
		textureCoordData.push( v );
		vertexPositionData.push( RADIUS * x );
		vertexPositionData.push( RADIUS * y );
		vertexPositionData.push( RADIUS * z );

	}

}

const indexData = [];

for ( let latNumber = 0; latNumber < LATITUDE_BANDS; latNumber ++ ) {

	for ( let longNumber = 0; longNumber < LONGITUDE_BANDS; longNumber ++ ) {

		const first = ( latNumber * ( LONGITUDE_BANDS + 1 ) ) + longNumber;
		const second = first + LONGITUDE_BANDS + 1;
		indexData.push( first );
		indexData.push( second );
		indexData.push( first + 1 );

		indexData.push( second );
		indexData.push( second + 1 );
		indexData.push( first + 1 );

	}

}

const INDEX_BUFFER_DATA = new Uint16Array( indexData );
const POSITION_BUFFER_DATA = new Float32Array( vertexPositionData );
const NORMAL_BUFFER_DATA = new Float32Array( normalData );
const TEXTURE_COORD_BUFFER_DATA = new Float32Array( textureCoordData );
const ATTRIBUTES = {
	index: {
		array: INDEX_BUFFER_DATA,
		itemSize: 1,
		numItems: INDEX_BUFFER_DATA.length,
	},
	position: {
		array: POSITION_BUFFER_DATA,
		itemSize: 3,
		numItems: POSITION_BUFFER_DATA.length / 3,
	},
	normal: {
		array: NORMAL_BUFFER_DATA,
		itemSize: 3,
		numItems: NORMAL_BUFFER_DATA.length / 3,
	},
	textureCoord: {
		array: TEXTURE_COORD_BUFFER_DATA,
		itemSize: 2,
		numItems: TEXTURE_COORD_BUFFER_DATA.length / 3,
	},
};

export class SphereMesh extends EventDispatcher {

	private _baseTexture: BaseTexture;
	private _modelMatrix: Matrix4;

	constructor(
		textureSource: TextureSource,
		initialRotationPhi: number,
		initialRotationTheta: number,
	) {

		super();

		this._baseTexture = EMPTY_TEXTURE;
		this._modelMatrix = new Matrix4;
		this._modelMatrix.makeRotationFromEulerXYZ(
			initialRotationPhi,
			initialRotationTheta,
			0,
		);

		Object.defineProperty( this, 'initialRotationPhi',   { value: initialRotationPhi } );
		Object.defineProperty( this, 'initialRotationTheta', { value: initialRotationTheta } );

		this.updateTexture( textureSource );

	}

	get attributes() {

		return ATTRIBUTES;

	}

	get modelMatrix() {

		return this._modelMatrix;

	}

	get baseTexture() {

		return this._baseTexture;

	}

	public rotate( phi: number, theta: number ): void {
		this._modelMatrix.makeRotationFromEulerXYZ(
			phi,
			theta,
			0,
		);
	}

	public updateTexture( textureSource: TextureSource ): void {

		if ( typeof textureSource === 'string' ) {

			const image = new Image();
			const onload = () => {

				this._baseTexture = image;
				this.dispatchEvent( { type: 'textureUpdated' } );
				image.removeEventListener( 'load', onload );

			};
			image.addEventListener( 'load', onload );
			image.src = textureSource;

		} else if ( textureSource instanceof HTMLCanvasElement ) {

			this._baseTexture = textureSource;
			this.dispatchEvent( { type: 'textureUpdated' } );

		}

	}

}
