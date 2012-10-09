/*global describe, it*/
// Mocha test suite
var temp = require('temp');
var path = require('path');
var filelist = require('../lib/buildy/filelist');
var should = require('should');
var fixtures = require('./fixtures');

describe('filelist:', function() {
    describe('when called with a single, existing file', function() {

        it('should not call back with an error', function(done) {
            filelist([fixtures.file], function(err, data) {
                if (err) return done(err);
                done();
            });
        });

        it('should receive an array containing the filename', function(done) {
            filelist([fixtures.file], function(err, data) {
                data.should.include(fixtures.file);
                done();
            });
        });
    });

    describe('when called with a single, existing directory', function() {

        it('should not call back with an error', function(done) {
            filelist([fixtures.directory], function(err, data) {
                done(err);
            });
        });

        it('should receive an array with more than one element', function(done) {
            filelist([fixtures.directory], function(err, data) {
                data.length.should.not.equal([0, 1]);
                done();
            });
        });
    });

    describe('when called with a single, non existent file', function() {
        it('should receive an error', function(done) {
            filelist([fixtures.nonexistent], function(err, data) {
                should.exist(err);
                should.not.exist(data);
                done();
            });
        });
    });

    // Failing w/time out
    describe('when called with an excluded file', function() {
        it('should exclude that file from the results', function(done) {
            filelist([fixtures.file], function(err, data) {
                data.should.have.lengthOf(0);
                done();
            }, { exclude: [fixtures.file] });
        });
    });

    describe('when called with a file that is excluded by regex', function() {
        it('should exclude that file from the results', function(done) {
            filelist([fixtures.file], function(err, data) {
                data.should.have.lengthOf(0);
                done();
            }, { exclude: [ /test1.js/ ] });
        });
    });

    // Absolute path globs failing on win32
    describe('when called with a glob (' + fixtures.glob + ')', function() {
        it('should return an array with 2 elements', function(done) {
            var flemitter = filelist([fixtures.glob], function(err, data) {
                data.should.have.lengthOf(2);
                done();
            });

            flemitter.on('glob', function(globname) {
                console.log('globbed: ' + globname);
            });
        });
    });

    describe('when called with a specified context option', function() {
        it('should execute the callback in that context', function(done) {
            filelist(['./fixtures/test1.js'], function(err, data) {
                this.should.eql("test_suite_context");
                done();
            }, { context: "test_suite_context", exclude: [] });
        });
    });

    describe('when called with a relative directory path', function() {
        it('should only return results with relative path prefixes', function(done) {
            var relative_path = path.relative('.', fixtures.directory);

            filelist([relative_path], function(err, data) {

                data.forEach(function (item) {
                    item[0].should.not.equal('/'); // Nix
                    item[1].should.not.equal(':'); // Win32
                });

                done(err);
            });
        });
    });

    // Regression tests
    describe('when called with a directory that contains more than one item', function() {
        var callbacks = 0;

        it('should not execute the callback multiple times', function(done) {
            filelist(['./fixtures/dir'], function(err, data) {
                callbacks++;
                callbacks.should.not.equal(2);
                done();
            });
        });
    });

    describe('when called with a glob that matches no items', function() {
        it('should not time out trying to find glob matches', function(done) {
            filelist([path.join(__dirname, 'fixtures', 'dir_empty', '*')], function(err, data) {
                done(err);
            });
        });
    });
});