import { EventDispatcher } from './EventDispatcher';
export type BaseTexture = HTMLImageElement | HTMLCanvasElement;
interface Attributes {
	index: {
		array: Uint16Array;
		itemSize: number;
		numItems: number;
	},
	position: {
		array: Float32Array;
		itemSize: number;
		numItems: number;
	},
	normal: {
		array: Float32Array;
		itemSize: number;
		numItems: number;
	},
	textureCoord: {
		array: Float32Array;
		itemSize: number;
		numItems: number;
	},
};

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

		const phi = longNumber * 2 * Math.PI / LONGITUDE_BANDS;
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

export class SphiricalObject extends EventDispatcher {

	public baseTexture: BaseTexture;
	public attributes: Attributes;

	constructor( textureSource: string | HTMLCanvasElement ) {

		super();

		this.attributes = {
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

		this.baseTexture = EMPTY_TEXTURE;
		// this.modelMatrix = null;

		this.updateTexture( textureSource );

	}

	updateTexture( textureSource: string | HTMLCanvasElement ): void {

		if ( typeof textureSource === 'string' ) {

			const image = new Image();
			const onload = () => {

				this.baseTexture = image;
				this.dispatchEvent( { type: 'textureUpdated' } );
				image.removeEventListener( 'load', onload );

			};
			image.addEventListener( 'load', onload );
			image.src = textureSource;

		} else if ( textureSource instanceof HTMLCanvasElement ) {

			this.baseTexture = textureSource;
			this.dispatchEvent( { type: 'textureUpdated' } );

		}

	}

}
