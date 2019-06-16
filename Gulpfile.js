/*
**  jQuery Markup -- jQuery Template Based Markup Generation
**  Copyright (c) 2013-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var gulp   = require("gulp");
var rename = require("gulp-rename");
var jshint = require("gulp-jshint");
var eslint = require("gulp-eslint");
var uglify = require("gulp-uglify");

gulp.task("jshint", function() {
    gulp.src("jquery.markup.js")
        .pipe(jshint("jshint.json"))
        .pipe(jshint.reporter("default"))
});

gulp.task("eslint", function() {
    gulp.src("jquery.markup.js")
        .pipe(eslint({ configFile: "eslint.json" }))
});

gulp.task("uglify", function() {
    gulp.src("jquery.markup.js")
        .pipe(uglify({ preserveComments: false }))
        .pipe(rename("jquery.markup.min.js"))
        .pipe(gulp.dest("."));
});

gulp.task("default", [ "jshint", "eslint", "uglify" ]);

