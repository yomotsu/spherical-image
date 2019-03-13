// based on https://github.com/mrdoob/eventdispatcher.js/

export type Listener = ( event?: DispatcherEvent ) => void;

export interface DispatcherEvent {
	type: string;
	[ key: string ]: any;
}

export class EventDispatcher {

	protected _listeners: { [ type: string ]: Listener[] };

	constructor() {

		this._listeners = {};

	}

	public addEventListener( type: string, listener: Listener ): void {

		const listeners = this._listeners;

		if ( listeners[ type ] === undefined ) listeners[ type ] = [];

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}
	}

	// public hasEventListener( type: string, listener: Listener ): boolean {

	// 	const listeners = this._listeners;

	// 	return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	// }

	// public removeEventListener(type: string, listener: Listener): void {

	// 	const listeners = this._listeners;
	// 	const listenerArray = listeners[type];

	// 	if (listenerArray !== undefined) {
	// 		const index = listenerArray.indexOf(listener);

	// 		if (index !== -1) {
	// 			listenerArray.splice(index, 1);
	// 		}
	// 	}
	// }

	public removeAllEventListeners( type?: string ): void {

		if ( ! type ) {

			this._listeners = {};
			return;

		}

		if ( Array.isArray( this._listeners[ type ] ) ) this._listeners[ type ].length = 0;

	}

	public dispatchEvent(event: DispatcherEvent): void {

		const listeners = this._listeners;
		const listenerArray = listeners[event.type];

		if ( listenerArray !== undefined ) {

			event.target = this;
			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}
		}

	}
}
