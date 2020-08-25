require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatsRouter = require('./routes/chats');
var quotesRouter = require('./routes/quotes');
var adminRouter = require('./routes/admin');
var chapterWiseFaqRouter = require('./routes/chapterWiseFaqs');
var userSessionRouter = require('./routes/botdata');
var postcodesRouter = require('./routes/postcodes');
var feedbackRouter = require('./routes/feedback');
var categoryRouter = require('./routes/category');
var recipesRouter = require('./routes/recipes');

var app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var port = process.env.port || 3005
app.listen(port, () => console.log(`listening on port ${port}!`))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chat', chatsRouter);
app.use('/quotes', quotesRouter);
app.use('/admin', adminRouter);
app.use('/chapterFaq', chapterWiseFaqRouter);
app.use('/userSession', userSessionRouter);
app.use('/postcodes', postcodesRouter);
app.use('/feedback', feedbackRouter);
app.use('/category', categoryRouter);
app.use('/recipes', recipesRouter);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
