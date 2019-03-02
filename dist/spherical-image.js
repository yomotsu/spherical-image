/*!
 * spherical-image
 * https://github.com/yomotsu/spherical-image
 * (c) 2019 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.SphericalImage = {}));
}(this, function (exports) { 'use strict';

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
	        var phi = longNumber * 2 * Math.PI / LONGITUDE_BANDS;
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
	var SphiricalObject = (function (_super) {
	    __extends(SphiricalObject, _super);
	    function SphiricalObject(textureSource) {
	        var _this = _super.call(this) || this;
	        _this.attributes = {
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
	        _this.baseTexture = EMPTY_TEXTURE;
	        _this.updateTexture(textureSource);
	        return _this;
	    }
	    SphiricalObject.prototype.updateTexture = function (textureSource) {
	        var _this = this;
	        if (typeof textureSource === 'string') {
	            var image_1 = new Image();
	            var onload_1 = function () {
	                _this.baseTexture = image_1;
	                _this.dispatchEvent({ type: 'textureUpdated' });
	                image_1.removeEventListener('load', onload_1);
	            };
	            image_1.addEventListener('load', onload_1);
	            image_1.src = textureSource;
	        }
	        else if (textureSource instanceof HTMLCanvasElement) {
	            this.baseTexture = textureSource;
	            this.dispatchEvent({ type: 'textureUpdated' });
	        }
	    };
	    return SphiricalObject;
	}(EventDispatcher));

	var DEG2RAD = Math.PI / 180;
	var PI_HALF = Math.PI * 0.5;
	var vsSource = "\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uViewMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n\tgl_Position = uProjectionMatrix * uViewMatrix * vec4( aVertexPosition, 1.0 );\n\tvTextureCoord = aTextureCoord;\n}\n";
	var fsSource = "\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nvoid main( void ) {\n\tvec4 textureColor = texture2D( uSampler, vTextureCoord );\n\tgl_FragColor = vec4( textureColor.rgb, 1.0 );\n}\n";
	var Renderer = (function () {
	    function Renderer(canvas, textureSource) {
	        var _this = this;
	        var scope = this;
	        this.canvas = canvas;
	        this.width = canvas.width;
	        this.height = canvas.height;
	        this.willRender = true;
	        this.gl = canvas.getContext('experimental-webgl');
	        this.gl.viewport(0, 0, this.width, this.height);
	        this.gl.clearColor(0, 0, 0, 1);
	        this.gl.enable(this.gl.DEPTH_TEST);
	        this.shaderProgram = createShaderProgram(this.gl);
	        this.projectionMatrix = new Matrix4();
	        this.projectionMatrix.perspective(45, this.width / this.height, 0.1, 100);
	        this.viewMatrix = new Matrix4();
	        this.cameraRotation = [0, 0, 0];
	        this.webGLProperties = new WeakMap();
	        this.sphiricalObject0 = new SphiricalObject(textureSource);
	        this.webGLProperties.set(this.sphiricalObject0, uploadObject(this.gl, this.shaderProgram, this.sphiricalObject0));
	        this.willRender = true;
	        this.sphiricalObject0.addEventListener('textureUpdated', function () { return _this.willRender = true; });
	        (function tick() {
	            requestAnimationFrame(tick);
	            scope.render();
	        })();
	        var lastDragX = 0;
	        var lastDragY = 0;
	        this.canvas.addEventListener('mousedown', onMouseDown);
	        this.canvas.addEventListener('touchstart', onTouchStart);
	        this.canvas.addEventListener('contextmenu', onContextMenu);
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
	            scope.cameraRotation[0] += (deltaY * -0.1) * DEG2RAD;
	            scope.cameraRotation[1] += (deltaX * -0.1) * DEG2RAD;
	            scope.willRender = true;
	            lastDragX = _event.pageX;
	            lastDragY = _event.pageY;
	        }
	        function endDragging() {
	            document.removeEventListener('mousemove', dragging);
	            document.removeEventListener('touchmove', dragging);
	            document.removeEventListener('mouseup', endDragging);
	            document.removeEventListener('touchend', endDragging);
	        }
	    }
	    Renderer.prototype.render = function () {
	        if (!this.willRender)
	            return;
	        var gl = this.gl;
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        this.cameraRotation[0] = Math.min(this.cameraRotation[0], PI_HALF - 1e-10);
	        this.cameraRotation[0] = Math.max(this.cameraRotation[0], -PI_HALF + 1e-10);
	        this.viewMatrix.makeRotationFromEulerXYZ(this.cameraRotation[0], this.cameraRotation[1], 0);
	        this.renderObject(this.sphiricalObject0);
	        this.willRender = false;
	    };
	    Renderer.prototype.renderObject = function (object) {
	        var gl = this.gl;
	        var webGLProperty = this.webGLProperties.get(object);
	        gl.activeTexture(gl.TEXTURE0);
	        gl.bindTexture(gl.TEXTURE_2D, webGLProperty.uniformValues.textureValue);
	        gl.uniform1i(webGLProperty.uniformLocations.textureLocation, 0);
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLProperty.attributeBuffers.indexBuffer);
	        gl.bindBuffer(gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.positionBuffer);
	        gl.vertexAttribPointer(webGLProperty.attributeLocations.positionLocation, this.sphiricalObject0.attributes.position.itemSize, gl.FLOAT, false, 0, 0);
	        gl.bindBuffer(gl.ARRAY_BUFFER, webGLProperty.attributeBuffers.textureCoordBuffer);
	        gl.vertexAttribPointer(webGLProperty.attributeLocations.textureCoordLocation, this.sphiricalObject0.attributes.textureCoord.itemSize, gl.FLOAT, false, 0, 0);
	        gl.uniformMatrix4fv(webGLProperty.uniformLocations.projectionMatrixLocation, false, this.projectionMatrix.extract());
	        gl.uniformMatrix4fv(webGLProperty.uniformLocations.viewMatrixLocation, false, this.viewMatrix.extract());
	        gl.drawElements(gl.TRIANGLES, this.sphiricalObject0.attributes.index.numItems, gl.UNSIGNED_SHORT, 0);
	    };
	    return Renderer;
	}());
	function createShaderProgram(gl) {
	    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertexShader, vsSource);
	    gl.compileShader(vertexShader);
	    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fragmentShader, fsSource);
	    gl.compileShader(fragmentShader);
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
	function normalizePointerEvent(event) {
	    return 'ontouchstart' in window && event instanceof TouchEvent ? event.touches[0] : event;
	}

	exports.Renderer = Renderer;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
