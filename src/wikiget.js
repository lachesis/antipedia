//Imports Shit!
var request = require('request'); 
var cheerio = require('cheerio');
var ctrl = require('ctrl');
var urlResolve = require('url').resolve;

//Config Shits!
request = request.defaults({'proxy':'http://192.168.60.2:8090'});


function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

function errorHandler(step, error) {
    console.log(error);
}

function titleToUrl(title) {
    return 'http://en.wikipedia.org/wiki/' + title;
}

function wikiGet(url, callback) {
    var steps = [
        function(step) {
            request(url, step.next);
        },

        function(step, error, response, body) {
            if (error) {
                throw error;
            }

            if (response.statusCode != 200) {
                throw "Fucking status codes. " + response.statusCode;
            }

            var dom = cheerio.load(body);
            var urls = dom("a.mw-redirect").map(function(idx, elm) {
                return urlResolve(url, elm.attribs.href);
            });

            urls = toArray(urls);

            callback(urls);
        }
   ];

   ctrl(steps, {errorHandler: errorHandler});
}

if (require.main === module) {
    wikiGet('http://en.wikipedia.org/wiki/%22Awesome%22', function(urls) { 
        console.log(urls); 
    });
}
