var express=require('express');
var passport=require('passport');
var apiAuthStrategy=require('./api-auth');
var bodyParser=require('body-parser');

var app=express();

var student=require('./routers/student');
var studentp=require('./routers/student-personal');
//Initialize passport with given strategy
passport.use(apiAuthStrategy);

app.use(passport.initialize());
app.use(passport.authenticate('basic',{session:false}));
app.use(bodyParser.json());

app.use('/users',student.router);
app.use('/users/:sid',studentp.router);

app.listen(8000);
