'use strict';

var async = require('async');
var gulp = require('gulp');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var path = require('path');
var react = require('gulp-react');
var spawn = require('child_process').spawn;
var standaloneGruntRunner = require('standalone-grunt-runner');

var atomShellVersion = '0.12.3';
var paths = {
  atomShell: {
    downloadDir: 'cache/atom-shell',
    outputDir: 'dep/atom-shell'
  },
  distApp: {
    mac: 'dist/Atom.app/Contents/MacOS/atom',
    others: 'dist/atom-shell/atom',
  },
  buildDir: 'build',
  build: {
    reactDir: 'build/react'
  },
  distDir: 'dist',
  libDir: 'lib',
  package: 'package.json',
  resourcesDir: {
    mac: 'dist/Atom.app/Contents/Resources/app',
    others: 'dist/atom-shell/resources/app'
  },
  staticDir: 'static',
  react: 'lib/react/**/*.jsx'
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

gulp.task('package', ['download-atom-shell', 'react'], function (callback) {
  var copy = function (src, dest) {
    return gulp.src(src)
      .pipe(gulp.dest(dest));
  };

  var copyDir = function (src, dest, options) {
    options = options || {};

    return function (cb) {
      ncp(src, dest, options, function (err) {
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

      async.series([
        copyDir(paths.libDir, path.join(distDir, 'lib'), {
          filter: function (file) {
            // Don't copy the react folder.
            if (file.match(/\/react$/)) {
              return false;
            }

            return true;
          }
        }),
        copyDir(paths.build.reactDir, path.join(distDir, 'lib/react')),
        copyDir(paths.staticDir, path.join(distDir, 'static'))
      ], callback);
    });
  });
});

gulp.task('react', function () {
  return gulp.src(paths.react)
    .pipe(react())
    .pipe(gulp.dest(paths.build.reactDir));
});

gulp.task('run', ['download-atom-shell', 'package'], function () {
  var distApp;
  if (process.platform === 'darwin') {
    distApp = paths.distApp.mac;
  } else {
    distApp = paths.distApp.others;
  }

  spawn(distApp, [], {
    stdio: 'inherit'
  });
});
