export const webglStats = {
	enable: false,
	maxTextureSize: 0,
};

const canvas = document.createElement( 'canvas' );
const gl = WebGLRenderingContext && (
	canvas.getContext( 'webgl' ) ||
	canvas.getContext( 'experimental-webgl' )
);

if ( gl ) {

	webglStats.enable = true;
	webglStats.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );

	const extension = gl.getExtension( 'WEBGL_lose_context' );
	if ( extension ) extension.loseContext();

}

