'use strict';

var Particle = require('./Particle');
var UnionFind = require('union-find');
var Distance = require('ml-distance').distance;

class ParticleCluster {
    constructor(particle) {
        this.elements = [];
        if (particle !== undefined) {
            this.elements.push(particle);
        }
    }

    mass(unitMass) {
        if (unitMass) {
            return this.elements.length;
        }

        var totalMass = 0.0;
        for (var i = 0; i < this.elements.length; ++i) {
            totalMass += this.elements[i].mass;
        }
        return totalMass;
    }
}

/**
 * @class GravitationalClustering
 */
class GravitationalClustering {

    /**
     * Create a new instance of a Gravitational Clustering algorithm
     * @param {Object} options
     * @param {Boolean} [options.unitMass] - the mass of each point are equal.
     * @param {Number} [options.GC] - Gravitational constant (default: 10^-4)
     * @param {Number} [options.deltaGC] - Constant to reduce the gravitational constant (default: 0.001)
     * @param {Number} [options.alpha] - Minimum percentage of the dataset to become a cluster (default: 0.03)
     * @param {Number} [options.gamma] - Percentage of space used as the radius of each particle used to create the clusters (default: 0.2)
     * @param {Number} [options.dist] - Distance function that takes two points, see [ml-distance]{@link https://github.com/mljs/distance}
     * @param X {Array} - Points to create the clusters (Optional)
     * @param masses - Mass of each point for clustering (Optional)
     */
    constructor(options, X, masses) {
        if (options === undefined) options = {};
        this.unitMass = options.unitMass ? options.unitMass : true;
        this.GC = options.GC ? options.GC : Math.pow(10, -4);
        this.deltaGC = options.deltaGC ? options.deltaGC : 0.001;
        this.alpha = options.alpha ? options.alpha : 0.03;
        this.eps = Number.MAX_VALUE;
        this.gamma = options.gamma ? options.gamma : 0.2;
        this.dist = options.dist ? options.dist : Distance.euclidean;

        this.particles = [];
        this.outliers = [];

        if (X !== undefined && X.length !== 0) {
            this.set(X, masses);
        }
    }

    /**
     * Set the points and corresponding masses for the algorithm
     * @param X {Array} - Points to create the clusters.
     * @param masses {Array} - Mass of each point (Optional).
     */
    set(X, masses) {
        if (X.length === 0) {
            throw new RangeError('The matrix length should be greater than 0.');
        }
        if (masses === undefined) {
            masses = new Array(X.length);
        }

        this.particles = [];
        this.outliers = [];

        var dim = X[0].length;
        var elements = X.length;
        var minValues = new Array(dim);
        var maxValues = new Array(dim);

        for (var i = 0; i < dim; ++i) {
            minValues[i] = Number.MAX_VALUE;
            maxValues[i] = Number.MIN_VALUE;
        }

        this.uf = new UnionFind(elements);
        for (i = 0; i < elements; ++i) {
            var elem = X[i];
            var mass = masses[i];
            if (dim !== elem.length) throw new RangeError('The element at position ' + i + 'must have a size of '
                                                        + dim + ' but has: ' + elem.length);

            for (var j = 0; j < dim; ++j) {
                var comp = elem[j];
                minValues[j] = Math.min(minValues[j], comp);
                maxValues[j] = Math.max(maxValues[j], comp);
            }

            this.particles.push(new Particle(elem, mass));
        }

        this.eps = this.gamma * this.dist(maxValues, minValues);
    }

    /**
     * Move two particles closer to each other based on the gravitational constant and the selected distance function.
     * @param particleA {Particle}
     * @param particleB {Particle}
     */
    move(particleA, particleB) {
        var deltaA = Particle.moveParticle(particleA, particleB, this.GC, this.dist);
        for (var i = 0; i < deltaA.length; ++i) {
            particleA.position[i] += deltaA[i];
            particleB.position[i] -= deltaA[i];
        }
    }

    /**
     * Merge two particle indices in the X array to the same cluster.
     * @param a {Number}
     * @param b {Number}
     */
    merge(a, b) {
        this.uf.link(a, b);
    }

    /**
     * Run the algorithm n-iterations partially and return the obtained clusters and outliers.
     * you can call again this method at the current state.
     * @param iterations {Number} - Partial iterations.
     * @return {{outliers: Array, X: Array, y: Array, clusters: Number}}
     */
    run(iterations) {
        for (var i = 0; i < iterations; ++i) {
            for (var j = 0; j < this.particles.length; ++j) {
                var k = randomInt(this.particles.length);
                while (k === j) k = randomInt(this.particles.length);

                var xk = this.particles[k];
                var xj = this.particles[j];

                this.move(xk, xj);

                if (xj.distance(xk, this.dist) < this.eps) this.merge(j, k);
            }
            this.GC *= (1 - this.deltaGC);
        }

        var clusters = {};
        for (i = 0; i < this.particles.length; ++i) {
            var particle = this.particles[i];
            var key = this.uf.find(i);

            if (clusters[key] !== undefined) {
                clusters[key].elements.push(particle);
            } else {
                clusters[key] = new ParticleCluster(particle);
            }
        }

        var keys = Object.keys(clusters);
        var X = [];
        var y = [];
        for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            var particleCluster = clusters[key];
            if (particleCluster.elements.length < this.alpha * this.particles.length) {
                for (j = 0; j < particleCluster.elements.length; ++j) {
                    this.outliers.push(particleCluster.elements[j].originalPosition);
                }
            } else {
                for (j = 0; j < particleCluster.elements.length; ++j) {
                    X.push(particleCluster.elements[j].originalPosition);
                    y.push(i);
                }
            }
        }

        return {
            outliers: this.outliers,
            X: X,
            y: y,
            clusters: keys.length
        };
    }
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = GravitationalClustering;
