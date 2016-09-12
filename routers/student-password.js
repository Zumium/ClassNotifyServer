var Promise=require('bluebird');
var _=require('underscore');
var express=require('express');
var util=require('util');
var us=require('../services/userservice');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

//========================================
// 这是处理 /users/:sid/password 的中间件
//========================================
//
//   {
//	"password":"新密码"
//   }
//
router.put('/:sid/password',(req,res,next)=>{
	if(req.user!=req.params.sid)
		return next(genError(403,'Not permitted'));
	if(!util.isString(req.body.password))
		return next(genError(400,'Must have \'password\' key or the content must be a string'));

	us.changePassword(req.params.sid,req.body.password)
	.then(()=>{
		res.sendStatus(200);
	})
	.catch(next);
});
