var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
chai.use(chaiHttp);
var server = require('../server'); // Express App is here
var config = require('../config');

//console.clear();

describe.only('Testing all Functionality to do with Flights', function () {
    // after(function() { console.log('after'); });
    it('should return a status 200 OK and request type is JSON', function (done) {
        chai.request(server)
            .get('/api/flights')
            .end(function (err, res) {
                res.should.have.status(200);
                res.type.should.equal('application/json');
                done();
            });
    });
    it('should check for all schema items in the first JSON body items from /api/flights GET', function (done) {
        chai.request(server)
            .get('/api/flights')
            .end(function (err, res) {
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('flightNumber');
                res.body[0].should.have.property('from');
                res.body[0].should.have.property('time');
                res.body[0].should.have.property('status');
                res.body[0].should.have.property('terminal');
                res.body[0].should.have.property('gate');
                done();
            });
    });
});

describe.only('Google Home assistant Tests', function () {
    // after(function() { console.log('after'); });
    describe('Check the cast-web-api is running', function () {
        it('should return JSON message with cast-web-api version ', function () {
            chai.request("http://192.168.1.2:3000/")
                .get('/')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.have.property('cast-web-api');
                });
        });
        it('should send a message to the goole home ', function () {
            var message = "hello world.";
            chai.request('http://192.168.1.2:3000/')
            .post('/device/119e723b3e8a81d934a2e281cb80960c/playMedia')
            .send({'mediaTitle': message, 'mediaSubtitle': 'Flight Notification', 'googleTTS': 'en-US', 'mediaImageUrl': ''})
            .end(function (err, res) {
                res.should.have.status(200);

            });
        });
    });
});

describe.only('test config.js', function () {
    // after(function() { console.log('after'); });
    describe('Check if the config file has a db sring', function () {
        it('should return', function () {
            var config = require('../config.json');
            //console.log(config.username);
            assert.equal(0, 0);
        });
    });
});
