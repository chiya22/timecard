const createError = require('http-errors');
const express = require('express');
const path = require('node:path'); // Node.js組み込みモジュールはnode:プロトコルでimport
const exressSession = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const basicAuth = require('basic-auth-connect');
const connectFlash = require('connect-flash');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(`${__dirname}/public`)); // テンプレートリテラルに変更
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/admin/*', basicAuth((user, password) => user === 'ps' && password === 'chiyoda'));
app.all('/admin', basicAuth((user, password) => user === 'ps' && password === 'chiyoda'));

app.use(cookieParser('timecard'));
app.use(
  exressSession({
    secret: 'timecard',
    cookie: {
      maxAge:4000000
    },
    resave:false,
    saveUninitialized: false
  })
);

//connect-flashをミドルウェアとして設定
app.use(connectFlash());
//フラッシュメッセージをresのローカル変数のflashMessagesに代入
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
