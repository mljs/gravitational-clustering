'use strict';

var Particle = require('./Particle');
var UnionFind = require('union-find');
var Distance = require('ml-distance').distance;

class ParticleCluster {
    constructor(particle) {
        this.elements = [];
        if(particle !== undefined) {
            this.elements.push(particle);
        }
    }

    mass(unitMass) {
        if(unitMass) {
            return this.elements.length;
        }

        var totalMass = 0.0;
        for(var i = 0; i < this.elements.length; ++i) {
            totalMass += this.elements[i].mass;
        }
        return totalMass;
    }
}

class GravitationalClustering {
    constructor(options, X) {
        if(options == undefined) options = {};
        this.unitMass = options.unitMass ? options.unitMass : true;
        this.GC = options.GC ? options.GC : Math.pow(10, -4);
        this.deltaGC = options.deltaGC ? options.deltaGC : 0.001;
        this.alpha = options.alpha ? options.alpha : 0.03;
        this.eps = Number.MAX_VALUE;
        this.gamma = options.gamma ? options.gamma : 0.6;
        this.dist = options.dist ? options.dist : Distance.euclidean;

        this.particles = [];
        this.outliers = [];

        if(X !== undefined && X.length !== 0) {
            this.set(X);
        }
    }

    set(X) {
        if(X.length === 0) {
            throw new RangeError("The matrix length should be greater than 0.");
        }

        this.particles = [];
        this.outliers = [];

        var dim = X[0].length;
        var elements = X.length;
        var minValues = new Array(elements);
        var maxValues = new Array(elements);

        for(var i = 0; i < dim; ++i) {
            minValues[i] = Number.MAX_VALUE;
            maxValues[i] = Number.MIN_VALUE;
        }

        this.uf = new UnionFind(elements);
        for(i = 0; i < elements; ++i) {
            var elem = X[i];
            if(dim !== elem.length) throw new RangeError("The element at position " + i + "must have a size of "
                                                        + dim + " but has: " + elem.length);

            for(var j = 0 ; j < dim; ++j) {
                var comp = elem[j];
                minValues[j] = Math.min(minValues[j], comp);
                maxValues[j] = Math.max(maxValues[j], comp);
            }

            this.particles.push(new Particle(elem));
        }

        var dist = 0.0;

        for(i = 0; i < dim; ++i) {
            var min = minValues[i];
            var max = maxValues[i];
            dist += ((max - min) * (max - min));
        }

        this.eps = this.gamma * Math.sqrt(dist);
    }

    move(particleA, particleB) {
        var deltaA = Particle.moveParticle(particleA, particleB, this.GC, this.dist);
        for(var i = 0; i < deltaA.length; ++i) {
            particleA.position[i] += deltaA[i];
            particleB.position[i] -= deltaA[i];
        }
    }

    merge(a, b) {
        this.uf.link(a, b);
    }

    run(iterations) {
        for(var i = 0; i < iterations; ++i) {
            for(var j = 0; j < this.particles.length; ++i) {
                var k = randomInt(this.particles.length);
                while(k !== j) k = randomInt(this.particles.length);

                var xk = this.particles[k];
                var xj = this.particles[j];

                this.move(xk, xj);

                if(xj.distance(xk, this.dist) < this.eps) this.merge(j, k);
            }
            this.GC *= (1 - this.deltaGC);
        }
    }
}

function randomInt(max)
{
    return Math.floor(Math.random()*max);
}