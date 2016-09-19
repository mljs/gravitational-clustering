# ml-gravitational-clustering

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![David deps][david-image]][david-url]
  [![npm download][download-image]][download-url]
  
Gravitational Clustering by J. Gómez based on the [po kong lai](https://github.com/pokonglai/GravClustering) implementation.

if you want to understand more about the algorithm, see this [page](http://pokonglai.com/software/gravitational-clustering/).

## Installation

```
$ npm install ml-gravitational-clustering
```

## Example
```js
var X = ... // dataset matrix
var masses = ... // mass of each element on the dataset (if you want).

var Distance = require('ml-distance').distance;
var GC = require('ml-gravitational-clustering');
var gc = new GC({
    unitMass: false,
    GC: Math.pow(10, -2),
    deltaGC: 0.01,
    alpha: 0.05,
    gamma: 0.05,
    dist: Distance.euclidean
});

// run 20 iterations
var result = gc.run(20);

console.log(result.clusters);
console.log(result.outliers);
console.log(result.y); // predictions

```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-ml-gravitational-clustering.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ml-ml-gravitational-clustering
[travis-image]: https://img.shields.io/travis/mljs/ml-gravitational-clustering/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/ml-gravitational-clustering
[david-image]: https://img.shields.io/david/mljs/ml-gravitational-clustering.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/ml-gravitational-clustering
[download-image]: https://img.shields.io/npm/dm/ml-ml-gravitational-clustering.svg?style=flat-square
[download-url]: https://npmjs.org/package/ml-ml-gravitational-clustering
