'use strict';

import async from 'async';
import electron from 'electron-prebuilt';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

import packager from 'electron-packager';
import rimraf from 'rimraf';
import {spawn} from 'child_process';

const $ = gulpLoadPlugins();
const paths = {
  build: {
    dir: 'build',
    lib: {
      dir: 'build/lib'
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
    glob: 'lib/**/*.{js,jsx}'
  },
  package: {
    file: 'package.json'
  },
  static: {
    glob: 'static/**/*',
    styles: {
      excludeGlob: '!static/styles/**/*',
      main: 'static/styles/main.scss'
    }
  }
};

gulp.task('default', ['run']);

gulp.task('build', [
  'babel',
  'lint',
  'sass'
], () => {
  return gulp.src([
    paths.static.glob,
    paths.static.styles.excludeGlob,
    paths.package.file
  ], {base: '.'})
  .pipe(gulp.dest(paths.build.dir));
});

gulp.task('babel', () => {
  return gulp.src(paths.lib.glob)
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.build.lib.dir));
});

gulp.task('clean', (callback) => {
  let rm = (file) => {
    return (cb) => {
      rimraf(file, cb);
    };
  };

  let fns = [];
  fns.push(rm(paths.build.dir));
  fns.push(rm(paths.dist.dir));

  async.parallel(fns, callback);
});

gulp.task('lint', () => {
  return gulp.src(paths.lib.glob)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('sass', () => {
  return gulp.src(paths.static.styles.main)
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(gulp.dest(paths.build.static.styles.dir));
});

gulp.task('package', ['build'], (callback) => {
  packager({
    arch: 'all',
    platform: 'all',
    dir: paths.build.dir,
    out: paths.dist.dir
  }, (err) => {
    callback(err);
  });
});

gulp.task('run', ['build'], () => {
  process.env.NODE_ENV = 'development';
  spawn(electron, ['./build'], {
    stdio: 'inherit'
  });
});
