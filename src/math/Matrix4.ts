import { Vector3 } from './Vector3';
import { Quaternion } from './Quaternion';

const POSITION_ZERO = new Vector3( 0, 0, 0 );
const SCALE_ONE = new Vector3( 1, 1, 1 );

export class Matrix4 {

	private _array: Float32Array;

	constructor() {

		this._array = new Float32Array( 16 );
		this.identity();

	}

	public extract(): Float32Array {

		return this._array;

	}

	public identity(): this {

		const array = this._array;

		array[  0 ] = 1; array[  1 ] = 0; array[  2 ] = 0; array[  3 ] = 0;
		array[  4 ] = 0; array[  5 ] = 1; array[  6 ] = 0; array[  7 ] = 0;
		array[  8 ] = 0; array[  9 ] = 0; array[ 10 ] = 1; array[ 11 ] = 0;
		array[ 12 ] = 0; array[ 13 ] = 0; array[ 14 ] = 0; array[ 15 ] = 1;

		return this;

	}

	public multiplyMatrices ( a: Matrix4, b: Matrix4 ): this {

		const ae = a._array;
		const be = b._array;
		const te = this._array;

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	}

	// public translate( x: number, y: number, z: number ): this {

	// 	const array = this._array;

	// 	array[ 12 ] = array[ 0 ] * x + array[ 4 ] * y + array[ 8 ] * z + array[ 12 ];
	// 	array[ 13 ] = array[ 1 ] * x + array[ 5 ] * y + array[ 9 ] * z + array[ 13 ];
	// 	array[ 14 ] = array[ 2 ] * x + array[ 6 ] * y + array[ 10 ] * z + array[ 14 ];
	// 	array[ 15 ] = array[ 3 ] * x + array[ 7 ] * y + array[ 11 ] * z + array[ 15 ];

	// 	return this;

	// }

	public makeRotationFromEulerXYZ( x: number, y: number, z: number ): this {

		const array = this._array;

		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		var ae = a * e, af = a * f, be = b * e, bf = b * f;

		array[ 0 ] = c * e;
		array[ 4 ] = - c * f;
		array[ 8 ] = d;

		array[ 1 ] = af + be * d;
		array[ 5 ] = ae - bf * d;
		array[ 9 ] = - b * c;

		array[ 2 ] = bf - ae * d;
		array[ 6 ] = be + af * d;
		array[ 10 ] = a * c;

		// bottom row
		array[ 3 ] = 0;
		array[ 7 ] = 0;
		array[ 11 ] = 0;

		// last column
		array[ 12 ] = 0;
		array[ 13 ] = 0;
		array[ 14 ] = 0;
		array[ 15 ] = 1;

		return this;

	}

	public makeRotationFromQuaternion ( q: Quaternion ): this {

		return this.compose( POSITION_ZERO, q, SCALE_ONE );

	}


	public compose ( position: Vector3, quaternion: Quaternion, scale: Vector3 ): this {

		const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
		const x2 = x + x,	y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		var sx = scale.x, sy = scale.y, sz = scale.z;

		this._array[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
		this._array[ 1 ] = ( xy + wz ) * sx;
		this._array[ 2 ] = ( xz - wy ) * sx;
		this._array[ 3 ] = 0;

		this._array[ 4 ] = ( xy - wz ) * sy;
		this._array[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
		this._array[ 6 ] = ( yz + wx ) * sy;
		this._array[ 7 ] = 0;

		this._array[ 8 ] = ( xz + wy ) * sz;
		this._array[ 9 ] = ( yz - wx ) * sz;
		this._array[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
		this._array[ 11 ] = 0;

		this._array[ 12 ] = position.x;
		this._array[ 13 ] = position.y;
		this._array[ 14 ] = position.z;
		this._array[ 15 ] = 1;

		return this;

	}

	public perspective( fovy: number, aspect: number, near: number, far: number ): this {

		const array = this._array;
		const f = 1.0 / Math.tan( fovy * 0.5 );
		const nf = 1 / ( near - far );

		array[ 0 ] = f / aspect;
		array[ 1 ] = 0;
		array[ 2 ] = 0;
		array[ 3 ] = 0;
		array[ 4 ] = 0;
		array[ 5 ] = f;
		array[ 6 ] = 0;
		array[ 7 ] = 0;
		array[ 8 ] = 0;
		array[ 9 ] = 0;
		array[ 10 ] = ( far + near ) * nf;
		array[ 11 ] = - 1;
		array[ 12 ] = 0;
		array[ 13 ] = 0;
		array[ 14 ] = ( 2 * far * near ) * nf;
		array[ 15 ] = 0;

		return this;

	}

}
