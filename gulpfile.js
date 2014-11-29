'use strict';
/******************************************************************************/
/*       ______                                                               */
/*      //   ) )                                                              */
/*     //___/ /            __    __  ___  __      ___       __     ( )        */
/*    / __  (   //   / / //  ) )  / /   //  ) ) //   ) ) //   ) ) / / \\ / /  */
/*   //    ) ) //   / / //       / /   //      //   / / //   / / / /   \/ /   */
/*  //____/ / ((___( ( //       / /   //      ((___/ / //   / / / /    / /\   */
/*                                                                            */
/******************************************************************************/

  /*----- Load Gulp, Plugins and Requirements --------------------------------*/

    var gulp = require('gulp-help')(require('gulp'), { description: false });
    var $ = require('gulp-load-plugins')();

    var gitHub = require('./github.conf.json');

    var browserSync = require('browser-sync');
    var cp = require('child_process');
    var del = require('del');
    var exec = require('child_process').exec;
    var mainBowerFiles = require('main-bower-files');

  /*----- Variables ----------------------------------------------------------*/

    var intent = 'serve';
    var messages = {
      buildCss: '<span style="color: grey;">Building</span> CSS...',
      buildJs: '<span style="color: grey;">Building</span> JS...',
      buildImages: '<span style="color: grey;">Building</span> Images...',
      buildFonts: '<span style="color: grey;">Building</span> Fonts...',
      buildHtml: '<span style="color: grey;">Building</span> HTML...',
      builJekyll: '<span style="color: grey;">Building</span> Jekyll...',
      errCompass: '<span style="color: red; ">Error</span> in Compass.',
      lintJs: '<span style="color: grey;">Linting</span> JS...'
    };

/*----------------------------------------------------------------------------*/
/* Tasks: Clean and Lint                                                      */
/*----------------------------------------------------------------------------*/

  /*----- Task clean ---------------------------------------------------------*/

    gulp.task('clean', false, function (cb) {
      del(['deploy', 'serve', '.tmp'], cb);
    });

  /*----- Task lintScripts ---------------------------------------------------*/

    gulp.task('lintScripts', false, function() {
      browserSync.notify(messages.lintJs);
      gulp.src('app/scripts/**/*.js')
        .pipe($.eslint('.eslintrc'))
        .pipe($.eslint.format());
    });

  /*----- Task lintGulpfile --------------------------------------------------*/

    gulp.task('lintGulpfile', false, function() {
      browserSync.notify(messages.lintJs);
      gulp.src('gulpfile.js')
        .pipe($.eslint('.eslintrc_node'))
        .pipe($.eslint.format());
    });

/*----------------------------------------------------------------------------*/
/* Tasks: Build Assets                                                        */
/*----------------------------------------------------------------------------*/

  /*----- Task buildStyles (libSass) -----------------------------------------*/

    gulp.task('buildStyles', false, function () {

      browserSync.notify(messages.buildCss);

      return gulp.src('app/styles/**/*.scss')
        .pipe($.sass({
          style: 'expanded',
          precision: 10,
          errLogToConsole: false,
          onError: function(err) {
            console.log(err);
            browserSync.notify(err, 5000);
          }
        }))
        // .on('error', function(err) {
        //   console.log(err.message);
        //   browserSync.notify(err.message, 5000);
        // })
        .pipe($.sourcemaps.write())
        .pipe($.autoprefixer())
        .pipe($.if(intent === 'deploy', $.minifyCss({
          keepSpecialComments: 0
        })))
        .on('error', function(err) {
          console.log(err.message);
          browserSync.notify(err.message, 5000);
        })
        .pipe(gulp.dest(intent + '/styles'))
        .pipe(browserSync.reload({ stream: true }));

    });

  /*----- Task buildScripts --------------------------------------------------*/

    gulp.task('buildScripts', false, ['lintScripts', 'lintGulpfile'], function() {
      browserSync.notify(messages.buildJs);
      return gulp.src('app/scripts/**/*.js')
        .pipe($.concat('main.js'))
        .pipe($.if(intent === 'deploy', $.uglify()))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(gulp.dest(intent + '/scripts'))
        .pipe(browserSync.reload({ stream: true }));
    });

  /*----- Task buildImages ---------------------------------------------------*/

    gulp.task('buildImages', false, function () {
      browserSync.notify(messages.buildImages);
      return gulp.src('app/images/**/*')
        .pipe($.imagemin())
        .pipe(gulp.dest(intent + '/images'))
        .pipe(browserSync.reload({ stream: true }));
    });

  /*----- Task buildFonts ----------------------------------------------------*/

    gulp.task('buildFonts', false, function () {
      browserSync.notify(messages.buildFonts);
      return gulp.src(mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(intent + '/fonts'))
        .pipe(browserSync.reload({ stream: true }));
    });

  /*----- Task buildAssets ---------------------------------------------------*/

    gulp.task('buildAssets', false, [
      'buildStyles',
      'buildScripts',
      'buildImages',
      'buildFonts'
    ], function (cb) {
      cb();
    });

  /*----- Task buildJekyll ---------------------------------------------------*/

    gulp.task('buildJekyll', false, function (cb) {
      browserSync.notify(messages.buildJekyll);
      exec('bundle exec jekyll build --config jekyll.conf.yml,jekyll.conf.' + intent + '.yml', function (error, stdout, stderr) {
        if (error !== null) {
          console.log('stderr: ' + stderr + '\n' + 'stdout: ' + stdout);
          browserSync.notify('stderr: ' + stderr, 5000);
        }
        cb();
      });
    });

  /*----- Task buildHtml -----------------------------------------------------*/

    gulp.task('buildHtml', false, ['buildAssets', 'buildJekyll'], function (cb) {
      browserSync.notify(messages.buildHtml);
      var assets = $.useref.assets({ searchPath: ['.tmp', 'app'] });
      var cssFilter = $.filter('**/*.css');
      var htmlFilter = $.filter('**/*.html');
      var jsFilter = $.filter('**/*.js');
      gulp.src('.tmp/jekyll/*.html')
        .pipe(assets)
          .pipe(jsFilter)
            .pipe($.if(intent === 'deploy', $.uglify()))
          .pipe(jsFilter.restore())
          .pipe(cssFilter)
            .pipe($.if(intent === 'deploy', $.minifyCss({
              keepSpecialComments: 0
            })))
          .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(htmlFilter)
          .pipe($.if(intent === 'deploy', $.minifyHtml()))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(intent))
        .pipe(browserSync.reload({ stream: true, once: true }));
      cb();
    });

  /*----- Task buildExtras ---------------------------------------------------*/

    gulp.task('buildExtras', false, ['buildHtml'], function (cb) {
      return gulp.src(['.tmp/jekyll/*.*', '!.tmp/jekyll/*.html'], { dot: true })
        .pipe(gulp.dest(intent));
    });

  /*----- Task buildAll ------------------------------------------------------*/

    gulp.task('buildAll', false, ['buildExtras'], function (cb) {
      browserSync.reload({ once: true });
      cb();
    });

/*----------------------------------------------------------------------------*/
/* Tasks: Browser-Sync and Watch                                              */
/*----------------------------------------------------------------------------*/

  /*----- Task borwserSync ---------------------------------------------------*/

    gulp.task('browserSync', false, ['buildAll'], function() {
      browserSync({
        server: {
          baseDir: intent
        }
      });
    });

  /*----- Task watch ---------------------------------------------------------*/

    gulp.task('watch', false, function() {

      // Sass files:
      gulp.watch('app/styles/**/*.scss', ['buildStyles']);

      // JS files:
      gulp.watch('app/scripts/**/*.js', ['buildScripts']);

      // Jekyll files:
      gulp.watch([
        'app/*.html',
        'app/data/*',
        'app/includes/*.html',
        'app/layouts/*.html'
      ], ['buildAll']);

      // Images
      gulp.watch('app/images/**/*.+(png|jpeg|jpg|gif|svg)', ['buildImages']);

      // Fonts:
      gulp.watch('app/bower_components/**/*.{eot,svg,ttf,woff}', ['buildFonts']);

    });

/*******************************************************************************
* Tasks: Deploy
*******************************************************************************/

  /*----- Task deploy --------------------------------------------------------*/

    gulp.task('deployToGitHub', ['buildAll'], function () {
      var options = {
        remote: gitHub.remote,
        branch: gitHub.branch,
        cacheDir: '.deploy-cache'
      };
      gulp.src(intent + '/**/*').pipe($.ghPages(options));
    });

/*----------------------------------------------------------------------------*/
/* Execution                                                                  */
/*----------------------------------------------------------------------------*/

  /*----- runModes -----------------------------------------------------------*/

    gulp.task('runDeploy', false, ['deployToGitHub']);
    gulp.task('runServe',  false, ['browserSync', 'watch']);

  /*----- Command line Tasks -------------------------------------------------*/

    gulp.task('deploy', 'Deploy the site to GitHub.', ['clean'], function () {
      intent = 'deploy';
      gulp.start('runDeploy');
    }, {
      aliases: ['d']
    });

    gulp.task('serve', 'Serve the site for local development.', ['clean'], function () {
      intent = 'serve';
      gulp.start('runServe');
    }, {
      aliases: ['s']
    });

/*----------------------------------------------------------------------------*/
