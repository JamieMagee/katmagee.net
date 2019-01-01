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
const hugoBin = './bin/hugo';
const defaultArgs = ['-d', '../dist', '-s', 'site'];

if (process.env.DEBUG) {
  defaultArgs.unshift('--debug');
}

gulp.task('hugo', cb => buildSite(cb));
gulp.task('hugo-preview', cb =>
  buildSite(cb, ['--buildDrafts', '--buildFuture'])
);

gulp.task('css', () =>
  gulp
    .src('./src/css/*.css')
    .pipe(postcss([cssImport(), cssnext(), cssnano()]))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
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

gulp.task('svg', () =>
  gulp
    .src('site/static/svg/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))
);

gulp.task('imagemin', function () {
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

gulp.task('build', gulp.series('css', 'js', 'hugo', 'imagemin'));
gulp.task('build-preview', gulp.series(
  'css',
  'js',
  'hugo-preview',
  'imagemin'
));

gulp.task('server', gulp.series('hugo', 'css', 'js', 'svg', () => {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
  gulp.watch('./src/js/**/*.js', gulp.series('js'));
  gulp.watch('./src/css/**/*.css', gulp.series('css'));
  gulp.watch('./site/static/img/icons-*.svg', gulp.series('svg'));
  gulp.watch('./site/**/*', gulp.series('hugo'));
}));

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
