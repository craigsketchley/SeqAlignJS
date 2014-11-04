var gulp = require('gulp');

// include plug-ins
var jshint = require('gulp-jshint');
 
// JS hint task
gulp.task('jshint', function() {
  gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watcher', ['jshint'], function() {
	gulp.watch('./src/*.js', ['jshint']);
});