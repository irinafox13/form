// Подключение плагинов GULP 
const gulp = require('gulp');// подключаем модули gulp 
const fileinclude = require('gulp-file-include'); // объединение html afqkjd
const concat = require('gulp-concat');//  конкатенация
const autoprefixer = require('gulp-autoprefixer');// Автопрефиксы
const cleanCSS = require('gulp-clean-css');// Минификация файла со стилями
const uglify = require('gulp-uglify');// Минификация файлов со скриптами
const del = require('del'); // очистка от лишних файлов
const browserSync = require('browser-sync').create(); // синхронизация кода с браузером
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps'); // чтобы в отладчике кода отображался номер строки в scss файле 
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const webpcss = require('gulp-webp-css');
const rename = require('gulp-rename');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
// const fs = require('fs');

const htmlFiles = [// порядок подключения html файлов 
   './src/index.html'
]

const styleFiles = [// порядок подключения CSS файлов 
   './src/scss/styles.scss'
]

const scriptFiles = [// порядок подключения JS файлов 
   './src/js/lib.js',
   './src/js/main.js'
] 

gulp.task('html', () => {   // функция для обработки наших стилей
   return gulp.src(htmlFiles)   // делаем конкатенацию наших файлов css .Перенос файлов gulp styles - где styles - это название таска, а не функции
   .pipe(fileinclude()) // объединение файлов
   .pipe(webphtml()) // создает конструкцию picture в html
   .pipe(gulp.dest('./build'))// Выходная папка для стилей - куда все переместится 
   .pipe(browserSync.stream());
});

gulp.task('styles', () => {   // функция для обработки наших стилей
   return gulp.src(styleFiles)   // делаем конкатенацию наших файлов css .Перенос файлов gulp styles - где styles - это название таска, а не функции
   .pipe(sourcemaps.init())
   .pipe(sass()) // вызываем SASS
   .pipe(concat('style.css'))   // Объединение файлов в один 
   .pipe(autoprefixer({ // Автопрефиксы
      overrideBrowserlist: ["last 2 version"],
      cascade: false
   }))   
   .pipe(webpcss())
   .pipe(gulp.dest('./build/css')) // выгрузим перед тем как сжать файл, чтобы было два варианта файлов
   .pipe(cleanCSS({// Минификация 
      level: 2
   })) 
   .pipe(sourcemaps.write('./'))   
   .pipe(rename({
      suffix: '.min'
   }))
   .pipe(gulp.dest('./build/css'))// Выходная папка для стилей - куда все переместится 
   .pipe(browserSync.stream());
});


gulp.task('scripts', () => { // таск- задание на скрипты JS 
   return gulp.src(scriptFiles)   
   .pipe(concat('script.js'))   // Объединение файлов в один 
   .pipe(gulp.dest('./build/js'))
   .pipe(uglify({  // Минификация     
      toplevel: true // Включаем максимальный уровень минификации
   }))      
   .pipe(rename({
      suffix: '.min'
   }))
   .pipe(gulp.dest('./build/js')) // Выходная папка для скриптов  - куда все переместится 
   .pipe(browserSync.stream());
});

gulp.task('del', () => {
   return del(['build/*']) // Очищаем папку build от лишних файлов
});

gulp.task('img-compress', () => {
   return gulp.src('./src/img/**')
   .pipe(webp({
      quality: 70
   }))
   .pipe(gulp.dest('./build/img/'))
   .pipe(gulp.src('./src/img/**'))
   .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3
   }))
   .pipe(gulp.dest('./build/img/'))
});

gulp.task('otf2ttf', () => { // преобразуем формат шрифта otf в ttf, что ttf затем преобразовать в woff
   return gulp.src('./src/fonts/*.otf')
   .pipe(fonter({
      formats: ['ttf']
   }))
   .pipe(gulp.dest('./src/fonts/'));
});

gulp.task('fonts', () => {
   gulp.src('./src/fonts/**')
  .pipe(ttf2woff())
  .pipe(gulp.dest('./build/fonts/'));
  return gulp.src('./src/fonts/**')
  .pipe(ttf2woff2())
  .pipe(gulp.dest('./build/fonts/'));
});



gulp.task('watch', () => { // Просматривание файлов и автообновление
   // запустится сервер и начнется отслеживание в режиме реального времени файлов css, js, html
   //если изменяется css , мы вызываем функцию styles , если изменяется js , мы вызываем функцию scripts и тд
   // далее обновляем страницу - browserSync.reload
   browserSync.init({
      server: {
          baseDir: "./build"
      }
  });
  
  gulp.watch('./src/*.html', gulp.series('html'))
  gulp.watch('./src/fonts', gulp.series('fonts'))
  gulp.watch('./src/img/**', gulp.series('img-compress'))
  gulp.watch('./src/scss/**/*.scss', gulp.series('styles')) // Следим за CSS файлами 
  gulp.watch('./src/js/**/*.js', gulp.series('scripts')) // Следим за JS файлами 
  gulp.watch("./build/*.html").on('change', browserSync.reload); // Следим за HTML файлами 
});

// таск по умолчанию, если вызвать gulp, запустится данный таск 
gulp.task('default', gulp.series('del', gulp.parallel('html', 'styles', 'scripts', 'img-compress', 'fonts'), 'watch')); 