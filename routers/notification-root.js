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
		var results=[];
		notifications.forEach((eachNotification)=>{
			var t=eachNotification.get();
			results.push(t);
		});
		res.status(200).json(results);
	},(err)=>{
		next(err);
	});
});

router.post('/',(req,res,next)=>{
	var currentUser=req.user;
	var data=req.body;
	Promise.join(us.isAdmin(currentUser),ps.checkAttributes(['content','receivers'],null,data),(isAdmin,isGoodNoti)=>{
		if(!isAdmin) return next(genError(403,'Not permitted'));
		if(!isGoodNoti) return next(genError(400,'Something wrong within new notification'));
		if(!util.isArray(data.receivers)) return next(genError(400,'Receivers should be an array'));

		data=filtObject(['title','content','receivers'],data);
		data['sender']=currentUser;
		ns.publishNewNotification(data).then(()=>{
			res.sendStatus(200);
		},(err)=>{
			next(genError(400,err.message));
		});
	}).then(null,(err)=>{
		next(err);
	});
});