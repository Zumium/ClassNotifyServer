var ns=require('../services/notiservice');
var express=require('express');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var util=require('util');
var filtObject=require('../tools/filt-object');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

router.get('/:nid/status',(req,res,next)=>{
	var queriedNotification=req.params.nid;
	var currentUser=req.user;
	Promise.join(ps.isSender(queriedNotification,currentUser),(isSender)=>{
		if(!isSender) next(genError(403,'Not permitted'));
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
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});
//===================================================================
router.get('/:nid/status/:sid',(req,res,next)=>{
	var queriedNotification=req.params.nid;
	var currentUser=req.user;
	var queriedStudent=req.params.sid=='self'?currentUser:req.params.sid;
	Promise.join(ps.isOperateOnSelf(req,queriedStudent),ps.isSender(queriedNotification,currentUser),(isSelf,isSender)=>{
		if(isSelf){
			ns.getNotificationReadingStatusById(queriedNotification,currentUser).then((theStatus)=>{
				mainPart=theStatus.get();
				statusPart=theStatus.get('notificationStatus').get();
				statusPart=filtObject(['read','star'],statusPart);
				for(var key in statusPart)
					mainPart[key]=statusPart[key];
				delete mainPart['notificationStatus'];
				res.status(200).json(mainPart);
			},(err)=>{
				next(err);
			});
		}
		else if(isSender){
			ns.getNotificationReadingStatusById(queriedNotification,queriedStudent).then((theStatus)=>{
				mainPart=theStatus.get();
				statusPart=theStatus.get('notificationStatus').get();
				mainPart['read']=statusPart['read'];
				delete mainPart['notificationStatus'];
				res.status(200).json(mainPart);

			},(err)=>{next(err);});
		}
		else{next(genError(403,'Not permitted'));}
	}).then(null,(err)=>{next(err);});
});

router.patch('/:nid/status/:sid',(req,res,next)=>{
	var queriedNotification=req.params.nid;
	var currentUser=req.user;
	var queriedStudent=req.params.sid=='self'?currentUser:req.params.sid;
	var data=req.body;
	Promise.join(ps.isOperateOnSelf(req,queriedStudent),(isSelf)=>{
		if(!isSelf) return next(genError(403,'Not permitted'));

		ns.getNotificationReadingStatusById(queriedNotification,queriedStudent).then((theStatus)=>{
			data=filtObject(['star','read'],data);
			var statusStorage=theStatus.get('notificationStatus');

			if(data.read==false) return next(genError(400,'Can\'t set to unread unless you can erase your memory...'));

			statusStorage.update(data).then(()=>{
				res.sendStatus(200);
			},(err)=>{next(err);});
		},(err)=>{next(err);});
	}).then(null,(err)=>{next(err);});
});
