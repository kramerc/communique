'use strict';

var argv = require('minimist')(process.argv.slice(2));

var async = require('async');
var gulp = require('gulp');
var less = require('gulp-less');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var path = require('path');
var react = require('gulp-react');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;
var standaloneGruntRunner = require('standalone-grunt-runner');

var atomShellVersion = '0.12.3';
var paths = {
  build: {
    dir: 'build',
    react: {
      dir: 'build/react'
    },
    styles: {
      dir: 'build/styles'
    }
  },
  cache: {
    dir: 'cache',
    atomShell: {
      download: {
        dir: 'cache/atom-shell'
      }
    }
  },
  deps: {
    dir: 'deps',
    atomShell: {
      output: {
        dir: 'deps/atom-shell'
      }
    }
  },
  dist: {
    dir: 'dist',
    app: {
      dir: {
        mac: 'dist/Atom.app/Contents/MacOS/atom',
        others: 'dist/atom-shell/atom'
      },
      resources: {
        dir: {
          mac: 'dist/Atom.app/Contents/Resources/app',
          others: 'dist/atom-shell/resources/app'
        }
      }
    }
  },
  lib: {
    dir: 'lib',
    react: {
      dir: 'lib/react'
    }
  },
  package: {
    file: 'package.json'
  },
  static: {
    dir: 'static',
    react: {
      glob: 'lib/react/**/*.jsx'
    },
    styles: {
      dir: 'static/styles',
      glob: 'static/styles/**/*.less'
    }
  }
};

gulp.task('default', ['run']);

gulp.task('build', ['download-atom-shell', 'react', 'less']);

gulp.task('clean', function (callback) {
  var rm = function (file) {
    return function (cb) {
      rimraf(file, cb);
    };
  };

  var fns = [];
  fns.push(rm(paths.build.dir));
  fns.push(rm(paths.dist.dir));
  if (argv.deps) {
    fns.push(rm(paths.cache.dir));
    fns.push(rm(paths.deps.dir));
  }

  async.parallel(fns, callback);
});

gulp.task('download-atom-shell', function (callback) {
  async.map([
    paths.cache.atomShell.download.dir,
    paths.deps.atomShell.output.dir
  ], mkdirp, function (err) {
    if (err) {
      return callback(err);
    }

    standaloneGruntRunner('download-atom-shell', {
      config: {
        version: atomShellVersion,
        downloadDir: paths.cache.atomShell.download.dir,
        outputDir: paths.deps.atomShell.output.dir
      },
      npm: 'grunt-download-atom-shell'
    }, function () {
      callback();
    });
  });
});

gulp.task('less', function () {
  return gulp.src(paths.static.styles.glob)
    .pipe(less())
    .pipe(gulp.dest(paths.build.styles.dir));
});

gulp.task('package', ['build'], function (callback) {
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

  ncp(paths.deps.atomShell.output.dir, paths.dist.dir, function (err) {
    if (err) {
      return callback(err);
    }

    var distDir;
    if (process.platform === 'darwin') {
      distDir = paths.dist.app.resources.dir.mac;
    } else {
      distDir = paths.dist.app.resources.dir.others;
    }

    mkdirp(distDir, function (err) {
      if (err) {
        return callback(err);
      }

      copy(paths.package.file, distDir);

      async.series([
        copyDir(paths.lib.dir, path.join(distDir, 'lib'), {
          filter: function (file) {
            // Don't copy the react folder.
            if (file.match(new RegExp('/' + paths.lib.react.dir + '$'))) {
              return false;
            }

            return true;
          }
        }),
        copyDir(paths.build.react.dir, path.join(distDir, 'lib/react')),
        copyDir(paths.static.dir, path.join(distDir, 'static'), {
          filter: function (file) {
            // Don't copy the styles folder.
            if (file.match(new RegExp('/' + paths.static.styles.dir + '$'))) {
              return false;
            }

            return true;
          }
        }),
        copyDir(paths.build.styles.dir, path.join(distDir, 'static/styles'))
      ], callback);
    });
  });
});

gulp.task('react', function () {
  return gulp.src(paths.static.react.glob)
    .pipe(react())
    .pipe(gulp.dest(paths.build.react.dir));
});

gulp.task('run', ['download-atom-shell', 'package'], function () {
  var distApp;
  if (process.platform === 'darwin') {
    distApp = paths.dist.app.dir.mac;
  } else {
    distApp = paths.dist.app.dir.others;
  }

  spawn(distApp, [], {
    stdio: 'inherit'
  });
});
