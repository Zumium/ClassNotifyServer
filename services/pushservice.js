var redis=require('redis');
var io=require('socket.io');

const redisOptions={host:'redis'};
var redisServer=redis.createClient(redisOptions);
var pushServer=null;

exports.pushNewNotification=function(id){
	redisServer.publish('NewNotification',JSON.stringify({id:id}));
}

exports.init=function(server){
	pushServer=io(server);
	pushServer.on('connection',(client)=>{
		//create a new redis client to represent the connecting user
		//and subscribe the user to 'NewNotification' channel
		var redisClient=redis.createClient(redisOptions);
		redisClient.subscribe('NewNotification');
	
		//when new message has come
		redisClient.on('message',(channelName,newNotiStr)=>{
			client.emit('newNotification',JSON.parse(newNotiStr));
		});
	
		//when user goes offline
		pushServer.on('disconnect',()=>{
			redisClient.unsubscribe();
			redisClient.quit();
		});
	});
}
