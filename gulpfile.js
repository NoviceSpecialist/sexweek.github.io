var { watch, src, dest, parallel, series } = require('gulp');
var twig = require('gulp-twig');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var imagemin = require('gulp-imagemin');

// Девсервер
function devServer(cb) {
    var params = {
        watch: true,
        reloadDebounce: 150,
        notify: false,
        server: { baseDir: './build' },
    };

    browserSync.create().init(params);
    cb();
}

function buildPages() {
    return src('build/pages/*.html')
        .pipe(twig())
        .pipe(dest('build/pages/'));
}

function buildStyles() {
    return src('build/style/*.css')
        .pipe(sass())
        .pipe(postcss([
            autoprefixer(),
            cssnano()
        ]))
        .pipe(dest('build/style/'));
}

function buildScripts() {
    return src('js/**/*.js')
        .pipe(dest('build/js/'));
}

function buildAssets(cb) {
    // Уберём пока картинки из общего потока
    // F:\PhpStorm\projects\gulp\build\assets\img\cafe.jpg
    src(['build/assets/**/*.*', '!build/assets/img/**/*.*'])
        .pipe(dest('build/assets/'));

    src('build/assets/img/**/*.*')
        .pipe(imagemin())
        .pipe(dest('build/assets/img'));

    // Раньше функция что-то вовзращала, теперь добавляем вместо этого искусственый колбэк
    // Это нужно, чтобы Галп понимал, когда функция отработала и мог запустить следующие задачи
    cb();
}

function watchFiles() {
    watch('pages/*.html', buildPages);
    watch('style/*.scss', buildStyles);
    watch('js/**/*.js', buildScripts);
    watch('build/assets/**/*.*', buildAssets);
}

// Соберём и начнём следить
exports.default =
    parallel(
        devServer,
        series(
            parallel(buildPages, buildStyles, buildScripts, buildAssets),
            watchFiles
        )
    );