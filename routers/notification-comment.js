var express=require('express');
var Promise=require('bluebird');
var util=require('util');
var cs=require('../services/commentservice');
var us=require('../services/userservice');
var ns=require('../services/notiservice');
var filtObject=require('../tools/filt-object');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

router.get('/:nid/comments',(req,res,next)=>{	
	ns.notificationExists(req.params.nid)
	.then((isExist)=>{
		if(!isExist)
			throw genError(404,'No such notification');
		return cs.getComments(req.params.nid);
	})
	.then((comments)=>{
		return us.replaceUserIdToInfo(comments.map((each)=>each.toJSON()),'sender');
	})
	.then((comments)=>{
		res.status(200).json(comments);
	})
	.catch(next);
});

router.post('/:nid/comments',(req,res,next)=>{
	if(!util.isString(req.body.comment))
		return next(genError(400,'Must have \'comment\' key and it must be a string'));

	ns.notificationExists(req.params.nid)
	.then((isExist)=>{
		if(!isExist)
			throw genError(404,'No such notification');
		return cs.appendComment({comment:req.body.comment,sender:req.user,notificationId:req.params.nid});
	})
	.then(()=>{
		res.sendStatus(201);
	})
	.catch(next);
});
