var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var server = require('pushstate-server');



gulp.task('js', jsTask);
gulp.task('css', cssTask);
gulp.task('serve', serveTask);
gulp.task('default', ['js', 'css']);


function jsTask() {
    return gulp.src('./src/nz-datepicker.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename("nz-datepicker.min.js"))
        .pipe(gulp.dest('./dist'));
}

function cssTask() {
    gulp.src('./src/nz-datepicker.styl')
        .pipe(stylus({
            compress: false
        }))
        .pipe(gulp.dest('./dist'));

    return gulp.src('./src/nz-datepicker.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(rename("nz-datepicker.min.css"))
        .pipe(gulp.dest('./dist'));
}


function serveTask() {
    return server.start({
        port: 3000,
        directory: './'
    });
}
