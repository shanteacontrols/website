const gulp                = require('gulp');
const browserSync         = require('browser-sync').create();
const sass                = require('gulp-sass')(require('sass'));
const prefix              = require('gulp-autoprefixer');
const minify              = require('gulp-minifier');
const size                = require('gulp-size');
const { task }            = require('gulp');
const del                 = require('del');
const fs                  = require('fs');
const jekyllPaths         = ['_data/*.json', '*.html', '_includes/*.html', '_includes/*/*.html', '_layouts/*.html', '_layouts/*/*.html', '_posts/*', 'js/*.js', 'images/*'];
const outDirBase          = '_site/';
const outDirCss           = outDirBase + 'css/';
const sassPathsLanding    = ['_scss/landing/*.scss', '_scss/shared/*.scss'];
task('clean', function() {
  return del(outDirBase);
});

task('sassLanding', function() {
  return gulp.src('_scss/landing/platform.scss')
      .pipe(sass({
        outputStyle: 'expanded'
      }))
      .on('error', sass.logError)
      .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
      .pipe(gulp.dest(outDirCss + 'landing'))
      .pipe(size())
      .pipe(browserSync.stream());
});

task('sync-boards', function() {
  return require('child_process').spawn(process.execPath, ['scripts/sync-boards.js'], {stdio: 'inherit'});
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
      return require('stream/promises').finished(gulp.src([
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
    })).pipe(gulp.dest('_site/deploy')));
    });
});

task('serve', function() {
    browserSync.init({
        server: {
            baseDir: '_site'
        }
    });

    gulp.watch(sassPathsLanding, gulp.parallel('sassLanding'));
    gulp.watch(jekyllPaths)
    .on('change', gulp.parallel('build'));
});

task('build-all', gulp.series('sync-boards', 'clean', 'build', 'sassLanding', 'workarounds-cleanup'));
task('default', gulp.series('build-all', 'serve'));
task('prod', gulp.series('build-all', 'minify'));
