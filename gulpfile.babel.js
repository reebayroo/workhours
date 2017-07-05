var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  concat = require('gulp-concat'),
  webpack = require('webpack-stream'),
  nodemon = require('gulp-nodemon'),
  jshint = require('gulp-jshint'),
  runSequence = require('run-sequence'),
  // mocha = require('gulp-mocha'),
  gutil = require('gulp-util'),
  env = require('gulp-env'),
  requireDir = require('require-dir');


require('rootpath')();

// NOTE: Do not require config in the gulp file or it could overwrite the correct
// environmental variables and cause problems. NODE_ENV is set for each task and
// importing config before caches config as 'development' for all tasks.

// var dir = requireDir('./gulp-tasks');

var watchDirs = '{client,server,bin,config,public,routes,test}',
  lintFiles = watchDirs + '/**/*.js',
  serverFiles = 'server/**/*.js',
  testFiles = 'test/**/*.js';

gulp.task('lint', function() {
  return gulp.src([watchDirs + '/**/*.js', '!client/build/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});



gulp.task('test', function() {
  const envs = env.set({
    NODE_ENV: 'test'
  });
  let test = gulp.src(testFiles, { read: false })
    .pipe(envs)
    //gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({ reporter: 'nyan' }))
    .on('error', function(err) {
      this.emit('end');
    })
    .pipe(envs.reset);

  envs.restore();
  return test;
});

gulp.task('build', ['lint', 'webpack']);

gulp.task('run', ['webpack'], function() {
  nodemon({
      script: 'bin/www',
      ext: 'js jade',
      // env: {
      //   'NODE_ENV': 'development'
      // },
      verbose: true,
      ignore: ['test/', 'client/', 'public/', 'node_modules/', 'logs/', 'archives/']
    })
    .on('start', function() {
      gulp.watch([
        watchDirs + '/**/*.{js,css,scss}',
        '!client/build/bundle.js'
      ], ['webpack']);
    });
});

gulp.task('watch', ['lint'], function() {
  gulp.watch(lintFiles, ['lint']);
});

gulp.task('tdd', ['lint', 'test-mocha'], function() {
  gulp.watch([testFiles, lintFiles], ['test-mocha']);
});


gulp.task('pre-test', function() {
  return gulp.src([serverFiles])
    // Covering files
    .pipe(istanbul({ includeUntested: true }))
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test-and-coverage', ['pre-test'], function() {
  return gulp.src([testFiles])
    .pipe(mocha({ reporter: 'spec' }))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          statements: 31,
          branches: 22,
          functions: 26.1,
          lines: 31
        }
      }
    }))
    .on('error', function(err) {
      gutil.log(err);
      process.exit(1);
    });
});



gulp.task('test-mocha', function() {
  const envs = env.set({
    NODE_ENV: 'test'
  });

  var test = gulp.src([testFiles], { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', gutil.log);

  envs.restore();
  return test;
});

gulp.task('default', ['run'], function() {
  return null;
});

gulp.task('webpack', function() {
  return gulp.src('public/javascripts/client.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('public/build/'));
});