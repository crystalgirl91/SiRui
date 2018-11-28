var gulp = require("gulp");
var fileinclude = require("gulp-file-include");
var less = require("gulp-less");
var gutil = require('gulp-util');
var combiner =require("stream-combiner2");
var watchpath = require("gulp-watch-path");
var prefixer = require("gulp-autoprefixer");
var minifycss = require("gulp-minify-css");
var imagemin = require('gulp-imagemin')
var del = require("del");

var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}

// 头部尾部的复用
gulp.task("watch-template",function(){
	gulp.watch("./src/*.html",["file-include"]);
	gulp.watch("./src/template/*.html",["file-include"]);
});
gulp.task("file-include",function(){
	console.log("file-include")
	var combined = combiner.obj([
		gulp.src("./src/*.html"),
		fileinclude({
			prefix:"@@",
			basepath:"@file"
		}),
		gulp.dest("./dist/")
	]);
	combined.on("error",handleError);
	
})

// 图片压缩
gulp.task('watchimage', function () {
    gulp.watch('src/images/**/*', function (event) {
        var paths = watchpath(event,'src/images/','dist/images/')
        gulp.src(paths.srcPath)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('image', function () {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/images'))
})
// 复制文件
gulp.task("watch-copy",function(){
	gulp.watch("./src/plugins/**/*",["copy"])
})
gulp.task("copy",function(){
	gulp.src("./src/plugins/**/*")
	.pipe(gulp.dest("./dist/plugins"));

	gulp.src("./src/css/**/*")
	.pipe(gulp.dest("./dist/styles"));
})

// less解析
gulp.task("watchless",function(){
	gulp.watch("./src/less/*.less",function(event){
		console.log("less change")
		var paths = watchpath(event,"./src/less/","./dist/styles/");
		var combined = combiner.obj([
			gulp.src(paths.srcPath),
			prefixer(),
			less(),
			minifycss(),
			gulp.dest(paths.distDir)
		]);
		combined.on("error",handleError);
	})
})
gulp.task("less2css",function(){
	combiner.obj([
		gulp.src("./src/less/*.less"),
		prefixer(),
		less(),
		minifycss(),
		gulp.dest("./dist/styles")
	])
})

gulp.task("watch",["watch-copy",'watch-template',"watchless","watchimage"]);

gulp.task("default",["file-include","copy","less2css","watch","image"])