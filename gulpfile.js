const gulp = require("gulp")
const plumber = require("gulp-plumber")
const sass = require("gulp-sass")
const extname = require("gulp-extname")
const htmlbeautify = require("gulp-html-beautify")
const app = require("assemble")()
const browserSync = require("browser-sync").create()

var paths = {
  styles: "./src/scss/**/*.scss",
  _styles: "!./src/scss/**/_*.scss",
  views: "./src/views/",
  asset: "./src/assets/**/*",
}

// Asset
function asset() {
  return gulp.src(paths.asset).pipe(gulp.dest("dist"))
}

// Views
const views = () => {
  app.partials(paths.views + "components/*.hbs")
  app.layouts(paths.views + "layouts/*.hbs")
  app.pages(paths.views + "*.hbs")
  return app
    .toStream("pages")
    .pipe(plumber())
    .pipe(app.renderFile({ layout: "main" }))
    .pipe(htmlbeautify({ indent_size: 2 }))
    .pipe(extname(".html"))
    .pipe(app.dest("dist/"))
    .pipe(browserSync.stream())
}

// SCSS
const styles = () => {
  return gulp
    .src([paths.styles, paths._styles])
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: "compressed",
        "include css": true,
        // outputStyle: 'expanded'
      })
    )
    .pipe(gulp.dest("./dist/css/"))
    .pipe(browserSync.stream())
}
// Watch
function watch() {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
  })
  gulp.watch(paths.styles, styles)
  gulp.watch(paths.views + "**/*", views)
  gulp.watch(paths.asset, asset)
}

gulp.task("default", gulp.series(styles, views, asset, watch))
gulp.task("build", gulp.series(gulp.parallel(styles, views, asset)))
