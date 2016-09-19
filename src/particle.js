'use strict';

var Distance = require('ml-distance').distance;

class Particle {
    constructor(position, mass, dist) {
        this.position = position;
        this.mass = mass == undefined ? 1.0 : mass;
        this.dist = dist == undefined ? Distance.euclidean : dist;
    }

    distance(particle) {
        return this.dist(this.position, particle.position);
    }

    static moveParticle(particleA, particleB, gravityConstant) {
        var dimension = particleA.length;

        var magnitude = 0.0;
        var difference = new Array(dimension);

        for(var i = 0; i < dimension; ++i) {
            difference[i] = particleB.position[i] - particleA.position[i];
            magnitude += (difference[i] * difference[i]);
        }
        magnitude = Math.sqrt(magnitude);

        var scale = 0.0;
        if(magnitude > 0) scale = (gravityConstant * particleA.mass * particleB.mass) / (2.0 * magnitude * magnitude * magnitude);

        var move = new Array(dimension);
        for(i = 0 ; i < dimension; ++i) move[i] = difference[i] * scale;

        return move;
    }
}
