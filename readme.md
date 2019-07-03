# spherical-image

Very lightweight 360deg spherical image viewer

[![Latest NPM release](https://img.shields.io/npm/v/spherical-image.svg)](https://www.npmjs.com/package/spherical-image)
![MIT License](https://img.shields.io/npm/l/spherical-image.svg)

## Demos

- [basic](https://yomotsu.github.io/spherical-image/examples/index.html)

## Usage

```shell
$ npm install --save spherical-image
```

then
```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

```javascript
import SphericalImage from 'spherical-image';

new SphericalImage(
  document.getElementById( 'myCanvas' ),
  './img.jpg'
);
```

or

```html
<script src="./js/spherical-image.js"></script>
```

```javascript
const sphericalImage = new SphericalImage(
  document.getElementById( 'myCanvas' ),
  './img.jpg'
);
```

## Options

The third argument is options.

```js
const sphericalImage = new SphericalImage(
  document.getElementById( 'myCanvas' ),
  './img.jpg',
  options
);
```

- `options.offsetAzimuth`: default horizontal rotation in radian. default is `0`
- `options.offsetAltitude`: default vertical rotation in radian. default is `0`


## Methods

- `.reset()`: reset view rotation.
- `.setSize( width, height )`: set canvas size.
- `.destroy()`: destroy the instance. dispose WebGL. detach all events.
