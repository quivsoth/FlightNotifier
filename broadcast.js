var http = require('http');
var bodyParser = require('body-parser');
var config = require('./config');

module.exports = {
    Send: function (text, languageCode) {
        var body = "[" + JSON.stringify({
            mediaTitle: text,
            mediaSubtitle: "fl",
            googleTTS: languageCode,
            mediaImageUrl: "/"
        }) + "]";

        var h = require('http');
        var post_req = null,
            post_data = body;
        var post_options = {
            hostname: config.casthostname,
            port: config.castport,
            path: '/device/' + config.googledevice + '/playMedia',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Content-Length': post_data.length
            }
        };
        post_req = http.request(post_options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ', chunk);
            });
        });
        post_req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        post_req.write(post_data);
        post_req.end();
    }
};
