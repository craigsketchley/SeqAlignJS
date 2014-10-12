var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('browserify', function() {
	gulp.src('./src/SeqAlign.js')
	.pipe(browserify())
	.pipe(gulp.dest('./build/'));
});

gulp.task('default', ['browserify']);

gulp.task('watch', function() {
	gulp.watch('./src/*', ['browserify']);	
})
