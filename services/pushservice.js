var io=require('socket.io');
var us=require('./userservice');

var pushServer=null;
var onlineClients={};

const LOGIN_TIMELIMIT=60*1000; //one minute
//inner functions: manage socket.io clients
function clientOnline(id,client){
	if(onlineClients[id]) throw new Error("client is already online");
	onlineClients[id]=client;
	client.userID=id;
	cancleLoginTimeout(client); //cancle login timeout when logged in
}
function clientOffline(client){
	if(!client.userID) return; //client is not logged in yet
	delete onlineClients[client.userID];
}
function clientEmit(ids,eventName,data){
	ids.forEach((id)=>{
		var client=onlineClients[id];
		if(!client) return; //if client is offline,exit the function
		client.emit(eventName,data);
	});
}
function setLoginTimeout(client){
	if(client.loginTimeout) return; //already has a timer
	client.loginTimeout=setTimeout(()=>{
			client.emit('authorize-error',{message:'Login timeout'});
			client.disconnect();
	},LOGIN_TIMELIMIT);
}
function cancleLoginTimeout(client){
	if(!client.loginTimeout) return; //login timeout doesn't exist
	clearTimeout(client.loginTimeout);
	delete client.loginTimeout;
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

		//set timeout that client must login within a minute
		//otherwise the client shall be closed
		setLoginTimeout(client);

		//Authorizing the new client
		client.on('authorize',(id,password)=>{
			us.vertifyUserLogin(id,password).then((isCorrect)=>{
				if(!isCorrect){ //authorization failed
					client.emit('authorize-error',{message:'username or password wrong'});
					return;
				}
				try{
					clientOnline(id,client);
				}
				catch(err){
					client.emit("authorize-error",{message:err.message});
				}
			});
		});
		//client.emit("authorize-succeed");
		//client.emit("authorize-error");
		
		//logoff(not quit)
		client.on('logoff',()=>{
			clientOffline(client);
			setLoginTimeout(client);
		});

		//close connection
		client.on('disconnect',()=>{
			clientOffline(client);
			cancleLoginTimeout(client);
		});

	});
}
