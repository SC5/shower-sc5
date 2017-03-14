const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const gulp = require('gulp');
const clean = require('gulp-clean');
const ghPages = require('gulp-gh-pages');
const header = require('gulp-header');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sync = require('browser-sync').create();

// Server

gulp.task('default', ['styles', 'js'], () => {
	sync.init({
		ui: false,
		notify: false,
		server: {
			baseDir: '.'
		}
	});

	gulp.watch('styles/**/*.scss', ['styles']);
	gulp.watch('index.html').on('change', sync.reload);
});

// Styles

const ratios = ['16/10', '4/3'];
const pkg = require('./package.json');
const banner = `/**
 * ${ pkg.description }
 * ${ pkg.name } v${ pkg.version }, ${ pkg.homepage }
 * @copyright 2010–${ new Date().getFullYear() } ${ pkg.author.name }, ${ pkg.author.url }
 * @license ${ pkg.license }
 */
`;

gulp.task('styles', () => {
	ratios.forEach((ratio) => {
		return gulp.src('styles/screen.scss')
			.pipe(replace('[RATIO]', ratio))
			.pipe(sass().on('error', sass.logError))
			.pipe(postcss([
				autoprefixer({
					browsers: [
						'> 1%',
						'last 2 versions',
						'Firefox ESR',
						'iOS >= 8',
					]
				}),
				csso
			]))
			.pipe(header(banner, { pkg: pkg }))
			.pipe(rename((path) => {
				path.basename += `-${ ratio.replace('/', 'x') }`;
			}))
			.pipe(gulp.dest('styles'))
			.pipe(sync.stream());
	});
});

gulp.task('js', function() {
  return gulp.src('./node_modules/shower-core/shower.min.js')
    .pipe(gulp.dest('./'))
});

gulp.task('build:clean', function() {
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('build', ['build:clean', 'styles', 'js'], function() {
  return gulp.src([
      '**/*.html',
      '**/*.js',
      '**/*.css',
      './fonts/**',
      './pictures/**',
      './images/**',
      '!node_modules',
    ], { base : './' })
    .pipe(gulp.dest('./dist'));
})

gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages({
      remoteUrl: 'git@github.com:SC5/shower-sc5.git'
    }));
});
