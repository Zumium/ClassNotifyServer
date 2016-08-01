var us=require('../services/userservice');
var ns=require('../services/notiservice');
var express=require('express');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var util=require('util');
var filtObject=require('../tools/filt-object');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

router.get('/',(req,res,next)=>{
	ns.getAllNotifications().then((notifications)=>{
		return us.replaceUserIdToInfo(notifications.map((eachNotification)=>{
			return eachNotification.get();
		}),'sender');
	}).then((notifications)=>{
		res.status(200).json(notifications);
	}).catch(next);
});

router.post('/',(req,res,next)=>{
	var currentUser=req.user;
	var data=req.body;
	Promise.join(us.isAdmin(currentUser),ps.checkAttributes(['content','receivers'],null,data),(isAdmin,isGoodNoti)=>{
		if(!isAdmin) throw genError(403,'Not permitted');
		if(!isGoodNoti) throw genError(400,'Something wrong within new notification');
		if(!util.isArray(data.receivers)) throw genError(400,'Receivers should be an array');

		data=filtObject(['title','content','receivers'],data);
		data['sender']=currentUser;
		return ns.publishNewNotification(data);
	}).then((notification)=>{
		res.location('/notifications/'+notification.get('id')).sendStatus(201);
	},(err)=>{
		return genError(400,err.message);
	}).catch(next);
});
