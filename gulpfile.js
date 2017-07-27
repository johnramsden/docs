var gulp = require('gulp');
var shell = require('gulp-shell');
var browserSync = require('browser-sync').create();

var psi = require('psi');

//var ngrok = require('ngrok');
//var imagemin = require('gulp-imagemin');

var paths = {
    css: '_site/css/*.css',
    html: '_site/*.html',
    img: 'images/*.+(png|jpg|jpeg)',
    // js: 'src/*.js',
    src: '_site/',
};

//////////////////////////////////////////////////////////////////
// Browsersync
//////////////////////////////////////////////////////////////////
/*
 * Used with Jekyll Server
 */
var browser = {
    base: paths.src,
    port: 4000,
    //site: ''
};

/*
 * Jekyll Build task
 * Watch for changes and rebuild if necessary
 */
gulp.task('jekyll-build', ['watch', 'browser-sync'], shell.task(['bundle exec jekyll build --watch --drafts']));

/*
 * Jekyll Build task
 * Watch for changes and rebuild if necessary
 */
gulp.task('nix-build', ['watch', 'browser-sync'], shell.task(['nix-shell --run "bundle exec jekyll build --watch --drafts"']));

/*
 * BrowserSync task
 * Synch browser with code. Watches root directory on specific port.
 */
gulp.task('browser-sync', function () {
  browserSync.init({
    port: browser.port,
    open: false,
    server: {
      baseDir: browser.base
    }
    });
});

/*
 * Watch task
 * Watch files for changes. Run browserSync before watch.
 */
gulp.task('watch', ['browser-sync'], function (){
    gulp.watch(paths.html).on('change', browserSync.reload);
    gulp.watch(paths.img).on('change', browserSync.reload);
    // gulp.watch(paths.js, ['sync-js']);
    gulp.watch(paths.css, ['sync-css']);
});

/*
 * BrowserSync js injection
 * inject js into browser on change
 */
gulp.task('sync-js', function () {
    return gulp.src(paths.js)
        .pipe(browserSync.stream());
});
/*
 * BrowserSync css injection
 * inject css into browser on change
 */
gulp.task('sync-css', function () {
    return gulp.src(paths.css)
        .pipe(browserSync.stream());
});

/*
 * Exit out of the pagespeed sequence once it's complete.
 */
gulp.task('default', ['jekyll-build', 'watch']);

//////////////////////////////////////////////////////////////////
// Pagespeed Insights
//////////////////////////////////////////////////////////////////

/*
 * Ngrok:
 * Run ngrok on port and grab the tunnel url it is creating.
*/
/*
gulp.task('ngrok-url', ['watch', 'browser-sync'], function (cb) {
    return ngrok.connect(browser.port, function (err, url) {
        browser.site = url;
        console.log('Serving your website at: ' + browser.site);
        cb();
    });
});
*/

/*
 * Desktop Pagespeed Insight Strategy:
*/
gulp.task('psi-desktop', ['ngrok-url'], function (cb) {
    psi(browser.site, {
        nokey: 'true',
        strategy: 'desktop'
    }, cb).then(function (data) {
        console.log('Desktop speed score: ' + data.ruleGroups.SPEED.score);
    });
});

/*
 * Mobile Pagespeed Insight Strategy:
*/
gulp.task('psi-mobile', ['ngrok-url'], function (cb) {
  psi(browser.site, {
    nokey: 'true',
    strategy: 'mobile'
  }, cb).then(function (data) {
        console.log('Mobile speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

/*
 * Pagespeed Insights Sequence:
 * Create a sequence to run the ngrok tunnel server, grab its url,
 * and run page speed insights tests for both desktop and mobile.
 * Lastly exit.
 */
gulp.task('psi', ['psi-desktop', 'psi-mobile'], function () {
    console.log('Here are your page speed scores!');
    process.exit();
});
