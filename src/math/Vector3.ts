export class Vector3 {

	private _array: Float32Array;

	constructor( x: number = 0 ,y: number = 0 ,z: number = 0 ) {

		this._array = new Float32Array( [ x, y, z ] );

	}

	get x (): number {

		return this._array[ 0 ];

	}

	// set x ( x: number ) {

	// 	this._array[ 0 ] = x;

	// }

	get y (): number {

		return this._array[ 1 ];

	}

	// set y ( y: number ) {

	// 	this._array[ 1 ] = y;

	// }

	get z (): number {

		return this._array[ 2 ];

	}

	// set z ( z: number ) {

	// 	this._array[ 2 ] = z;

	// }

	public extract(): Float32Array {

		return this._array;

	}

}
