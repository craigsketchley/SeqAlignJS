var gulp = require('gulp');

// include plug-ins
var jshint = require('gulp-jshint');

var paths = ['./src/*.js', './src/scoringMatrices/*.js', './src/scoringSchema/*.js', './src/util/*.js'];

// JS hint task
gulp.task('jshint', function() {
  gulp.src(paths)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watcher', ['jshint'], function() {
	gulp.watch(paths, ['jshint']);
});