var express=require('express');
var ns=require('../services/notiservice');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var us=require('../services/userservice');
var genError=require('../tools/gene-error');
var filtObject=require('../tools/filt-object');

var router=module.exports=express.Router();

router.get('/:sid/notifications',(req,res,next)=>{
	var currentUser=req.user;
	var queriedUser=req.params.sid=='self'?currentUser:req.params.sid;
	//权限检查，不允许查看别人的通知
	//if(queriedUser!=currentUser) return res.status(403).json({message:'Not allow to query others\' notifications'});
	Promise.join(ps.isOperateOnSelf(req,queriedUser),(isSelf)=>{
		//权限检查，不允许查看别人的通知
		if(!isSelf) throw genError(403,'Not permitted');
		return ns.getPersonalNotifications(queriedUser,req.query);
	}).then((notifications)=>{
		return us.replaceUserIdToInfo(notifications.map((eachNoti)=>{
			//提取出主要信息
			//并删除notificationStatus部分
			var t=eachNoti.get();
			delete t['notificationStatus'];
			return t;
		}),'sender');
	}).then((notis)=>{
		res.status(200).json(notis);
	}).catch(next);
});
