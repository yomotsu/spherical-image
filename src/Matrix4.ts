export class Matrix4 {

	private _array: Float32Array;

	constructor() {

		this._array = new Float32Array( 16 );
		this.identity();

	}

	extract(): Float32Array {

		return this._array;

	}

	identity(): this {

		const array = this._array;

		array[ 0 ] = 1;
		array[ 1 ] = 0;
		array[ 2 ] = 0;
		array[ 3 ] = 0;
		array[ 4 ] = 0;
		array[ 5 ] = 1;
		array[ 6 ] = 0;
		array[ 7 ] = 0;
		array[ 8 ] = 0;
		array[ 9 ] = 0;
		array[ 10 ] = 1;
		array[ 11 ] = 0;
		array[ 12 ] = 0;
		array[ 13 ] = 0;
		array[ 14 ] = 0;
		array[ 15 ] = 1;

		return this;

	}

	// multiply( mat4: Matrix4 ): this {

	// 	const a = this._array;
	// 	const b = mat4;

	// 	const a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ];
	// 	const a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ];
	// 	const a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ];
	// 	const a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];

	// 	// Cache only the current line of the second matrix
	// 	let b0  = b[ 0 ], b1 = b[ 1 ], b2 = b[ 2 ], b3 = b[ 3 ];
	// 	a[ 0 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	// 	a[ 1 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	// 	a[ 2 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	// 	a[ 3 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	// 	b0 = b[ 4 ]; b1 = b[ 5 ]; b2 = b[ 6 ]; b3 = b[ 7 ];
	// 	a[ 4 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	// 	a[ 5 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	// 	a[ 6 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	// 	a[ 7 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	// 	b0 = b[ 8 ]; b1 = b[ 9 ]; b2 = b[ 10 ]; b3 = b[ 11 ];
	// 	a[ 8 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	// 	a[ 9 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	// 	a[ 10 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	// 	a[ 11 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	// 	b0 = b[ 12 ]; b1 = b[ 13 ]; b2 = b[ 14 ]; b3 = b[ 15 ];
	// 	a[ 12 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	// 	a[ 13 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	// 	a[ 14 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	// 	a[ 15 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	// 	return this;

	// }

	// translate( x: number, y: number, z: number ): this {

	// 	const array = this._array;

	// 	array[ 12 ] = array[ 0 ] * x + array[ 4 ] * y + array[ 8 ] * z + array[ 12 ];
	// 	array[ 13 ] = array[ 1 ] * x + array[ 5 ] * y + array[ 9 ] * z + array[ 13 ];
	// 	array[ 14 ] = array[ 2 ] * x + array[ 6 ] * y + array[ 10 ] * z + array[ 14 ];
	// 	array[ 15 ] = array[ 3 ] * x + array[ 7 ] * y + array[ 11 ] * z + array[ 15 ];

	// 	return this;

	// }

	makeRotationFromEulerXYZ( x: number, y: number, z: number ): this {

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

	perspective( fovy: number, aspect: number, near: number, far: number ): this {

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
