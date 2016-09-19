'use strict';

var GravitationalClustering = require('..');

describe('basic implementation', function () {

    it('main', function () {
        var clusters = 3;
        var size = 5;
        var arr = new Array(clusters * size);
        for (var i = 0; i < clusters; ++i) {
            var move = i * 5;
            for (var j = 0; j < size; ++j) {
                arr[i * size + j] = [Math.random() + move, Math.random() + move];
            }
        }
        var expectedOutput = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2];

        var gc = new GravitationalClustering({}, arr);
        var result = gc.run(20);

        for (i = 0; i < clusters; ++i) {
            for (j = 0; j < size; ++j) {
                result.y[i * size + j].should.be.equal(expectedOutput[i * size + j]);
            }
        }
    });
});
