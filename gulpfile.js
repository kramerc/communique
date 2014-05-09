'use strict';

var async = require('async');
var gulp = require('gulp');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var path = require('path');
var spawn = require('child_process').spawn;
var standaloneGruntRunner = require('standalone-grunt-runner');

var atomShellVersion = '0.12.3';
var paths = {
  atomShell: {
    downloadDir: 'cache/atom-shell',
    outputDir: 'dep/atom-shell'
  },
  distDir: 'dist',
  libDir: 'lib',
  package: 'package.json',
  resourcesDir: {
    mac: 'dist/Atom.app/Contents/Resources/app',
    others: 'dist/atom-shell/resources/app'
  },
  staticDir: 'static'
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

gulp.task('package', ['download-atom-shell'], function (callback) {
  var copy = function (src, dest) {
    return gulp.src(src)
      .pipe(gulp.dest(dest));
  };

  var copyDir = function (src, dest) {
    return function (cb) {
      ncp(src, dest, function (err) {
        cb(err);
      });
    };
  };

  ncp(paths.atomShell.outputDir, paths.distDir, function (err) {
    if (err) {
      return callback(err);
    }

    var distDir;
    if (process.platform === 'darwin') {
      distDir = paths.resourcesDir.mac;
    } else {
      distDir = paths.resourcesDir.others;
    }

    mkdirp(distDir, function (err) {
      if (err) {
        return callback(err);
      }

      copy(paths.package, distDir);

      async.parallel([
        copyDir(paths.libDir, path.join(distDir, 'lib')),
        copyDir(paths.staticDir, path.join(distDir, 'static'))
      ], callback(err));
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
