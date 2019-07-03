import { EventDispatcher } from './EventDispatcher';
import { DEG2RAD } from './Math/constants';
import { Vector3 } from 'math/Vector3';
import { Quaternion } from './Math/Quaternion';

const ROTATION_ORDER = 'YXZ'; // 'ZXY' for the device, but 'YXZ' for us
const Z_AXIS = new Vector3( 0, 0, 1 );
const q0 = new Quaternion();
const q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

export class DeviceOrientation extends EventDispatcher {

	public offsetAlpha: number = 0; // radians
	public offsetBeta : number = 0; // radians
	public offsetGamma: number = 0; // radians
	// public offsetScreenOrientation: number = 0; // radians
	public destroy: () => void;

	private _quaternion: Quaternion = new Quaternion();
	private _deviceOrientation: {
		alpha: number;
		beta: number;
		gamma: number;
	} = {
		alpha: 0,
		beta : Math.PI / 2,
		gamma: 0,
	};
	private _screenOrientation: number = 0;
	
	constructor() {

		super();

		const onDeviceOrientationChange = ( event: DeviceOrientationEvent ) => {

			this._deviceOrientation.alpha = ( event.alpha || 0  ) * DEG2RAD;
			this._deviceOrientation.beta  = ( event.beta  || 90 ) * DEG2RAD;
			this._deviceOrientation.gamma = ( event.gamma || 0  ) * DEG2RAD;
			update();

		}

		const onScreenOrientationChange = () => {

			// https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
			this._screenOrientation = ( + window.orientation ) * DEG2RAD || 0;
			update();

		}

		const update = () => {

			const alpha = this._deviceOrientation.alpha + this.offsetAlpha; // Z
			const beta  = this._deviceOrientation.beta  + this.offsetBeta;  // X'
			const gamma = this._deviceOrientation.gamma + this.offsetGamma; // Y''
			const orient = this._screenOrientation; // O
			
			// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
			this._quaternion.setFromEuler( beta, alpha, - gamma, ROTATION_ORDER ); // orient the device
			this._quaternion.multiply( q1 ); // camera looks out the back of the device, not the top
			this._quaternion.multiply( q0.setFromAxisAngle( Z_AXIS, - orient ) ); // adjust for screen orientation

			this.dispatchEvent( { type: 'updated' } );

		}

		update();
		window.addEventListener( 'deviceorientation', onDeviceOrientationChange );
		window.addEventListener( 'orientationchange', onScreenOrientationChange );

		this.destroy = (): void => {

			window.removeEventListener( 'deviceorientation', onDeviceOrientationChange );
			window.removeEventListener( 'orientationchange', onScreenOrientationChange );

		}

	}

	get quaternion() {

		return this._quaternion;

	}

	get alpha(): number {

		return this._deviceOrientation.alpha;

	}
	get beta(): number {

		return this._deviceOrientation.beta;

	}
	get gamma(): number {

		return this._deviceOrientation.gamma;

	}

	// get screenOrientation() : number {

	// 	return this._screenOrientation;

	// }


	public calibrate() : void {

		this.offsetAlpha = - this.alpha;
		this.offsetBeta  = - this.beta;
		this.offsetGamma = - this.gamma;
		// this.screenOrientationOffset = - this.screenOrientation;

	}

}
