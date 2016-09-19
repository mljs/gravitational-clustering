'use strict';

/**
 * @class Utils
 */
class Utils {

    /**
     * Return a random number in range [0, max)
     * @param max {Number} - max number.
     * @return {Number}
     */
    static randomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
