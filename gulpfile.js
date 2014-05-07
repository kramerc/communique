'use strict';

var async = require('async');
var gulp = require('gulp');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var standaloneGruntRunner = require('standalone-grunt-runner');

var atomShellVersion = '0.12.3';
var paths = {
  atomShell: {
    downloadDir: 'cache/atom-shell',
    outputDir: 'dep/atom-shell'
  }
};

gulp.task('default', ['run']);

gulp.task('download-atom-shell', function (callback) {
  async.map([
    paths.atomShell.downloadDir,
    paths.atomShell.outputDir
  ], mkdirp, function (err) {
    if (err) {
      return callback(err);
    }

    standaloneGruntRunner('download-atom-shell', {
      config: {
        version: atomShellVersion,
        downloadDir: paths.atomShell.downloadDir,
        outputDir: paths.atomShell.outputDir
      },
      npm: 'grunt-download-atom-shell'
    }, function () {
      callback();
    });
  });
});

gulp.task('run', ['download-atom-shell'], function () {
  if (process.platform === 'darwin') {
    spawn(paths.atomShell.outputDir + '/Atom.app/Contents/MacOS/Atom', ['.'], {
      stdio: 'inherit'
    });
  } else {
    spawn(paths.atomShell.outputDir + '/atom-shell/atom', ['.'], {
      stdio: 'inherit'
    });
  }
});
