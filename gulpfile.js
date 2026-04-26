const gulp                = require('gulp');
const browserSync         = require('browser-sync').create();
const sass                = require('gulp-sass')(require('sass'));
const prefix              = require('gulp-autoprefixer');
const concat              = require('gulp-concat');
const minify              = require('gulp-minifier');
const size                = require('gulp-size');
const { task }            = require('gulp');
const del                 = require('del');
const fs                  = require('fs');
const jekyllPaths         = ['*.html', '_includes/*.html', '_includes/*/*.html', '_layouts/*.html', '_layouts/*/*.html', '_posts/*', 'js/*.js', 'images/*'];
const outDirBase          = '_site/';
const outDirCss           = outDirBase + 'css/';
const outDirJs            = outDirBase + 'js/';
const sassPathsLanding    = ['_scss/landing/*.scss', '_scss/landing/*/*.scss'];
const sassPathsBlog       = ['_scss/blog/*.scss', '_scss/blog/*/*.scss'];
const cssPathsBlogVendor  = ['css/blog/*.css'];

// order is important!
const jsFilesBlog = [
  './js/blog/jquery-3.3.1.min.js',
  './js/blog/easing-effect.js',
  './js/blog/owl.carousel.min.js',
  './js/blog/bootstrap.min.js',
  './js/blog/proper.js',
  './js/blog/jquery.waypoints.min.js',
  './js/blog/wow.min.js',
  './js/blog/prism.min.js',
  './js/blog/jquery.fitvids.js',
  './js/shared-nav.js',
  './js/blog/blog.js'
];

task('sassLanding', function() {
  return gulp.src(sassPathsLanding)
      .pipe(sass({
        outputStyle: 'expanded'
      }))
      .on('error', sass.logError)
      .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
      .pipe(gulp.dest(outDirCss + 'landing'))
      .pipe(size())
      .pipe(browserSync.stream());
});

task('sassBlog', function() {
  return gulp.src(sassPathsBlog)
      .pipe(sass({
        outputStyle: 'expanded',
        onError: browserSync.notify('Error in sass')
      }))
      .on('error', sass.logError)
      .pipe(prefix())
      .pipe(gulp.dest(outDirCss + 'blog'))
      .pipe(size())
      .pipe(browserSync.stream());
});

task('cssBlogVendor', function() {
  return gulp.src(cssPathsBlogVendor)
      .pipe(concat('vendors.css'))
      .pipe(gulp.dest(outDirCss + 'blog'))
      .pipe(size());
});

task('cssBlogApp', function() {
  return gulp.src([
      outDirCss + 'blog/vendors.css',
      outDirCss + 'blog/style.css'
    ])
      .pipe(concat('app.css'))
      .pipe(gulp.dest(outDirCss + 'blog'))
      .pipe(size());
});

task('jsBlog', function() {
  return gulp.src(jsFilesBlog)
      .pipe(concat('build.js'))
      .pipe(gulp.dest(outDirJs + 'blog'))
      .pipe(size())
      .pipe(browserSync.stream());
});

task('build', function() {
  return require('child_process').spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', browserSync.reload);
});

task('workarounds-cleanup', function(){
  const sitemapPath = outDirBase + 'sitemap.xml';

  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const filteredSitemap = sitemap.replace(
      /<url>\s*<loc>https?:\/\/[^<]+\/blog\/pages\/\d+\/blog\.html<\/loc>[\s\S]*?<\/url>\s*/g,
      ''
    );
    fs.writeFileSync(sitemapPath, filteredSitemap);
  }

  //remove invalid index.html files generated for some reason for each tag
  return del(outDirBase + 'tag/*/index.html');
});

task('minify', function() {
    return del(outDirBase + 'deploy').then(function() {
      return gulp.src([
        '_site/**/*',
        '!_site/deploy',
        '!_site/deploy/**'
      ]).pipe(minify({
      minify: true,
      minifyHTML: {
        collapseWhitespace: true,
        conservativeCollapse: true,
      },
      minifyJS: {
        sourceMap: false
      },
      minifyCSS: true,
      getKeptComment: function (content, filePath) {
          var m = content.match(/\/\*![\s\S]*?\*\//img);
          return m && m.join('\n') + '\n' || '';
      }
    })).pipe(gulp.dest('_site/deploy'));
    });
});

task('serve', function() {
    browserSync.init({
        server: {
            baseDir: '_site'
        }
    });

    gulp.watch(sassPathsLanding, gulp.parallel('sassLanding'));
    gulp.watch(sassPathsBlog, gulp.series('sassBlog', 'cssBlogVendor', 'cssBlogApp'));
    gulp.watch(jekyllPaths)
    .on('change', gulp.parallel('build'));
});

task('build-blog-css', gulp.series('sassBlog', 'cssBlogVendor', 'cssBlogApp'));
task('build-blog', gulp.series('build-blog-css', 'jsBlog'));
task('build-all', gulp.series('build', 'sassLanding', 'build-blog', 'workarounds-cleanup'));
task('default', gulp.series('build-all', 'serve'));
task('prod', gulp.series('build-all', 'minify'));
