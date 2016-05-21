var express=require('express');
var passport=require('passport');
var apiAuthStrategy=require('./api-auth');

var app=express();

var student=require('./routers/student');
//Initialize passport with given strategy
passport.use(apiAuthStrategy);

app.use(passport.initialize());
app.use(passport.authenticate('basic',{session:false}));

app.use('/',student);

app.listen(8080);
