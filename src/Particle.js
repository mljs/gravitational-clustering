'use strict';

class Particle {
    constructor(position, mass) {
        this.position = new Array(position.length);
        for(var i = 0; i < position.length; ++i) {
            this.position[i] = position[i];
        }

        this.mass = mass == undefined ? 1.0 : mass;
    }

    distance(particle, dist) {
        return dist(this.position, particle.position);
    }

    static moveParticle(particleA, particleB, gravityConstant, distFunction) {
        var dimension = particleA.length;

        var magnitude = 0.0;
        var difference = new Array(dimension);

        for(var i = 0; i < dimension; ++i) {
            difference[i] = particleB.position[i] - particleA.position[i];
            magnitude += (difference[i] * difference[i]);
        }

        magnitude = distFunction(particleA.position, particleB.position);

        var scale = 0.0;
        if(magnitude > 0) scale = (gravityConstant * particleA.mass * particleB.mass) / (2.0 * magnitude * magnitude * magnitude);

        var move = new Array(dimension);
        for(i = 0 ; i < dimension; ++i) move[i] = difference[i] * scale;

        return move;
    }
}
