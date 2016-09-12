var express=require('express');
var us=require('../services/userservice');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var genError=require('../tools/gene-error');
var filtObject=require('../tools/filt-object');

var router=module.exports=express.Router();

//====================================
//下面是操作/users/:sid路径的中间件
//====================================
router.get('/:sid',(req,res,next)=>{
	var queriedUser=req.params.sid=='self'?req.user:req.params.sid;
	us.getStudentInfo(queriedUser).then((student)=>{
		if(!student) throw genError(404,'No such student');
		res.json(student.get());
	}).catch(next);
});

/* 暂时封存此方法
router.patch('/:sid',(req,res,next)=>{
	var currentUser=req.user;
	var queriedUser=req.params.sid=='self'?currentUser:req.params.sid;
	var data=req.body;

	Promise.join(us.isAdmin(currentUser),ps.isOperateOnSelf(req,queriedUser),ps.checkAttributes(['name'],null,data),us.isCharacterValid(data.character),ps.checkAttributes(['password'],null,data),(isAdmin,isSelf,hasName,isCorrectCharacter,hasPassword)=>{
		//start to check
		if(hasName||isCorrectCharacter)
			if(!isAdmin) throw genError(403,'Not permitted');
		if(hasPassword)
			if(!isSelf) throw genError(403,'Not permitted');
		if(data.character && !isCorrectCharacter) throw genError(400,'Invalid character');
		//end check
		//start to patch
		return us.getStudentInfo(queriedUser);
	}).then((student)=>{
		if(!student) throw genError(404,'No such student');
		return student.update(filtObject(['name','character','password'],data));
	}).then(()=>{
		res.sendStatus(200);
	}).catch(next);
});
*/

router.delete('/:sid',(req,res,next)=>{
	var currentUser=req.user;
	var queriedUser=req.params.sid=='self'?currentUser:req.params.sid;

	Promise.join(us.isAdmin(currentUser),(isAdmin)=>{
		if(!isAdmin) throw genError(403,'Not permitted');
		return us.getStudentInfo(queriedUser);
	}).then((student)=>{
		if(!student) throw genError(404,'No such student');
		return student.destroy();
	}).then(()=>{
		res.sendStatus(200);
	}).catch(next);
});
