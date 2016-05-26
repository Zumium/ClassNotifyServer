var us=require('../userservice');
var ns=require('../notiservice');
var express=require('express');
var Promise=require('bluebird');
var ps=require('../pmsservice');
var util=require('util');

var router=exports.router=express.Router();

router.get('/',(req,res)=>{
	ns.getAllNotifications().then((notifications)=>{
		var results=[];
		notifications.forEach((eachNotification)=>{
			var t=eachNotification.get();
			results.push(t);
		});
		res.status(200).json(results);
	},(err)=>{
		res.status(500).json({message:err.message});
	});
});

router.post('/',(req,res)=>{
	var currentUser=req.user;
	var data=req.body;
	Promise.join(us.isAdmin(currentUser),ps.checkAttributes(['content','receivers'],null,data),(isAdmin,isGoodNoti)=>{
		if(!isAdmin) return res.status(403).json({message:'Not permitted'});
		if(!isGoodNoti) return res.status(400).json({message:'Something wrong within new notification information'});
		if(!util.isArray(data.receivers)) return res.status(400).json({message:'Receivers should be an array'});
		data=us.filtObject(['title','content','receivers'],data);
		data['sender']=currentUser;
		ns.publishNewNotification(data).then(()=>{
			res.sendStatus(200);
		},(err)=>{
			res.status(400).json({message:err.message});
		});
	}).then(null,(err)=>{
		res.status(500).json({message:err.message});
	});
});

//==============================================

router.get('/:nid',(req,res)=>{
	var queriedNotification=req.params.nid;
	ns.getNotificationById(queriedNotification).then((notification)=>{
		if(!notification) return res.status(404).json({message:'No such notification'});
		res.status(200).json(notification.get());
	},(err)=>{
		if(err.suggestStatusCode!=500)
			res.status(err.suggestStatusCode).json({message:err.message});
		else
			res.status(500),json({message:err.message});
	});
});

router.delete('/:nid',(req,res)=>{
	var currentUser=req.user;
	var queriedNotification=req.params.nid;
	Promise.join(us.isAdmin(currentUser),(isAdmin)=>{
		if(!isAdmin) return res.status(403).json({message:'Not permitted'});
		ns.getNotificationById(queriedNotification).then((notification)=>{
			if(!notification) return res.status(404).json({message:'No such notification'});
			notification.destroy().then(()=>{
				res.sendStatus(200);
			},(err)=>{
				res.status(500).json({message:err.message});
			});
		},(err)=>{
			res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		res.status(500).json({message:err.message});
	});
});
//==============================================
router.get('/:nid/status',(req,res)=>{
	var queriedNotification=req.params.nid;
	var currentUser=req.user;
	Promise.join(ps.isSender(queriedNotification,currentUser),(isSender)=>{
		if(!isSender) return res.status(403).json({message:'Not permitted'});
		ns.getNotificationReadingStatusById(queriedNotification).then((statuses)=>{
			var results=[];
			statuses.forEach((eachStatus)=>{
				var mainPart=eachStatus.get();
				var readStatus=mainPart['notificationStatus'].get('read');
				//去除了加星信息，对于通知的发送者来说不应该知道该通知的阅读者是否加星
				delete mainPart['notificationStatus'];
				mainPart['read']=readStatus;
				results.push(mainPart);
			});
			res.status(200).json(results);
		},(err)=>{
			res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
		else res.status(500).json({message:err.message});
	});
});
//===================================================================
router.get('/:nid/status/:sid',(req,res)=>{
	var queriedNotification=req.params.nid;
	var queriedStudent=req.params.sid;
	var currentUser=req.user;
	Promise.join(ps.isOperateOnSelf(req,queriedStudent),ps.isSender(queriedNotification,currentUser),(isSelf,isSender)=>{
		if(isSelf){
			ns.getNotificationReadingStatusById(queriedNotification,currentUser).then((theStatus)=>{
				mainPart=theStatus.get();
				statusPart=theStatus.get('notificationStatus').get();
				for(var key in statusPart)
					mainPart[key]=statusPart[key];
				delete mainPart['notificationStatus'];
				res.status(200).json(mainPart);
			},(err)=>{
				if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
				else res.status(500).json({message:err.message});
			});
		}
		else if(isSender){
			ns.getNotificationReadingStatusById(queriedNotification,queriedStudent).then((theStatus)=>{
				mainPart=theStatus.get();
				statusPart=theStatus.get('notificationStatus').get();
				mainPart['read']=statusPart['read'];
				delete mainPart['notificationStatus'];
				res.status(200).json(mainPart);
			},(err)=>{
				if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
				else res.status(500).json({message:err.message});
			});
		}
		else{
			res.status(403).json({message:'Not permitted'});
		}
	}).then(null,(err)=>{
		if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
		else res.status(500).json({message:err.message});
	});
});

router.patch('/:nid/status/:sid',(req,res)=>{
	var queriedStudent=req.params.sid;
	var queriedNotification=req.params.nid;
	var currentUser=req.user;
	var data=req.body;
	Promise.join(ps.isOperateOnSelf(req,queriedStudent),ps.checkAttributes(['star'],null,data),ps.checkAttributes(['read'],null,data),(isSelf,hasStar,hasRead)=>{
		if(!isSelf) return res.status(403).json({message:'Not permitted'});
		if(!hasStar && !hasRead) return res.status(400).json({message:'Empty request are not allowed'});

		ns.getNotificationReadingStatusById(queriedNotification,queriedStudent).then((theStatus)=>{
			data=us.filtObject(['star','read'],data);
			theStatus.get('notificationStatus').update(data).then(()=>{
				res.sendStatus(200);
			},(err)=>{
				res.status(500).json({message:err.message});
			});
		},(err)=>{
			if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
			else res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
		else res.status(500).json({message:err.message});
	});
});
