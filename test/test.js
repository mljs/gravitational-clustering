'use strict';

var GravitationalClustering = require('..');

describe('basic implementation', function () {

    it('Linear separable clusters', function () {
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

        var gc = new GravitationalClustering();
        var result = gc.train(arr);

        for (i = 0; i < clusters; ++i) {
            for (j = 0; j < size; ++j) {
                result.y[i * size + j].should.be.equal(expectedOutput[i * size + j]);
            }
        }
    });

    it('Non-linear clusters', function () {
        var size = 200;
        var arr = new Array(size * 5);
        for (var i = 0; i < size; ++i) {
            arr[i] = [random(0, 20), random(0, 1)];
            arr[200 + i] = [random(0, 1), random(0, 20)];
            arr[400 + i] = [random(19, 20), random(0, 20)];
            arr[600 + i] = [random(0, 20), random(19, 20)];
            arr[800 + i] = [random(9, 11), random(9, 11)];
        }

        var gc = new GravitationalClustering();
        var result = gc.train(arr);

        for (i = 0; i < 800; i++) {
            result.y[i].should.be.equal(0);
        }
        for (i = 800; i < 1000; i++) {
            result.y[i].should.be.equal(1);
        }
    });
});


function random(min, max) {
    return Math.random() * (max - min) + min;
}
