'use strict';

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var value = 233243.2;
var pow = 3;

suite.add("Math.pow", function () {
    var test = Math.pow(value, pow);
})
.add("write exp", function () {
    var test = value * value * value;
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run();