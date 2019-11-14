'use strict'
var gulp = require('gulp');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');



/*sequence for building vendor scripts and styles*/
gulp.task('rebuildVendors', function () {
    runSequence('copyVendorAsset', 'bundleCoreCSS', 'bundleCoreJS', 'bundleVendorCSS', 'bundleVendorJS');
});



/* Copy whole folder of some specific node modules that are calling other files internally */
gulp.task('copyVendorAsset', function () {
    var mdi = gulp.src(['./node_modules/@mdi/font/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/iconfonts/mdi'));

    var fontawesome = gulp.src(['./node_modules/font-awesome/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/iconfonts/font-awesome'));

    var flagicon = gulp.src(['./node_modules/flag-icon-css/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/iconfonts/flag-icon-css'));

    var simplelineicon = gulp.src(['./node_modules/simple-line-icons/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/iconfonts/simple-line-icon'));

    var summernote = gulp.src(['./node_modules/summernote/dist/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/summernote/dist'));

    var tinymce = gulp.src(['./node_modules/tinymce/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/tinymce'));

    var acebuilds = gulp.src(['./node_modules/ace-builds/src-min/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/ace-builds/src-min'));

    var themify = gulp.src(['./node_modules/ti-icons/**/*'])
        .pipe(gulp.dest('./src/assets/vendors/iconfonts/themify'));

    var highlightjs = gulp.src(['./node_modules/highlight.js/styles/*.css'])
        .pipe(gulp.dest('./src/assets/vendors/hilightjs/skins/'));

    var apexcharts = gulp.src(['node_modules/apexcharts/dist/apexcharts.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/apexcharts/'));

    var chartjs = gulp.src(['node_modules/chart.js/dist/Chart.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/chartjs/'));

    var d3js = gulp.src(['node_modules/d3/dist/d3.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/d3/'));

    var c3js = gulp.src(['node_modules/c3/c3.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/c3/'));

    var codemirror = gulp.src(['node_modules/codemirror/lib/codemirror.js', 'node_modules/codemirror/mode/javascript/javascript.js', 'node_modules/codemirror/mode/shell/shell.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/codemirror/'));

    var fullcalendar = gulp.src(['node_modules/fullcalendar/dist/fullcalendar.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/fullcalendar/'));

    var simplemde = gulp.src(['node_modules/simplemde/dist/simplemde.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/simplemde/'));
    return merge(
        mdi,
        fontawesome,
        flagicon,
        simplelineicon,
        summernote,
        tinymce,
        acebuilds,
        themify,
        highlightjs,
        apexcharts,
        chartjs,
        d3js,
        c3js,
        codemirror,
        fullcalendar,
        simplemde
    );
});


/*Building vendor scripts needed for basic template rendering*/
gulp.task('bundleCoreJS', function () {
    return gulp.src([
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/jquery-ui-dist/jquery-ui.js',
            './node_modules/popper.js/dist/umd/popper.min.js',
            './node_modules/bootstrap/dist/js/bootstrap.min.js',
        ])
        .pipe(concat('core.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/js'));
});



/*Building vendor styles needed for basic template rendering*/
gulp.task('bundleCoreCSS', function () {
    return gulp.src([])
        .pipe(concat('core.css'))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./src/assets/vendors/css'));
});



/*Building optional vendor scripts for addons*/
gulp.task('bundleVendorJS', function () {
    return gulp.src([
            'node_modules/raphael/raphael.min.js',
            'node_modules/moment/moment.js',
            'node_modules/chartist/dist/chartist.min.js',
            'node_modules/morris.js/morris.min.js',
            'node_modules/jquery-tags-input/dist/jquery.tagsinput.min.js',
            'node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
            'node_modules/select2/dist/js/select2.min.js',
            'node_modules/switchery/standalone/switchery.js',
            'node_modules/jquery-validation/dist/jquery.validate.min.js',
            'node_modules/bootstrap-maxlength/bootstrap-maxlength.min.js',
            'node_modules/jquery-validation/dist/jquery.validate.min.js',
            'node_modules/datatables.net/js/jquery.dataTables.js',
            'node_modules/datatables.net-bs4/js/dataTables.bootstrap4.js',
            'node_modules/jquery-toast-plugin/dist/jquery.toast.min.js',
            'node_modules/nouislider/distribute/nouislider.min.js',
            'node_modules/jquery-sparkline/jquery.sparkline.min.js',
            'node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.min.js',
            'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
            'node_modules/smartwizard/dist/js/jquery.smartWizard.min.js',
            'node_modules/jquery-circle-progress/dist/circle-progress.min.js',
            'node_modules/waypoints/lib/jquery.waypoints.min.js',
            'node_modules/counterup/jquery.counterup.min.js'
        ])
        .pipe(concat('vendor.addons.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src/assets/vendors/js'));
});


/*Building optional vendor styles for addons*/
gulp.task('bundleVendorCSS', function () {
    return gulp.src([
            'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css',
            'node_modules/c3/c3.min.css',
            'node_modules/chartist/dist/chartist.min.css',
            'node_modules/codemirror/lib/codemirror.css',
            'node_modules/codemirror/theme/ambiance.css',
            'node_modules/datatables.net-bs4/css/dataTables.bootstrap4.css',
            'node_modules/fullcalendar/dist/fullcalendar.min.css',
            'node_modules/ion-rangeslider/css/ion.rangeSlider.css',
            'node_modules/ion-rangeslider/css/ion.rangeSlider.skinFlat.css',
            'node_modules/jquery-tags-input/dist/jquery.tagsinput.min.css',
            'node_modules/jquery-toast-plugin/dist/jquery.toast.min.css',
            'node_modules/morris.js/morris.css',
            'node_modules/nouislider/distribute/nouislider.min.css',
            'node_modules/select2/dist/css/select2.min.css',
            'node_modules/select2-bootstrap-theme/dist/select2-bootstrap.min.css',
            'node_modules/simplemde/dist/simplemde.min.css',
            'node_modules/switchery/standalone/switchery.css',
            'node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.css',
            'node_modules/smartwizard/dist/css/smart_wizard.min.css',
            'node_modules/smartwizard/dist/css/smart_wizard_theme_arrows.min.css',
            'node_modules/smartwizard/dist/css/smart_wizard_theme_circles.min.css',
            'node_modules/smartwizard/dist/css/smart_wizard_theme_dots.min.css'
        ])
        .pipe(concat('vendor.addons.css'))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./src/assets/vendors/css'));
});