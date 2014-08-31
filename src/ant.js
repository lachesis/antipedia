var _ = require('lodash');
var utilities = require('./utilities');
var wikiget = require('./wikiget');
var ctrl = require('ctrl');
var murmur = require('murmurhash');

var gPathWeights = {};
var PARM_RANDOMNESS = 0.05;
var PARM_MAX_LENGTH = 30;
var PARM_WEIGHT_TO_ADD = 10;

function Ant(home, target) {
    this.stack = [{url: home, hash: null}];
    this.target = target;
    this.dead = false;
    this.antId = Ant.prototype.antId;
    Ant.prototype.antId++;
}

Ant.prototype.antId = 1;

Ant.prototype.log = function(msg) {
    console.log("Ant #" + this.antId + ": " + JSON.stringify(msg));    
}

Ant.prototype.current = function() {
    return this.stack[this.stack.length - 1].url;
};

Ant.prototype.won = function() {
    return this.current() == this.target;
}

Ant.prototype.lost = function() {
    return this.dead || this.stack.length > PARM_MAX_LENGTH;
}

Ant.prototype.markPath = function() {
    this.log("Won with a length of " + this.stack.length);

    var x;
    while (x = this.stack.pop()) {
        gPathWeights[x.hash] = (gPathWeights[x.hash] || 1) + PARM_WEIGHT_TO_ADD;
    }
}

Ant.prototype.kill = function() {
    this.log("Ant killed on " + this.current());
    this.dead = true;
}

Ant.prototype.walk = function(callback) {
    var current = this.current();

    this.log("Depth: " + this.stack.length + " Visiting " + current);

    var self = this;
    wikiget.wikiGet(current, function(urls, hasHitler) {
        if (urls.length == 0) {
            self.kill();
            return;
        }

        if (hasHitler) {
            self.markPath();
            callback && callback(true);
            return;
        }

        if (self.lost()) {
            callback && callback(false);
            return;
        }

        var pathObjs = urls.map(function(elm) { 
            var hash = murmur.v3(current + '~' + elm);
            var weight = gPathWeights[hash] || 1;
            return {
                url: elm,
                hash: hash,
                weight: weight
            };
        });

        var weightSum = pathObjs.map(function(elm) { return elm.weight; }).reduce(function(a,b) { return a+b; });

        var rnd = Math.random() * weightSum;

        pathObjs = _.shuffle(pathObjs);

//console.log(weightSum);
//console.log(rnd);

        var runningWeightSum = 0;
        var bestPath = pathObjs.filter(function(elm) { 
//console.log(runningWeightSum);
//console.dir(elm);
            runningWeightSum += elm.weight;
            return runningWeightSum >= rnd;
        })[0];

        // Push the best path on the stack
        self.stack.push(bestPath);

        self.walk();
    });
}

for (var i = 0; i < 50; i++) {
    (new Ant('http://en.wikipedia.org/wiki/Gun', 'http://en.wikipedia.org/wiki/M16_rifle')).walk();
}
