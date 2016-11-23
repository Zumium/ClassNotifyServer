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
		if(!notification) throw genError(404,'No such notification');
		return us.replaceUserIdToInfo(notification.get(),'sender');
	}).then((notification)=>{
		res.status(200).json(notification);
	}).catch(next);
});

router.delete('/:nid',(req,res,next)=>{
	var currentUser=req.user;
	var queriedNotification=req.params.nid;

	Promise.join(us.isAdmin(currentUser),isAdmin=>{
		if(!isAdmin) throw genError(403,'Not permitted');
		return ns.getNotificationById(queriedNotification);
	}).then(queriedNotification=>{
		if(!queriedNotification) throw genError(404,'No such notification');
		return queriedNotification.destroy();
	}).then(()=>{
		res.sendStatus(200);
	}).catch(next);
});
