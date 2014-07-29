'use strict';

/*******************************************************************************
* Required & Variables
*******************************************************************************/

	var gulp        = require('gulp');
	var config      = require('./config.json');

	var browserSync = require('browser-sync');
	var exec        = require('child_process').exec;
	var stylish     = require('jshint-stylish');
	var mkdirp      = require('mkdirp');

	var compass     = require('gulp-compass');
	var concat      = require('gulp-concat');
	var deploy      = require("gulp-gh-pages");
	var gulpif      = require('gulp-if');
	var ignore      = require('gulp-ignore');
	var imagemin    = require('gulp-imagemin');
	var jshint      = require('gulp-jshint');
	var minifyCSS   = require('gulp-minify-css');
	var rename      = require('gulp-rename');
	var rimraf      = require('gulp-rimraf');
	var uglify      = require('gulp-uglify');

	var build       = { 'intent': '', 'to': '' };

	var messages    = {
		buildCss:    '<span style="color: grey">Building</span> CSS...',
		buildJs:     '<span style="color: grey">Building</span> JS...',
		buildImages: '<span style="color: grey">Building</span> Images...',
		buildFonts:  '<span style="color: grey">Building</span> Fonts...',
		builJekyll:  '<span style="color: grey">Building</span> Jekyll...',
		lintJs:      '<span style="color: grey">Linting</span> JS...'
	};

/*******************************************************************************
* Tasks: Clean Assets
*******************************************************************************/

	/**
	 * Task cleanCss
	 */
	gulp.task('cleanCss', function () {
		return gulp.src(build.to + '/css/*.css', { read: false })
			.pipe(rimraf());
	});

	/**
	 * Task cleanJs
	 */
	gulp.task('cleanJs', function () {
		return gulp.src(build.to + '/js/*.js', { read: false })
			.pipe(rimraf());
	});

	/**
	 * Task: cleanImages
	 */
	gulp.task('cleanImages', function () {
		return gulp.src(build.to + '/img/*', { read: false })
			.pipe(rimraf());
	});

	/**
	 * Task: cleanFonts
	 */
	gulp.task('cleanFonts', function () {
		return gulp.src(build.to + '/fonts/*', { read: false })
			.pipe(rimraf());
	});

/*******************************************************************************
* Tasks: Linting
*******************************************************************************/

	/**
	 * Task: lintJs
	 */
	gulp.task('lintJs', function() {
		browserSync.notify(messages.lintJs);
		return gulp.src('jekyll/js/**/*.js')
			.pipe(jshint())
			.pipe(jshint.reporter('jshint-stylish', { verbose: true }));
	});

/*******************************************************************************
* Tasks: Build Assets
*******************************************************************************/

	/**
	 * Task: buildCss (Compass Sass)
	 */
	gulp.task('buildCss', ['cleanCss'], function () {
		browserSync.notify(messages.buildCss);
		var stream = gulp.src('jekyll/_sass/**/*.scss')
			.pipe(compass({
				css:   'jekyll/css',
				sass:  'jekyll/_sass',
				image: 'jekyll/img'
			}))
			.pipe(gulpif(build.intent == 'deploy', minifyCSS({
				keepSpecialComments: 0
			})))
			.pipe(gulp.dest(build.to + '/css'))
			.pipe(browserSync.reload({stream: true, once: true}));
		return stream;
	});

	/**
	 * Task: buildJs
	 */
	gulp.task('buildJs', ['cleanJs', 'lintJs'], function() {
		browserSync.notify(messages.buildJs);
		var stream = gulp.src('jekyll/js/**/*.js')
			.pipe(concat('build.js'))
			.pipe(gulpif(build.intent == 'deploy', uglify()))
			.pipe(gulp.dest(build.to + '/js'))
			.pipe(browserSync.reload({ stream: true, once: true }));
		return stream;
	});

	/**
	 * Task: buildImages
	 */
	gulp.task('buildImages', function () {
		browserSync.notify(messages.buildImages);
		return gulp.src('jekyll/img/**/*')
			.pipe(imagemin())
			.pipe(gulp.dest(build.to + '/img'));
	});

	/**
	 * Task: buildFonts (copy only right now)
	 */
	gulp.task('buildFonts', function () {
		browserSync.notify(messages.buildFonts);
		var stream = gulp.src('jekyll/fonts/**/*')
			.pipe(gulp.dest(build.to + '/fonts'));
		browserSync.reload();
		return stream;
	});

	/**
	 * Task: buildAssets
	 */
	gulp.task('buildAssets', [
		'buildCss',
		'buildJs',
		'buildImages',
		'buildFonts'
	], function (cb) {
		cb();
	});

/*******************************************************************************
* Tasks: Build Jekyll and Browser-Sync
*******************************************************************************/

	/**
	 * Task: buildJekyll
	 */
	gulp.task('buildJekyll', function (cb) {
		browserSync.notify(messages.buildJekyll);
		exec('jekyll build --config _config.yml,_config_' + build.intent + '.yml', function () {
			cb();
		});
	});

	/**
	 * Task: buildAll
	 */
	gulp.task('buildAll', ['buildJekyll', 'buildAssets'], function (cb) {
		cb();
	});

	/**
	 * Task: rebuildJekyll (and queue reload)
	 */
	gulp.task('rebuildJekyll', ['buildAll'], function () {
		browserSync.reload();
	});

	/**
	 * Task borwserSync
	 */
	gulp.task('browserSync', ['buildAll'], function() {
		browserSync({
			server: {
				baseDir: build.to
			}
		});
	});

/*******************************************************************************
* Tasks: Watch
*******************************************************************************/

	/**
	 * Task: watch
	 */
	gulp.task('watch', function() {

		// Compass Sass files:
		gulp.watch('jekyll/_sass/**/*.scss', ['buildCss']);

		// JS files:
		gulp.watch('jekyll/js/*.js', ['buildJs']);

		// Jekyll files:
		gulp.watch([
			'jekyll/*.html',
			'jekyll/_layouts/*.html',
			'_config.yml',
			'_config_' + build.intent + '.yml'
		], ['buildAll']);

		// Images
		gulp.watch('jekyll/img/**/*.+(png|jpeg|jpg|gif|svg)', ['buildImages'], function () {
			browserSync.reload();
		});

		// Fonts
		gulp.watch('jekyll/fonts/**/*', ['buildFonts']);

	});

/*******************************************************************************
* Tasks: Deploy
*******************************************************************************/

	/**
	 * Task: deploy
	 */
	gulp.task('deployToGitHub', ['buildAll'], function () {
		var options = {
			remoteURL: config.github.remote,
			branch:    'gh-pages'
		};
		gulp.src("./" + build.to + "/**/*").pipe(deploy(options));
	});

/*******************************************************************************
* Tasks: setVariables
*******************************************************************************/

	/**
	 * setServe (compileTo = 'serve')
	 */
	gulp.task('setServe', function () {
		build.intent = 'serve';
		build.to     = build.intent;
		return;
	});

	/**
	 * setDeploy (compileTo = 'deploy')
	 */
	gulp.task('setDeploy', function () {
		build.intent = 'deploy';
		build.to     = build.intent + config.github.path;
		return;
	});

/*******************************************************************************
* Command-line aggregate tasks.
*******************************************************************************/

	gulp.task('serve',   ['setServe',  'browserSync', 'watch']);
	gulp.task('deploy',  ['setDeploy', 'deployToGitHub']);

	gulp.task('default', ['serve']);

/******************************************************************************/
