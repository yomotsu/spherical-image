import { Vector3 } from './Vector3';

export class Quaternion {

	private _array: Float32Array;

	constructor( x: number = 0, y: number = 0, z: number = 0, w: number = 1 ) {

		this._array = new Float32Array( [ x, y, z, w ] );

	}

	get x () {

		return this._array[ 0 ];

	}

	get y () {

		return this._array[ 1 ];

	}

	get z () {

		return this._array[ 2 ];

	}

	get w () {

		return this._array[ 3 ];

	}

	public extract(): Float32Array {

		return this._array;

	}

	public setFromEuler( x: number, y: number, z: number, order: string ): this {

		const c1 = Math.cos( x / 2 );
		const c2 = Math.cos( y / 2 );
		const c3 = Math.cos( z / 2 );

		const s1 = Math.sin( x / 2 );
		const s2 = Math.sin( y / 2 );
		const s3 = Math.sin( z / 2 );

		if ( order === 'XYZ' ) {

			this._array[ 0 ] = s1 * c2 * c3 + c1 * s2 * s3;
			this._array[ 1 ] = c1 * s2 * c3 - s1 * c2 * s3;
			this._array[ 2 ] = c1 * c2 * s3 + s1 * s2 * c3;
			this._array[ 3 ] = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( order === 'YXZ' ) {

			this._array[ 0 ] = s1 * c2 * c3 + c1 * s2 * s3;
			this._array[ 1 ] = c1 * s2 * c3 - s1 * c2 * s3;
			this._array[ 2 ] = c1 * c2 * s3 - s1 * s2 * c3;
			this._array[ 3 ] = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( order === 'ZXY' ) {

			this._array[ 0 ] = s1 * c2 * c3 - c1 * s2 * s3;
			this._array[ 1 ] = c1 * s2 * c3 + s1 * c2 * s3;
			this._array[ 2 ] = c1 * c2 * s3 + s1 * s2 * c3;
			this._array[ 3 ] = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( order === 'ZYX' ) {

			this._array[ 0 ] = s1 * c2 * c3 - c1 * s2 * s3;
			this._array[ 1 ] = c1 * s2 * c3 + s1 * c2 * s3;
			this._array[ 2 ] = c1 * c2 * s3 - s1 * s2 * c3;
			this._array[ 3 ] = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( order === 'YZX' ) {

			this._array[ 0 ] = s1 * c2 * c3 + c1 * s2 * s3;
			this._array[ 1 ] = c1 * s2 * c3 + s1 * c2 * s3;
			this._array[ 2 ] = c1 * c2 * s3 - s1 * s2 * c3;
			this._array[ 3 ] = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( order === 'XZY' ) {

			this._array[ 0 ] = s1 * c2 * c3 - c1 * s2 * s3;
			this._array[ 1 ] = c1 * s2 * c3 - s1 * c2 * s3;
			this._array[ 2 ] = c1 * c2 * s3 + s1 * s2 * c3;
			this._array[ 3 ] = c1 * c2 * c3 + s1 * s2 * s3;

		}

		return this;

	}

	public setFromAxisAngle( axis: Vector3, angle: number ): this {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		const halfAngle = angle / 2;
		const s = Math.sin( halfAngle );

		this._array[ 0 ] = axis.x * s;
		this._array[ 1 ] = axis.y * s;
		this._array[ 2 ] = axis.z * s;
		this._array[ 3 ] = Math.cos( halfAngle );

		return this;

	}

	public multiply( q: Quaternion ): this {

		return this.multiplyQuaternions( this, q );

	}

	public multiplyQuaternions ( a: Quaternion, b: Quaternion ): this {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		this._array[ 0 ] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._array[ 1 ] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._array[ 2 ] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._array[ 3 ] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		return this;

	}
	

}
