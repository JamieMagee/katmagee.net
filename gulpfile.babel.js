import BrowserSync from 'browser-sync';
import cache from 'gulp-cache';
import cp from 'child_process';
import cssImport from 'postcss-import';
import cssnano from 'cssnano';
import cssnext from 'postcss-cssnext';
import gulp from 'gulp';
import gutil from 'gulp-util';
import imagemin from 'gulp-imagemin';
import imageminGiflossy from 'imagemin-giflossy';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminZopfli from 'imagemin-zopfli';
import inject from 'gulp-inject';
import postcss from 'gulp-postcss';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import webpack from 'webpack';
import webpackConfig from './webpack.conf';

const browserSync = BrowserSync.create();
const hugoBin = `./bin/hugo.${
  process.platform === 'win32' ? 'exe' : process.platform
}`;
const defaultArgs = ['-d', '../dist', '-s', 'site'];

if (process.env.DEBUG) {
  defaultArgs.unshift('--debug');
}

gulp.task('hugo', cb => buildSite(cb));
gulp.task('hugo-preview', cb =>
  buildSite(cb, ['--buildDrafts', '--buildFuture'])
);
gulp.task('build', ['css', 'js', 'cms-assets', 'hugo', 'imagemin']);
gulp.task('build-preview', [
  'css',
  'js',
  'cms-assets',
  'hugo-preview',
  'imagemin'
]);

gulp.task('css', () =>
  gulp
    .src('./src/css/*.css')
    .pipe(postcss([cssImport(), cssnext(), cssnano()]))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
);

gulp.task('cms-assets', () =>
  gulp
    .src('./node_modules/netlify-cms/dist/*.{woff,eot,woff2,ttf,svg,png}')
    .pipe(gulp.dest('./dist/css'))
);

gulp.task('js', cb => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log(
      '[webpack]',
      stats.toString({
        colors: true,
        progress: true
      })
    );
    browserSync.reload();
    cb();
  });
});

gulp.task('svg', () => {
  const svgs = gulp
    .src('site/static/svg/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents(filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src('site/layouts/partials/svg.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('site/layouts/partials/'));
});

gulp.task('server', ['hugo', 'css', 'cms-assets', 'js', 'svg'], () => {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/css/**/*.css', ['css']);
  gulp.watch('./site/static/img/icons-*.svg', ['svg']);
  gulp.watch('./site/**/*', ['hugo']);
});

gulp.task('imagemin', function() {
  return gulp
    .src(['site/static/img/*.{gif,png,jpg}'])
    .pipe(
      cache(
        imagemin([
          imageminPngquant({
            speed: 1,
            quality: 98
          }),
          imageminZopfli({
            more: true
          }),
          imageminGiflossy({
            optimizationLevel: 3,
            optimize: 3,
            lossy: 2
          }),
          imagemin.svgo({
            plugins: [
              {
                removeViewBox: false
              }
            ]
          }),
          imagemin.jpegtran({
            progressive: true
          }),
          imageminMozjpeg({
            quality: 60
          })
        ])
      )
    )
    .pipe(gulp.dest('dist/img'));
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, { stdio: 'inherit' }).on('close', code => {
    if (code === 0) {
      browserSync.reload('notify:false');
      cb();
    } else {
      browserSync.notify('Hugo build failed :(');
      cb('Hugo build failed');
    }
  });
}
