/*!
 * spherical-image
 * https://github.com/yomotsu/spherical-image
 * (c) 2019 @yomotsu
 * Released under the MIT License.
 */
var DEG2RAD = Math.PI / 180;
var PI_HALF = Math.PI * 0.5;
var PI_2 = Math.PI * 2;

var Vector3 = (function () {
    function Vector3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this._array = new Float32Array([x, y, z]);
    }
    Object.defineProperty(Vector3.prototype, "x", {
        get: function () {
            return this._array[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "y", {
        get: function () {
            return this._array[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "z", {
        get: function () {
            return this._array[2];
        },
        enumerable: true,
        configurable: true
    });
    Vector3.prototype.extract = function () {
        return this._array;
    };
    return Vector3;
}());

var POSITION_ZERO = new Vector3(0, 0, 0);
var SCALE_ONE = new Vector3(1, 1, 1);
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
    Matrix4.prototype.multiplyMatrices = function (a, b) {
        var ae = a._array;
        var be = b._array;
        var te = this._array;
        var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
        var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
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
    Matrix4.prototype.makeRotationFromQuaternion = function (q) {
        return this.compose(POSITION_ZERO, q, SCALE_ONE);
    };
    Matrix4.prototype.compose = function (position, quaternion, scale) {
        var x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;
        var sx = scale.x, sy = scale.y, sz = scale.z;
        this._array[0] = (1 - (yy + zz)) * sx;
        this._array[1] = (xy + wz) * sx;
        this._array[2] = (xz - wy) * sx;
        this._array[3] = 0;
        this._array[4] = (xy - wz) * sy;
        this._array[5] = (1 - (xx + zz)) * sy;
        this._array[6] = (yz + wx) * sy;
        this._array[7] = 0;
        this._array[8] = (xz + wy) * sz;
        this._array[9] = (yz - wx) * sz;
        this._array[10] = (1 - (xx + yy)) * sz;
        this._array[11] = 0;
        this._array[12] = position.x;
        this._array[13] = position.y;
        this._array[14] = position.z;
        this._array[15] = 1;
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
    EventDispatcher.prototype.removeAllEventListeners = function (type) {
        if (!type) {
            this._listeners = {};
            return;
        }
        if (Array.isArray(this._listeners[type]))
            this._listeners[type].length = 0;
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

var Vector3$1 = (function () {
    function Vector3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this._array = new Float32Array([x, y, z]);
    }
    Object.defineProperty(Vector3.prototype, "x", {
        get: function () {
            return this._array[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "y", {
        get: function () {
            return this._array[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "z", {
        get: function () {
            return this._array[2];
        },
        enumerable: true,
        configurable: true
    });
    Vector3.prototype.extract = function () {
        return this._array;
    };
    return Vector3;
}());

var Quaternion = (function () {
    function Quaternion(x, y, z, w) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (w === void 0) { w = 1; }
        this._array = new Float32Array([x, y, z, w]);
    }
    Object.defineProperty(Quaternion.prototype, "x", {
        get: function () {
            return this._array[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "y", {
        get: function () {
            return this._array[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "z", {
        get: function () {
            return this._array[2];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "w", {
        get: function () {
            return this._array[3];
        },
        enumerable: true,
        configurable: true
    });
    Quaternion.prototype.extract = function () {
        return this._array;
    };
    Quaternion.prototype.setFromEuler = function (x, y, z, order) {
        var c1 = Math.cos(x / 2);
        var c2 = Math.cos(y / 2);
        var c3 = Math.cos(z / 2);
        var s1 = Math.sin(x / 2);
        var s2 = Math.sin(y / 2);
        var s3 = Math.sin(z / 2);
        if (order === 'XYZ') {
            this._array[0] = s1 * c2 * c3 + c1 * s2 * s3;
            this._array[1] = c1 * s2 * c3 - s1 * c2 * s3;
            this._array[2] = c1 * c2 * s3 + s1 * s2 * c3;
            this._array[3] = c1 * c2 * c3 - s1 * s2 * s3;
        }
        else if (order === 'YXZ') {
            this._array[0] = s1 * c2 * c3 + c1 * s2 * s3;
            this._array[1] = c1 * s2 * c3 - s1 * c2 * s3;
            this._array[2] = c1 * c2 * s3 - s1 * s2 * c3;
            this._array[3] = c1 * c2 * c3 + s1 * s2 * s3;
        }
        else if (order === 'ZXY') {
            this._array[0] = s1 * c2 * c3 - c1 * s2 * s3;
            this._array[1] = c1 * s2 * c3 + s1 * c2 * s3;
            this._array[2] = c1 * c2 * s3 + s1 * s2 * c3;
            this._array[3] = c1 * c2 * c3 - s1 * s2 * s3;
        }
        else if (order === 'ZYX') {
            this._array[0] = s1 * c2 * c3 - c1 * s2 * s3;
            this._array[1] = c1 * s2 * c3 + s1 * c2 * s3;
            this._array[2] = c1 * c2 * s3 - s1 * s2 * c3;
            this._array[3] = c1 * c2 * c3 + s1 * s2 * s3;
        }
        else if (order === 'YZX') {
            this._array[0] = s1 * c2 * c3 + c1 * s2 * s3;
            this._array[1] = c1 * s2 * c3 + s1 * c2 * s3;
            this._array[2] = c1 * c2 * s3 - s1 * s2 * c3;
            this._array[3] = c1 * c2 * c3 - s1 * s2 * s3;
        }
        else if (order === 'XZY') {
            this._array[0] = s1 * c2 * c3 - c1 * s2 * s3;
            this._array[1] = c1 * s2 * c3 - s1 * c2 * s3;
            this._array[2] = c1 * c2 * s3 + s1 * s2 * c3;
            this._array[3] = c1 * c2 * c3 + s1 * s2 * s3;
        }
        return this;
    };
    Quaternion.prototype.setFromAxisAngle = function (axis, angle) {
        var halfAngle = angle / 2;
        var s = Math.sin(halfAngle);
        this._array[0] = axis.x * s;
        this._array[1] = axis.y * s;
        this._array[2] = axis.z * s;
        this._array[3] = Math.cos(halfAngle);
        return this;
    };
    Quaternion.prototype.multiply = function (q) {
        return this.multiplyQuaternions(this, q);
    };
    Quaternion.prototype.multiplyQuaternions = function (a, b) {
        var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;
        this._array[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this._array[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this._array[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this._array[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        return this;
    };
    return Quaternion;
}());

var ROTATION_ORDER = 'YXZ';
var Z_AXIS = new Vector3$1(0, 0, 1);
var q0 = new Quaternion();
var q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
var DeviceOrientation = (function (_super) {
    __extends(DeviceOrientation, _super);
    function DeviceOrientation() {
        var _this = _super.call(this) || this;
        _this.offsetAlpha = 0;
        _this.offsetBeta = 0;
        _this.offsetGamma = 0;
        _this._quaternion = new Quaternion();
        _this._deviceOrientation = {
            alpha: 0,
            beta: Math.PI / 2,
            gamma: 0,
        };
        _this._screenOrientation = 0;
        var onDeviceOrientationChange = function (event) {
            _this._deviceOrientation.alpha = (event.alpha || 0) * DEG2RAD;
            _this._deviceOrientation.beta = (event.beta || 90) * DEG2RAD;
            _this._deviceOrientation.gamma = (event.gamma || 0) * DEG2RAD;
            update();
        };
        var onScreenOrientationChange = function () {
            _this._screenOrientation = (+window.orientation) * DEG2RAD || 0;
            update();
        };
        var update = function () {
            var alpha = _this._deviceOrientation.alpha + _this.offsetAlpha;
            var beta = _this._deviceOrientation.beta + _this.offsetBeta;
            var gamma = _this._deviceOrientation.gamma + _this.offsetGamma;
            var orient = _this._screenOrientation;
            _this._quaternion.setFromEuler(beta, alpha, -gamma, ROTATION_ORDER);
            _this._quaternion.multiply(q1);
            _this._quaternion.multiply(q0.setFromAxisAngle(Z_AXIS, -orient));
            _this.dispatchEvent({ type: 'updated' });
        };
        update();
        window.addEventListener('deviceorientation', onDeviceOrientationChange);
        window.addEventListener('orientationchange', onScreenOrientationChange);
        _this.destroy = function () {
            window.removeEventListener('deviceorientation', onDeviceOrientationChange);
            window.removeEventListener('orientationchange', onScreenOrientationChange);
        };
        return _this;
    }
    Object.defineProperty(DeviceOrientation.prototype, "quaternion", {
        get: function () {
            return this._quaternion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DeviceOrientation.prototype, "alpha", {
        get: function () {
            return this._deviceOrientation.alpha;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DeviceOrientation.prototype, "beta", {
        get: function () {
            return this._deviceOrientation.beta;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DeviceOrientation.prototype, "gamma", {
        get: function () {
            return this._deviceOrientation.gamma;
        },
        enumerable: true,
        configurable: true
    });
    DeviceOrientation.prototype.calibrate = function () {
        this.offsetAlpha = -this.alpha;
        this.offsetBeta = -this.beta;
        this.offsetGamma = -this.gamma;
    };
    return DeviceOrientation;
}(EventDispatcher));

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
    function SphereMesh(textureSource, offsetPhi, offsetTheta) {
        var _this = _super.call(this) || this;
        _this._baseTexture = EMPTY_TEXTURE;
        _this._modelMatrix = new Matrix4();
        _this.rotateTo(offsetPhi, offsetTheta);
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
    SphereMesh.prototype.rotateTo = function (phi, theta) {
        if (phi === void 0) { phi = 0; }
        if (theta === void 0) { theta = 0; }
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

function getWebglContext(canvas, contextAttributes) {
    return (canvas.getContext('webgl', contextAttributes) ||
        canvas.getContext('experimental-webgl', contextAttributes));
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

var mat4a = new Matrix4();
var mat4b = new Matrix4();
var CAMERA_FOV = 45;
var CAMERA_NEAR = 0.1;
var CAMERA_FAR = 100;
var SphericalImage = (function () {
    function SphericalImage(canvas, textureSource, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.dampingFactor = 0.1;
        this._willRender = true;
        this._viewMatrix = new Matrix4();
        this._cameraRotation = new Float32Array([0, 0, 0]);
        this._cameraRotationTo = new Float32Array([0, 0, 0]);
        this._webGLProperties = new WeakMap();
        this._destroyed = false;
        this._deviceOrientation = new DeviceOrientation();
        var scope = this;
        this._canvas = canvas;
        this._width = canvas.width;
        this._height = canvas.height;
        var contextAttributes = {
            alpha: false,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
        };
        this._gl = getWebglContext(canvas, contextAttributes);
        this._gl.viewport(0, 0, this._width, this._height);
        this._gl.clearColor(0, 0, 0, 1);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._vertexShader = createVertexShader(this._gl);
        this._fragmentShader = createFragmentShader(this._gl);
        this._shaderProgram = createShaderProgram(this._gl, this._vertexShader, this._fragmentShader);
        this._projectionMatrix = new Matrix4();
        this._projectionMatrix.perspective(CAMERA_FOV, this._width / this._height, CAMERA_NEAR, CAMERA_FAR);
        this._sphereMesh0 = new SphereMesh(textureSource, options.offsetAzimuth || 0, options.offsetAltitude || 0);
        this._webGLProperties.set(this._sphereMesh0, uploadObject(this._gl, this._shaderProgram, this._sphereMesh0));
        this._sphereMesh0.addEventListener('textureUpdated', function () { return _this._willRender = true; });
        var lastElapsedTime = 0;
        var requestAnimationFrameId = 0;
        (function tick(elapsed) {
            if (scope._destroyed)
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
            scope._cameraRotationTo[0] += (deltaY * -0.2) * DEG2RAD;
            scope._cameraRotationTo[1] += (deltaX * -0.2) * DEG2RAD;
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
            var lerpRatio = 1 - Math.exp(-scope.dampingFactor * delta / 8);
            var deltaX = scope._cameraRotationTo[0] - scope._cameraRotation[0];
            var deltaY = scope._cameraRotationTo[1] - scope._cameraRotation[1];
            if (Math.abs(deltaX) > 1e-5 || Math.abs(deltaY) > 1e-5) {
                scope._cameraRotation[0] += deltaX * lerpRatio;
                scope._cameraRotation[1] += deltaY * lerpRatio;
                scope._willRender = true;
            }
        }
        this._deviceOrientation.addEventListener('updated', function () {
            _this._willRender = true;
        });
        this.destroy = function () {
            _this._destroyed = true;
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
            _this._deviceOrientation.removeAllEventListeners();
            _this._deviceOrientation.destroy();
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
    SphericalImage.prototype.reset = function () {
        this._cameraRotation[0] = this._cameraRotation[0] % PI_2;
        this._cameraRotation[1] = this._cameraRotation[1] % PI_2;
        this._cameraRotationTo[0] = 0;
        this._cameraRotationTo[1] = 0;
    };
    SphericalImage.prototype.calibrate = function () {
        this._deviceOrientation.calibrate();
        this._willRender = true;
    };
    SphericalImage.prototype._render = function () {
        if (!this._willRender)
            return;
        var gl = this._gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this._cameraRotationTo[0] = Math.min(this._cameraRotationTo[0], PI_HALF - 1e-10);
        this._cameraRotationTo[0] = Math.max(this._cameraRotationTo[0], -PI_HALF + 1e-10);
        mat4a.makeRotationFromEulerXYZ(this._cameraRotation[0], this._cameraRotation[1], 0);
        mat4b.makeRotationFromQuaternion(this._deviceOrientation.quaternion);
        this._viewMatrix.multiplyMatrices(mat4a, mat4b);
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
    return SphericalImage;
}());
function normalizePointerEvent(event) {
    return 'ontouchstart' in window && event instanceof TouchEvent ? event.touches[0] : event;
}

export default SphericalImage;
