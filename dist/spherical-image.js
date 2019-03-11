/*!
 * spherical-image
 * https://github.com/yomotsu/spherical-image
 * (c) 2019 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.SphericalImage = factory());
}(this, function () { 'use strict';

	var Matrix4 = (function () {
	    function Matrix4() {
	        this._array = new Float32Array(16);
	        this.identity();
	    }
	    Matrix4.prototype.extract = function () {
	        return this._array;
	    };
	    Matrix4.prototype.identity = function () {
	        var array = this._array;
	        array[0] = 1;
	        array[1] = 0;
	        array[2] = 0;
	        array[3] = 0;
	        array[4] = 0;
	        array[5] = 1;
	        array[6] = 0;
	        array[7] = 0;
	        array[8] = 0;
	        array[9] = 0;
	        array[10] = 1;
	        array[11] = 0;
	        array[12] = 0;
	        array[13] = 0;
	        array[14] = 0;
	        array[15] = 1;
	        return this;
	    };
	    Matrix4.prototype.makeRotationFromEulerXYZ = function (x, y, z) {
	        var array = this._array;
	        var a = Math.cos(x), b = Math.sin(x);
	        var c = Math.cos(y), d = Math.sin(y);
	        var e = Math.cos(z), f = Math.sin(z);
	        var ae = a * e, af = a * f, be = b * e, bf = b * f;
	        array[0] = c * e;
	        array[4] = -c * f;
	        array[8] = d;
	        array[1] = af + be * d;
	        array[5] = ae - bf * d;
	        array[9] = -b * c;
	        array[2] = bf - ae * d;
	        array[6] = be + af * d;
	        array[10] = a * c;
	        array[3] = 0;
	        array[7] = 0;
	        array[11] = 0;
	        array[12] = 0;
	        array[13] = 0;
	        array[14] = 0;
	        array[15] = 1;
	        return this;
	    };
	    Matrix4.prototype.perspective = function (fovy, aspect, near, far) {
	        var array = this._array;
	        var f = 1.0 / Math.tan(fovy * 0.5);
	        var nf = 1 / (near - far);
	        array[0] = f / aspect;
	        array[1] = 0;
	        array[2] = 0;
	        array[3] = 0;
	        array[4] = 0;
	        array[5] = f;
	        array[6] = 0;
	        array[7] = 0;
	        array[8] = 0;
	        array[9] = 0;
	        array[10] = (far + near) * nf;
	        array[11] = -1;
	        array[12] = 0;
	        array[13] = 0;
	        array[14] = (2 * far * near) * nf;
	        array[15] = 0;
	        return this;
	    };
	    return Matrix4;
	}());

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	var webglStats = {
	    enable: false,
	    maxTextureSize: 0,
	};
	var canvas = document.createElement('canvas');
	var gl = WebGLRenderingContext && (canvas.getContext('webgl') ||
	    canvas.getContext('experimental-webgl'));
	if (gl) {
	    webglStats.enable = true;
	    webglStats.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	    var extension = gl.getExtension('WEBGL_lose_context');
	    if (extension)
	        extension.loseContext();
	}

	var EventDispatcher = (function () {
	    function EventDispatcher() {
	        this._listeners = {};
	    }
	    EventDispatcher.prototype.addEventListener = function (type, listener) {
	        var listeners = this._listeners;
	        if (listeners[type] === undefined)
	            listeners[type] = [];
	        if (listeners[type].indexOf(listener) === -1) {
	            listeners[type].push(listener);
	        }
	    };
	    EventDispatcher.prototype.dispatchEvent = function (event) {
	        var listeners = this._listeners;
	        var listenerArray = listeners[event.type];
	        if (listenerArray !== undefined) {
	            event.target = this;
	            var array = listenerArray.slice(0);
	            for (var i = 0, l = array.length; i < l; i++) {
	                array[i].call(this, event);
	            }
	        }
	    };
	    return EventDispatcher;
	}());

	var EMPTY_TEXTURE = document.createElement('canvas');
	EMPTY_TEXTURE.width = 1;
	EMPTY_TEXTURE.height = 1;
	var RADIUS = 1;
	var LATITUDE_BANDS = 32;
	var LONGITUDE_BANDS = 32;
	var vertexPositionData = [];
	var normalData = [];
	var textureCoordData = [];
	for (var latNumber = 0; latNumber <= LATITUDE_BANDS; latNumber++) {
	    var theta = latNumber * Math.PI / LATITUDE_BANDS;
	    var sinTheta = Math.sin(theta);
	    var cosTheta = Math.cos(theta);
	    for (var longNumber = 0; longNumber <= LONGITUDE_BANDS; longNumber++) {
	        var phi = longNumber * 2 * Math.PI / LONGITUDE_BANDS + Math.PI / 2;
	        var sinPhi = Math.sin(phi);
	        var cosPhi = Math.cos(phi);
	        var x = cosPhi * sinTheta;
	        var y = cosTheta;
	        var z = sinPhi * sinTheta;
	        var u = (longNumber / LONGITUDE_BANDS);
	        var v = 1 - (latNumber / LATITUDE_BANDS);
	        normalData.push(x);
	        normalData.push(y);
	        normalData.push(z);
	        textureCoordData.push(u);
	        textureCoordData.push(v);
	        vertexPositionData.push(RADIUS * x);
	        vertexPositionData.push(RADIUS * y);
	        vertexPositionData.push(RADIUS * z);
	    }
	}
	var indexData = [];
	for (var latNumber = 0; latNumber < LATITUDE_BANDS; latNumber++) {
	    for (var longNumber = 0; longNumber < LONGITUDE_BANDS; longNumber++) {
	        var first = (latNumber * (LONGITUDE_BANDS + 1)) + longNumber;
	        var second = first + LONGITUDE_BANDS + 1;
	        indexData.push(first);
	        indexData.push(second);
	        indexData.push(first + 1);
	        indexData.push(second);
	        indexData.push(second + 1);
	        indexData.push(first + 1);
	    }
	}
	var INDEX_BUFFER_DATA = new Uint16Array(indexData);
	var POSITION_BUFFER_DATA = new Float32Array(vertexPositionData);
	var NORMAL_BUFFER_DATA = new Float32Array(normalData);
	var TEXTURE_COORD_BUFFER_DATA = new Float32Array(textureCoordData);
	var ATTRIBUTES = {
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
	var SphereMesh = (function (_super) {
	    __extends(SphereMesh, _super);
	    function SphereMesh(textureSource, defaultRotationPhi, defaultRotationTheta) {
	        var _this = _super.call(this) || this;
	        _this._baseTexture = EMPTY_TEXTURE;
	        _this._modelMatrix = new Matrix4;
	        _this._modelMatrix.makeRotationFromEulerXYZ(defaultRotationPhi, defaultRotationTheta, 0);
	        Object.defineProperty(_this, 'defaultRotationPhi', { value: defaultRotationPhi });
	        Object.defineProperty(_this, 'defaultRotationTheta', { value: defaultRotationTheta });
	        _this.updateTexture(textureSource);
	        return _this;
	    }
	    Object.defineProperty(SphereMesh.prototype, "attributes", {
	        get: function () {
	            return ATTRIBUTES;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SphereMesh.prototype, "modelMatrix", {
	        get: function () {
	            return this._modelMatrix;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SphereMesh.prototype, "baseTexture", {
	        get: function () {
	            return this._baseTexture;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    SphereMesh.prototype.rotate = function (phi, theta) {
	        this._modelMatrix.makeRotationFromEulerXYZ(phi, theta, 0);
	    };
	    SphereMesh.prototype.updateTexture = function (textureSource) {
	        var _this = this;
	        if (typeof textureSource === 'string') {
	            var image_1 = new Image();
	            var onload_1 = function () {
	                _this._baseTexture = isPowerOfTwoImage(image_1) ? image_1 : resizeImage(image_1);
	                _this.dispatchEvent({ type: 'textureUpdated' });
	                image_1.removeEventListener('load', onload_1);
	            };
	            image_1.addEventListener('load', onload_1);
	            image_1.src = textureSource;
	        }
	        else if (textureSource instanceof HTMLCanvasElement) {
	            this._baseTexture = isPowerOfTwoImage(textureSource) ? textureSource : resizeImage(textureSource);
	            this.dispatchEvent({ type: 'textureUpdated' });
	        }
	    };
	    return SphereMesh;
	}(EventDispatcher));
	function resizeImage(image) {
	    var width = Math.min(ceilPowerOfTwo(image.width), webglStats.maxTextureSize);
	    var height = Math.min(ceilPowerOfTwo(image.height), webglStats.maxTextureSize);
	    var canvas = document.createElement('canvas');
	    var context = canvas.getContext('2d');
	    canvas.width = width;
	    canvas.height = height;
	    context.drawImage(image, 0, 0, width, height);
	    return canvas;
	}
	function isPowerOfTwoImage(image) {
	    return isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
	}
	function isPowerOfTwo(value) {
	    return (value & (value - 1)) === 0 && value !== 0;
	}
	function ceilPowerOfTwo(value) {
	    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
	}

	var VERTEX_SHADER_SOURCE = "\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n\tgl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4( aVertexPosition, 1.0 );\n\tvTextureCoord = aTextureCoord;\n}\n";
	var FRAGMENT_SHADER_SOURCE = "\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nvoid main( void ) {\n\tvec4 textureColor = texture2D( uSampler, vTextureCoord );\n\tgl_FragColor = vec4( textureColor.rgb, 1.0 );\n}\n";
	function createVertexShader(gl) {
	    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertexShader, VERTEX_SHADER_SOURCE);
	    gl.compileShader(vertexShader);
	    return vertexShader;
	}
	function createFragmentShader(gl) {
	    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SOURCE);
	    gl.compileShader(fragmentShader);
	    return fragmentShader;
	}
	function createShaderProgram(gl, vertexShader, fragmentShader) {
	    var shaderProgram = gl.createProgram();
	    gl.attachShader(shaderProgram, vertexShader);
	    gl.attachShader(shaderProgram, fragmentShader);
	    gl.linkProgram(shaderProgram);
	    gl.useProgram(shaderProgram);
	    return shaderProgram;
	}
	function uploadObject(gl, shaderProgram, object) {
	    var webGLProperty = {
	        attributeBuffers: {
	            indexBuffer: gl.createBuffer(),
	            positionBuffer: gl.createBuffer(),
	            textureCoordBuffer: gl.createBuffer(),
	        },
	        attributeLocations: {
	            positionLocation: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
	            textureCoordLocation: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
	        },
	        uniformValues: {
	            textureValue: gl.createTexture(),
	        },
	        uniformLocations: {
	            projectionMatrixLocation: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
	            viewMatrixLocation: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
	            modelMatrixLocation: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
	            textureLocation: gl.getUniformLocation(shaderProgram, 'uSampler'),
	        }
	    };
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, object.attributes.index.array, gl.STATIC_DRAW);
	    gl.bindBuffer(gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, object.attributes.textureCoord.array, gl.STATIC_DRAW);
	    gl.bindBuffer(gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, object.attributes.position.array, gl.STATIC_DRAW);
	    gl.enableVertexAttribArray(webGLProperty.attributeLocations.positionLocation);
	    gl.enableVertexAttribArray(webGLProperty.attributeLocations.textureCoordLocation);
	    uploadTexture(gl, object.baseTexture, webGLProperty.uniformValues.textureValue);
	    object.addEventListener('textureUpdated', function () {
	        uploadTexture(gl, object.baseTexture, webGLProperty.uniformValues.textureValue);
	    });
	    return webGLProperty;
	}
	function uploadTexture(gl, baseTexture, webglTexture) {
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +true);
	    gl.bindTexture(gl.TEXTURE_2D, webglTexture);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, baseTexture);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	    gl.generateMipmap(gl.TEXTURE_2D);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	}

	var DEG2RAD = Math.PI / 180;
	var PI_HALF = Math.PI * 0.5;
	var PI_2 = Math.PI * 2;
	var CAMERA_FOV = 45;
	var CAMERA_NEAR = 0.1;
	var CAMERA_FAR = 100;
	var SphericalImage = (function () {
	    function SphericalImage(canvas, textureSource, options) {
	        if (options === void 0) { options = {}; }
	        var _this = this;
	        this._willRender = true;
	        this._viewMatrix = new Matrix4();
	        this._cameraRotation = new Float32Array([0, 0, 0]);
	        this._cameraRotationTo = new Float32Array([0, 0, 0]);
	        this._webGLProperties = new WeakMap();
	        this._destoried = false;
	        this.dampingFactor = 0.1;
	        var scope = this;
	        this._canvas = canvas;
	        this._width = canvas.width;
	        this._height = canvas.height;
	        this._gl = getWebglContext(canvas);
	        this._gl.viewport(0, 0, this._width, this._height);
	        this._gl.clearColor(0, 0, 0, 1);
	        this._gl.enable(this._gl.DEPTH_TEST);
	        this._vertexShader = createVertexShader(this._gl);
	        this._fragmentShader = createFragmentShader(this._gl);
	        this._shaderProgram = createShaderProgram(this._gl, this._vertexShader, this._fragmentShader);
	        this._projectionMatrix = new Matrix4();
	        this._projectionMatrix.perspective(CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR);
	        this._sphereMesh0 = new SphereMesh(textureSource, options.defaultRotationPhi || 0, options.defaultRotationTheta || 0);
	        this._webGLProperties.set(this._sphereMesh0, uploadObject(this._gl, this._shaderProgram, this._sphereMesh0));
	        this._sphereMesh0.addEventListener('textureUpdated', function () { return _this._willRender = true; });
	        var lastElapsedTime = 0;
	        var requestAnimationFrameId = 0;
	        (function tick(elapsed) {
	            if (scope._destoried)
	                return;
	            requestAnimationFrameId = requestAnimationFrame(tick);
	            var delta = elapsed - lastElapsedTime;
	            updateCameraRotation(delta);
	            scope._render();
	            lastElapsedTime = elapsed;
	        })(0);
	        var lastDragX = 0;
	        var lastDragY = 0;
	        this._canvas.addEventListener('mousedown', onMouseDown);
	        this._canvas.addEventListener('touchstart', onTouchStart);
	        this._canvas.addEventListener('contextmenu', onContextMenu);
	        function onMouseDown(event) {
	            event.preventDefault();
	            startDragging(event);
	        }
	        function onTouchStart(event) {
	            event.preventDefault();
	            startDragging(event);
	        }
	        function onContextMenu(event) {
	            event.preventDefault();
	        }
	        function startDragging(event) {
	            var _event = normalizePointerEvent(event);
	            lastDragX = _event.pageX;
	            lastDragY = _event.pageY;
	            document.addEventListener('mousemove', dragging, { passive: false });
	            document.addEventListener('touchmove', dragging, { passive: false });
	            document.addEventListener('mouseup', endDragging);
	            document.addEventListener('touchend', endDragging);
	        }
	        function dragging(event) {
	            var _event = normalizePointerEvent(event);
	            var deltaX = _event.pageX - lastDragX;
	            var deltaY = _event.pageY - lastDragY;
	            scope._cameraRotationTo[0] += (deltaY * -0.1) * DEG2RAD;
	            scope._cameraRotationTo[1] += (deltaX * -0.1) * DEG2RAD;
	            lastDragX = _event.pageX;
	            lastDragY = _event.pageY;
	        }
	        function endDragging() {
	            document.removeEventListener('mousemove', dragging);
	            document.removeEventListener('touchmove', dragging);
	            document.removeEventListener('mouseup', endDragging);
	            document.removeEventListener('touchend', endDragging);
	        }
	        function updateCameraRotation(delta) {
	            var lerpRatio = 1 - Math.exp(-scope.dampingFactor * delta / 16);
	            var deltaX = scope._cameraRotationTo[0] - scope._cameraRotation[0];
	            var deltaY = scope._cameraRotationTo[1] - scope._cameraRotation[1];
	            if (Math.abs(deltaX) > 1e-5 || Math.abs(deltaY) > 1e-5) {
	                scope._cameraRotation[0] += deltaX * lerpRatio;
	                scope._cameraRotation[1] += deltaY * lerpRatio;
	                scope._willRender = true;
	            }
	        }
	        this.destory = function () {
	            _this._destoried = true;
	            _this._willRender = false;
	            cancelAnimationFrame(requestAnimationFrameId);
	            _this._gl.activeTexture(_this._gl.TEXTURE0);
	            _this._gl.bindTexture(_this._gl.TEXTURE_2D, null);
	            _this._gl.bindBuffer(_this._gl.ARRAY_BUFFER, null);
	            _this._gl.bindBuffer(_this._gl.ELEMENT_ARRAY_BUFFER, null);
	            _this._gl.bindRenderbuffer(_this._gl.RENDERBUFFER, null);
	            _this._gl.bindFramebuffer(_this._gl.FRAMEBUFFER, null);
	            var webGLProperty = _this._webGLProperties.get(_this._sphereMesh0);
	            _this._gl.deleteBuffer(webGLProperty.attributeBuffers.indexBuffer);
	            _this._gl.deleteBuffer(webGLProperty.attributeBuffers.positionBuffer);
	            _this._gl.deleteBuffer(webGLProperty.attributeBuffers.textureCoordBuffer);
	            _this._gl.deleteTexture(webGLProperty.uniformValues.textureValue);
	            _this._gl.deleteShader(_this._vertexShader);
	            _this._gl.deleteShader(_this._fragmentShader);
	            _this._gl.deleteProgram(_this._shaderProgram);
	            _this._canvas.removeEventListener('mousedown', onMouseDown);
	            _this._canvas.removeEventListener('touchstart', onTouchStart);
	            _this._canvas.removeEventListener('contextmenu', onContextMenu);
	            document.removeEventListener('mousemove', dragging);
	            document.removeEventListener('touchmove', dragging);
	            document.removeEventListener('mouseup', endDragging);
	            document.removeEventListener('touchend', endDragging);
	        };
	    }
	    SphericalImage.prototype.setSize = function (width, height) {
	        this._width = width;
	        this._height = height;
	        this._canvas.width = this._width;
	        this._canvas.height = this._height;
	        this._gl.viewport(0, 0, this._width, this._height);
	        this._projectionMatrix.perspective(CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR);
	        this._willRender = true;
	    };
	    SphericalImage.prototype._render = function () {
	        if (!this._willRender)
	            return;
	        var gl = this._gl;
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        this._cameraRotationTo[0] = Math.min(this._cameraRotationTo[0], PI_HALF - 1e-10);
	        this._cameraRotationTo[0] = Math.max(this._cameraRotationTo[0], -PI_HALF + 1e-10);
	        this._viewMatrix.makeRotationFromEulerXYZ(this._cameraRotation[0], this._cameraRotation[1], 0);
	        this._renderObject(this._sphereMesh0);
	        this._willRender = false;
	    };
	    SphericalImage.prototype._renderObject = function (object) {
	        var gl = this._gl;
	        var webGLProperty = this._webGLProperties.get(object);
	        gl.activeTexture(gl.TEXTURE0);
	        gl.bindTexture(gl.TEXTURE_2D, webGLProperty.uniformValues.textureValue);
	        gl.uniform1i(webGLProperty.uniformLocations.textureLocation, 0);
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer);
	        gl.bindBuffer(gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer);
	        gl.vertexAttribPointer(webGLProperty.attributeLocations.positionLocation, this._sphereMesh0.attributes.position.itemSize, gl.FLOAT, false, 0, 0);
	        gl.bindBuffer(gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer);
	        gl.vertexAttribPointer(webGLProperty.attributeLocations.textureCoordLocation, this._sphereMesh0.attributes.textureCoord.itemSize, gl.FLOAT, false, 0, 0);
	        gl.uniformMatrix4fv(webGLProperty.uniformLocations.modelMatrixLocation, false, this._sphereMesh0.modelMatrix.extract());
	        gl.uniformMatrix4fv(webGLProperty.uniformLocations.viewMatrixLocation, false, this._viewMatrix.extract());
	        gl.uniformMatrix4fv(webGLProperty.uniformLocations.projectionMatrixLocation, false, this._projectionMatrix.extract());
	        gl.drawElements(gl.TRIANGLES, this._sphereMesh0.attributes.index.numItems, gl.UNSIGNED_SHORT, 0);
	    };
	    SphericalImage.prototype.reset = function () {
	        this._cameraRotation[0] = this._cameraRotation[0] % PI_2;
	        this._cameraRotation[1] = this._cameraRotation[1] % PI_2;
	        this._cameraRotationTo[0] = 0;
	        this._cameraRotationTo[1] = 0;
	    };
	    return SphericalImage;
	}());
	function getWebglContext(canvas) {
	    var contextAttributes = {
	        alpha: false,
	        depth: false,
	        stencil: false,
	        antialias: false,
	        premultipliedAlpha: false,
	        preserveDrawingBuffer: false,
	        powerPreference: false,
	    };
	    return (canvas.getContext('webgl', contextAttributes) ||
	        canvas.getContext('experimental-webgl', contextAttributes));
	}
	function normalizePointerEvent(event) {
	    return 'ontouchstart' in window && event instanceof TouchEvent ? event.touches[0] : event;
	}

	return SphericalImage;

}));
