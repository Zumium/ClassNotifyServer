var express=require('express');
var passport=require('passport');
var apiAuthStrategy=require('./components/api-auth');
var bodyParser=require('body-parser');
var errorHandler=require('./midwares/error-handler');
var http=require('http');
var push=require('./services/pushservice');

var app=express();

var studentRouter=require('./routers/student');
var notificationRouter=require('./routers/notification');
//Initialize passport with given strategy
passport.use(apiAuthStrategy);

app.use(passport.initialize());
app.use(passport.authenticate('basic',{session:false}));
app.use(bodyParser.json());

app.use('/users',studentRouter);
app.use('/notifications',notificationRouter);

app.use(errorHandler);

var server=http.createServer(app);
push.init(server);
server.listen(7000);
