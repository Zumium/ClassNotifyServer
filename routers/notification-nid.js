var us=require('../services/userservice');
var ns=require('../services/notiservice');
var express=require('express');
var Promise=require('bluebird');
var util=require('util');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

router.get('/:nid',(req,res,next)=>{
	var queriedNotification=req.params.nid;
	ns.getNotificationById(queriedNotification).then((notification)=>{
		if(!notification) return next(genError(404,'No such notification'));
		res.status(200).json(notification.get());
	},(err)=>{
		next(err);
	});
});

router.delete('/:nid',(req,res,next)=>{
	var currentUser=req.user;
	var queriedNotification=req.params.nid;
	Promise.join(us.isAdmin(currentUser),(isAdmin)=>{
		if(!isAdmin) return next(genError(403,'Not permitted'));
		ns.getNotificationById(queriedNotification).then((notification)=>{
			if(!notification) return next(genError(404,'No such notification'));
			notification.destroy().then(()=>{
				res.sendStatus(200);
			},(err)=>{
				next(err);
			});
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});
