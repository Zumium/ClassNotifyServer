var io=require('socket.io');
var ns=require('./userservice');

var pushServer=null;
var onlineClients={};
//inner functions: manage socket.io clients
function clientOnline(id,client){
	onlineClients[id]=client;
	client.userID=id;
}
function clientOffline(client){
	del onlineClients[client.userID];
}
function clientEmit(ids,eventName,data){
	ids.forEach((id)=>{
		var client=onlineClients[id];
		if(!client) return; //if client is offline,exit the function
		client.emit(eventName,data);
	});
}
//exported function: push a notification to its receivers
exports.pushNewNotification=function(notification){
	notification.getReceivers().then((receivers)=>{
		var receiverIds=receivers.map((receiver)=>{return receiver.get('id');});
		clientEmit(receiverIds,'newNotification',{id:notification.get('id')});
	});
}
//exported function: initialize pushing service
exports.init=function(server){
	pushServer=io(server);
	pushServer.on('connection',(client)=>{

		//Authorizing the new client
		client.on('authorize',(id,password)=>{
			us.vertifyUserLogin(id,password).then((isCorrect)=>{
				if(!isCorrect) return; //authorization failed
				clientOnline(id,client);
			});
		});

		//close connection
		client.on('disconnect',()=>{
			clientOffline(client);
		});

	});
}
