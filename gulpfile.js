'use strict';

var async = require('async');
var electron = require('electron-prebuilt');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var packager = require('electron-packager');
var react = require('gulp-react');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;

var paths = {
  build: {
    dir: 'build',
    lib: {
      components: {
        dir: 'build/lib/components',
        glob: 'build/lib/components/**/*'
      },
    },
    static: {
      styles: {
        dir: 'build/static/styles'
      }
    }
  },
  dist: {
    dir: 'dist'
  },
  lib: {
    glob: 'lib/**/*.js',
    components: {
      glob: 'lib/components/**/*.jsx'
    }
  },
  package: {
    file: 'package.json'
  },
  static: {
    glob: 'static/**/*',
    styles: {
      excludeGlob: '!static/styles/**/*',
      main: 'static/styles/main.less'
    }
  }
};

gulp.task('default', ['run']);

gulp.task('build', [
  'react',
  'jshint',
  'less'
], function () {
  return gulp.src([
      paths.lib.glob,
      paths.static.glob,
      paths.static.styles.excludeGlob,
      paths.package.file
    ], {base: '.'})
    .pipe(gulp.dest(paths.build.dir));
});

gulp.task('clean', function (callback) {
  var rm = function (file) {
    return function (cb) {
      rimraf(file, cb);
    };
  };

  var fns = [];
  fns.push(rm(paths.build.dir));
  fns.push(rm(paths.dist.dir));

  async.parallel(fns, callback);
});

gulp.task('jshint', ['jshint-lib', 'jshint-react']);

gulp.task('jshint-lib', function () {
  return gulp.src(paths.lib.glob)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint-react', ['react'], function () {
  return gulp.src(paths.build.lib.components.glob)
    .pipe(jshint({
      latedef: true,
      maxlen: false,
      newcap: false,
      quotmark: false,
      strict: false,
    }))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('less', function () {
  return gulp.src(paths.static.styles.main)
    .pipe(less())
    .pipe(gulp.dest(paths.build.static.styles.dir));
});

gulp.task('package', ['build'], function (callback) {
  packager({
    arch: 'all',
    platform: 'all',
    dir: paths.build.dir,
    out: paths.dist.dir
  }, function (err) {
    callback(err);
  });
});

gulp.task('react', function () {
  return gulp.src(paths.lib.components.glob)
    .pipe(react())
    .pipe(gulp.dest(paths.build.lib.components.dir));
});

gulp.task('run', ['build'], function () {
  spawn(electron, ['./build'], {
    stdio: 'inherit'
  });
});
