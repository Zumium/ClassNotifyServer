var us=require('../userservice');
var ns=require('../notiservice');
var express=require('express');

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
