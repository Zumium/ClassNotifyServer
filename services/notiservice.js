var db=require('../repositories/db');
var genError=require('../tools/gene-error');
var Promise=require('bluebird');
var pushService=require('./pushservice');

//读取个人通知
exports.getPersonalNotifications=function(id,options){
	return new Promise((resolve,reject)=>{
		//默认设置
		var allOptions={
			star: 'all', //是否加星
			read: 'all', //是否已读
	       		start: '0',//截取开始处
	       		end: '-1', //截取结束处
	       		sent: false
		};
		//合并参数里的设置
		for(var key in options){
			allOptions[key]=options[key];
		}
		if(allOptions.sent){
			//作为发送者发送出去的通知
			db.Student.findOne({where:{id:id}})
			.then((student)=>{
				if(!student)
					throw genError(404,'No such student');
				return student.getSentNotifications({
					attributes:{exclude:['createdAt','updatedAt']},
					order:[['publishDate','DESC']],
					offset:parseInt(allOptions['start']),
					limit: calculateLimit(allOptions)
				});
			})
			.then(resolve)
			.catch(reject);
		}
		else{
			//作为接受者收到的通知
			db.Student.findOne({where:{id:id}})
			.then((student)=>{
				if(!student)
					throw genError(404,'No such student');
				//已查询到接受者
				//开始读取制定信息
				return student.getReceivedNotifications({
					attributes:{exclude:['createdAt','updatedAt']},
					through:{where:filterOptions(allOptions)},
					order:[['publishDate','DESC']],
					offset:parseInt(allOptions['start']),
					limit: calculateLimit(allOptions)
				});
			})
			.then(resolve)
			.catch(reject);
		}
	});
}

var getNotiById=exports.getNotificationById=function(id){
	return new Promise((resolve,reject)=>{
		db.Notification.findOne({
			where:{id:id},
			attributes:{exclude:['createdAt','updatedAt']}
		}).then((notification)=>{
			if(!notification)
				throw genError(404,'No such notification');
			resolve(notification);
		})
		.catch(reject);
	});
}

exports.getNotificationReadingStatusById=function(id,sid){
	return new Promise((resolve,reject)=>{
		getNotiById(id)
		.then((notification)=>{
			return notification.getReceivers({
				attributes:{exclude:['password','createdAt','updatedAt']},
				joinTableAttributes:['id','read','star']
			});
		})
		.then((results)=>{
			if(sid){
				var searchResult=results.find((each)=>sid==each.get('id'));
				if(searchResult) resolve(searchResult);
				else 
					throw genError(404,'This notification doesn\'t have such a receiver');
			}
			else resolve(results);
		})
		.catch(reject);
	});
}

exports.publishNewNotification=function(newNotification){
	return new Promise((resolve,reject)=>{
		//必须要有正文
		//if(!newNotification['content']) return reject(new Error('A notification must have content'));
		//必须要有接收者
		//if(!newNotification['receivers']) return reject(new Error('A notification mush have at least one receiver'));
		//必须要有发送者
		//if(!newNotification['sender']) return reject(new Error('A notification mush have a sender'));
		//添加新通知到数据库
		var newNoti={};
		//仅复制所需部分进行添加
		newNoti['title']=newNotification['title'];
		newNoti['content']=newNotification['content'];

		db.Notification.create(newNoti)
		.then((notification)=>{
			//设置发送者
			var setSender=db.Student.findOne({where:{id:newNotification['sender']}})
			.then((senderStudent)=>{
				return notification.setSender(senderStudent);
			});
			//设置接受者
			var setReceivers=db.Student.findAll({where:{id:newNotification['receivers']}})
			.then((receiverStudents)=>{
				return notification.setReceivers(receiverStudents,{read:false,star:false});
			});
			//---
			return Promise.join(setSender,setReceivers,()=>{
				return notification;
			});
		})
		.then((notification)=>{
			pushService.pushNewNotification(notification);
			resolve(notification);
		})
		.catch(reject);
	});
}

exports.getAllNotifications=function(){
	return new Promise((resolve,reject)=>{
		db.Notification.findAll({attributes:{exclude:['createdAt','updatedAt']}})
		.then(resolve,reject);
	});
}

exports.notificationExists=function(id){
	return new Promise((resolve,reject)=>{
		db.Notification.count({where:{id:id}})
		.then((count)=>{
			resolve(count==1);
		})
		.catch(reject);
	});
}

function filterOptions(opt){
	var options={};
	if(opt['star']!='all'){
		if(opt['star']=='yes') options['star']=true;
		else options['star']=false;
	}
	if(opt['read']!='all'){
		if(opt['read']=='yes') options['read']=true;
		else options['read']=false;
	}
	return options;
}

function calculateLimit(opt){
	var start=null;
	var end=null;
	if((start=parseInt(opt.start))==NaN || (end=parseInt(opt.end))==NaN)
		return undefined;
	if(end==-1) return undefined;
	else if(start>end) return undefined; //起始位置大于结束位置，输入有错误，按为定义结束位置处理
	else return end-start+1;
}
