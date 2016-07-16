var express=require('express');
var ns=require('../services/notiservice');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var genError=require('../tools/gene-error');
var filtObject=require('../tools/filt-object');

var router=module.exports=express.Router();

router.get('/:sid/notifications',(req,res,next)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	//权限检查，不允许查看别人的通知
	//if(queriedUser!=currentUser) return res.status(403).json({message:'Not allow to query others\' notifications'});
	Promise.join(ps.isOperateOnSelf(req,queriedUser),(isSelf)=>{
		//权限检查，不允许查看别人的通知
		if(!isSelf) return next(genError(403,'Not permitted'));
		ns.getPersonalNotifications(queriedUser,req.query).then((notifications)=>{
			var results=[];
			notifications.forEach((eachNoti)=>{
				var t=eachNoti.get();
				delete t['notificationStatus'];
				results.push(t);
			});
			res.status(200).json(results);
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});
