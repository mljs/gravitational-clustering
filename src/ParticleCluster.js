/**
 * @class ParticleCluster
 */
export default class ParticleCluster {
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
