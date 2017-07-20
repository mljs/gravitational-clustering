export default class Particle {

    /**
     * Constructor of a particle.
     * @param position {Array} - the current position of the particle.
     * @param mass {number} - the mass of the particle (default: 1.0).
     */
    constructor(position, mass) {
        this.position = new Array(position.length);
        for (var i = 0; i < position.length; ++i) {
            this.position[i] = position[i];
        }

        this.mass = mass || 1.0;
        this.originalPosition = position;
    }

    /**
     * Distance between this particle and another particle with a given distance function.
     *
     * @param particle {Particle}
     * @param dist {function} - distance function.
     * @return {number}
     */
    distance(particle, dist) {
        return dist(this.position, particle.position);
    }

    /**
     * Retrieve the delta vector to calculate the new position of particle A.
     * @param particleA {Particle}
     * @param particleB {Particle}
     * @param gravityConstant {Number}
     * @param distFunction {function} - distance function.
     * @return {Array}
     */
    static moveParticle(particleA, particleB, gravityConstant, distFunction) {
        var dimension = particleA.position.length;

        var magnitude = 0.0;
        var difference = new Array(dimension);

        for (var i = 0; i < dimension; ++i) {
            difference[i] = particleB.position[i] - particleA.position[i];
            magnitude += (difference[i] * difference[i]);
        }

        magnitude = distFunction(particleA.position, particleB.position);

        var scale = 0.0;
        if (magnitude > 0) scale = (gravityConstant * particleA.mass * particleB.mass) / (2.0 * magnitude * magnitude * magnitude);

        var move = new Array(dimension);
        for (i = 0; i < dimension; ++i) move[i] = difference[i] * scale;

        return move;
    }
}
