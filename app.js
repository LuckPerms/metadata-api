const express = require('express');
const logger = require('morgan');

const expressPretty = require('express-prettify');
const cors = require('cors');

const dataRouter = require('./routes/data').router;
const translationRouter = require('./routes/translations').router;

const app = express();

app.use(logger('dev'));
app.use(expressPretty({ query: 'pretty' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/data', dataRouter);
app.use('/translation', translationRouter);

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(404).send('Endpoint not found');
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
