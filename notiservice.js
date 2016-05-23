var db=require('./db');
var Promise=require('bluebird');

//读取个人通知
exports.getPersonalNotifications=function(id,options){
	return new Promise((resolve,reject)=>{
		//默认设置
		var allOptions={
			star: 2, //是否加星
	       		read: 2, //是否已读
	       		start: 0,//截取开始处
	       		end: -1, //截取结束处
	       		sent: false
		};
		//合并参数里的设置
		for(var key in options){
			allOptions[key]=options[key];
		}
		if(allOptions.sent){
			//作为发送者发送出去的通知
			db.Student.findOne({where:{id:id}}).then((student)=>{
				if(!student){
					var NoSuchUserError=new Error('No such student');
					NoSuchUserError.suggestStatusCode=404;
					return reject(NoSuchUserError);
				}
				student.getSentNotifications({
					attributes:{exclude:['createdAt','updatedAt']}
				}).then((notifications)=>{resolve(notifications);},(err)=>{reject(err);});
			},(err)=>{reject(err);});
		}
		else{
			//作为接受者收到的通知
			db.Student.findOne({where:{id:id}}).then((student)=>{
				if(!student){
					var NoSuchUserError=new Error('No such student');
					NoSuchUserError.suggestStatusCode=404;
					return reject(NoSuchUserError);
				}
				//已查询到接受者
				//开始读取制定信息
				student.getReceivedNotifications({
					attributes:{exclude:['createdAt','updatedAt']},
					through:{where:filterOptions(allOptions)},
					order:[['publishDate','DESC']],
					offset:parseInt(allOptions['start']),
					limit: calculateLimit(allOptions)
				}).then((notifications)=>{resolve(notifications);},(err)=>{reject(err);});
			},(err)=>{reject(err);});
		}
	});
}

var getNotiById=exports.getNotificationById=function(id){
	return new Promise((resolve,reject)=>{
		db.Notification.findOne({
			where:{id:id},
			attributes:{exclude:['createdAt','updatedAt']}
		}).then((notification)=>{resolve(notification);},(err)=>{reject(err);});
	});
}

exports.getNotificationReadingStatusById=function(id){
	return new Promise((resolve,reject)=>{
		getNotiById(id).then((notification)=>{
			notification.getReceivers({
				attributes:{exclude:['password','createdAt','updatedAt']},
				joinTableAttributes:['read','star']
			}).then((results)=>{resolve(results);},(err)=>{reject(err);});
		},(err)=>{reject(err);});
	});
}

exports.publishNewNotification=function(newNotification){
	return new Promise((resolve,reject)=>{
		//必须要有正文
		if(!newNotification['content']) return reject(new Error('A notification must have content'));
		//必须要有接收者
		if(!newNotification['receivers']) return reject(new Error('A notification mush have at least one receiver'));
		//必须要有发送者
		if(!newNotification['sender']) return reject(new Error('A notification mush have a sender'));
		//添加新通知到数据库
		var newNoti={};
		//仅复制所需部分进行添加
		newNoti['title']=newNotification['title'];
		newNoti['content']=newNotification['content'];
		db.Notification.create(newNoti).then((notification)=>{
			//新通知添加成功
			//设置发送者
			var count=2;
			var check=()=>{
				count--;
				if(count==0) resolve();
			};

			db.Student.findOne({where:{id:newNotification['sender']}}).then((senderStudent)=>{
				notification.setSender(senderStudent).then(()=>{check();},(err)=>{reject(err);});
			},(err)=>{reject(err);});
			//设置接受者
			db.Student.findAll({where:{id:newNotification['receivers']}}).then((receiverStudents)=>{
				notification.setReceivers(receiverStudents,{read:false,star:false}).then(()=>{check();},(err)=>{reject(err);});
			},(err)=>{reject(err);});
			//---
		},(err)=>{reject(err);});
	});
}

exports.getAllNotifications=function(){
	return new Promise((resolve,reject)=>{
		db.Notification.findAll({attributes:{exclude:['createdAt','updatedAt']}}).then((notis)=>{
			resolve(notis);
		},(err)=>{reject(err);});
	});
}

function filterOptions(opt){
	var options={};
	if(opt['star']!=2){
		if(opt['star']==1) options['star']=true;
		else options['star']=false;
	}
	if(opt['read']!=2){
		if(opt['read']==1) options['read']=true;
		else options['read']=false;
	}
	return options;
}

function calculateLimit(opt){
	if(opt['end']==-1) return undefined;
	else if(opt['start']>opt['end']) return undefined; //起始位置大于结束位置，输入有错误，按为定义结束位置处理
	else return opt['end']-opt['start']+1;
}
