var redis=require('redis');
var io=require('socket.io');
var app=require('../app');

const redisOptions={host:'redis'};
var redisServer=redis.createClient(redisOptions);
var pushServer=io(app.server);

exports.pushNewNotification=function(id){
	redisServer.publish('NewNotification',JSON.stringify({id:id}));
}

pushServer.on('connection',(client)=>{
	var redisClient=redis.createClient(redisOptions);
	redisClient.subscribe('NewNotification');

	redisClient.on('message',(newNotiStr)=>{
		client.emit('newNotification',JSON.parse(newNotiStr));
	});

	pushServer.on('disconnect',()=>{
		redisClient.unsubscribe();
		redisClient.quit();
	});
});
