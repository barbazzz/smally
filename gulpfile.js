var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass')
    browserify = require('gulp-browserify'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber'),
    connect = require('gulp-connect'),
    cReload = connect.reload,
    del = require('del'),
    jade = require('gulp-jade'),
    pug = require('gulp-pug'),
    jsonminify = require('gulp-jsonminify'),
    filesize = require('gulp-filesize'),
    notify = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    chalk = require('chalk');

var env,
  coffeeSrc,
  jadeSrc,
  jadeStyle,
  sassSrc,
  sassStyle,
  jsonSrc,
  outputDir;

env = process.env.NODE_ENV || 'production';

if (env === 'development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
  jadePretty = true;
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
  jadePretty = false;
}

coffeeSrc = ['components/coffee/*.coffee'];

jsSrc = [
    'components/js/myCoffee.js',
    'components/js/sometool.js',
    'components/js/redbg.js',
    'components/js/alert.js'
];

sassSrc = [
    'components/scss/*.{scss,sass}'
];

jadeSrc = [
    'components/jade/index.jade'
];

jsonSrc = [
    'components/js/*.json'
];

gulp.task('connect', function () {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('coffee', function() {
  gulp.src(coffeeSrc)
    .pipe(coffee({ bare:true })
      .on('error', gutil.log))
    .pipe(gulp.dest('components/js'));
});

gulp.task('js', function() {
  gulp.src(jsSrc)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest( outputDir + 'js' ))
    .pipe(connect.reload())
});

gulp.task('json', function () {
  gulp.src(jsonSrc)
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'js')))
    .pipe(connect.reload())
})

gulp.task('jade', function () {
  gulp.src(jadeSrc)
    .pipe(pug({
      pretty: jadePretty
    }).on('error', gutil.log))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload())
});

gulp.task('sass', function() {
  gulp.src(sassSrc)
    .pipe(compass({
      sass: 'components/scss',
      image: outputDir + 'images',
      style: sassStyle
    }))
    .on('error', gutil.log)
    .pipe(gulp.dest( outputDir + 'css' ))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch(jadeSrc, ['jade']);
  gulp.watch(coffeeSrc, ['coffee']);
  gulp.watch(jsSrc, ['js']);
  gulp.watch(sassSrc, ['sass']);
  gulp.watch(jsonSrc, ['json']);
});


gulp.task('clean', function () {
  del(['builds/production/**', '!builds/production']);
});


gulp.task('default', ['clean', 'jade', 'json', 'coffee', 'js', 'sass', 'connect', 'watch']);


