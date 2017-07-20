import Random from 'random-js';

var Particle = require('./Particle');
var UnionFind = require('ml-disjoint-set');
var Distance = require('ml-distance').distance;
var randomInt = require('./Utils').randomInt;

const defaultOptions = {
    unitMass : true,
    gravitationalConstant : Math.pow(10, -4),
    deltaGravitationalConstant : 0.001,
    alpha : 0.03,
    gamma : 0.2,
    dist : Distance.euclidean,
    iterations : 100,
    seed: 42
};

/**
 * @class ParticleCluster
 */
class ParticleCluster {
    /**
     * ParticleCluster constructor.
     * @param {Particle} particle - Initial particle for the cluster (optional)
     */
    constructor(particle) {
        this.elements = [];
        if (particle !== undefined) {
            this.elements.push(particle);
        }
    }
}

/**
 * @class GravitationalClustering
 */
class GravitationalClustering {

    /**
     * Create a new instance of a Gravitational Clustering algorithm
     * @param {object} options
     * @param {boolean} [options.unitMass] - the mass of each point are equal.
     * @param {number} [options.gravitationalConstant=10^-4] - Gravitational constant.
     * @param {number} [options.deltaGravitationalConstant=0.001] - Constant to reduce the gravitational constant.
     * @param {number} [options.alpha=0.03] - Minimum percentage of the dataset to become a cluster.
     * @param {number} [options.gamma=0.2] - Percentage of space used as the radius of each particle used to create the clusters.
     * @param {number} [options.dist] - Distance function that takes two points, see [ml-distance]{@link https://github.com/mljs/distance}
     * @param {number} [options.iterations=100] - Number of iterations of the algorithm.
     * @param {number} [options.seed] - seed for the random generator algorithm, must be a 32-bit integer.
     */
    constructor(options) {
        options = Object.assign({}, defaultOptions, options);
        this.unitMass = options.unitMass;
        this.gravitationalConstant = options.gravitationalConstant;
        this.deltaGravitationalConstant = options.deltaGravitationalConstant;
        this.alpha = options.alpha;
        this.gamma = options.gamma;
        this.dist = options.dist;
        this.iterations = options.iterations;
        this.seed = options.seed;

        this.particles = [];
        this.outliers = [];
        this.eps = Number.MAX_VALUE;
        this.engine = Random.engines.mt19937();
        this.engine.seed(this.seed);
    }

    /**
     * Fit
     * @param {Array} X - Points to create the clusters.
     * @param {Array} masses - Mass of each point (Optional).
     * @return {object}
     */
    train(X, masses) {
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

        this.uf = new UnionFind();
        this.disjointElems = new Array(elements);
        for (i = 0; i < elements; ++i) {
            this.disjointElems[i] = this.uf.add(i);
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

        return this.run(this.iterations);
    }

    /**
     * Move two particles closer to each other based on the gravitational constant and the selected distance function.
     * @param {Particle} particleA
     * @param {Particle} particleB
     */
    move(particleA, particleB) {
        var deltaA = Particle.moveParticle(particleA, particleB, this.gravitationalConstant, this.dist);
        for (var i = 0; i < deltaA.length; ++i) {
            particleA.position[i] += deltaA[i];
            particleB.position[i] -= deltaA[i];
        }
    }

    /**
     * Merge two particle indices in the X array to the same cluster.
     * @param {DisjointSetNode} a
     * @param {DisjointSetNode} b
     */
    merge(a, b) {
        this.uf.union(a, b);
    }

    /**
     * Run the algorithm n-iterations partially and return the obtained clusters and outliers.
     * @param {number} iterations - Partial iterations.
     * @return {object}
     */
    run(iterations) {
        var distribution = Random.integer(0, this.particles.length - 1);

        for (var i = 0; i < iterations; ++i) {
            for (var j = 0; j < this.particles.length; ++j) {
                var k = distribution(this.engine); // randomInt(this.particles.length);
                while (k === j) k = distribution(this.engine); //randomInt(this.particles.length);

                var xk = this.particles[k];
                var xj = this.particles[j];

                this.move(xk, xj);

                if (xj.distance(xk, this.dist) < this.eps) this.merge(this.disjointElems[j], this.disjointElems[k]);
            }
            this.gravitationalConstant *= (1 - this.deltaGravitationalConstant);
        }

        var clusters = {};
        for (i = 0; i < this.particles.length; ++i) {
            var particle = this.particles[i];
            var key = this.uf.find(this.disjointElems[i]).value;

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

module.exports = GravitationalClustering;
