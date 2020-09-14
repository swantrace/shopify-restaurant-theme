const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const replace = require('gulp-replace');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

function compileSass() {
  return gulp
    .src('./src/styles/theme.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .on('error', sass.logError)
    .pipe(autoprefixer())
    .pipe(rename('theme.scss.liquid'))
    .pipe(replace('"{{', '{{'))
    .pipe(replace('}}"', '}}'))
    .pipe(gulp.dest('theme/assets/'));
}

function compileJavascript() {
  return gulp
    .src('./src/scripts/index.js')
    .pipe(sourcemaps.init())
    .pipe(
      rollup(
        {
          plugins: [
            commonjs(),
            json(),
            nodeResolve({ browser: true }),
            babel(),
          ],
        },
        { format: 'umd' }
      )
    )
    .pipe(sourcemaps.write())
    .pipe(rename('theme.js'))
    .pipe(gulp.dest('theme/assets/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('theme/assets/'));
}

exports.default = function () {
  gulp.watch('src/styles/**/*.scss', compileSass);
  gulp.watch('src/scripts/**/*.js', compileJavascript);
};
