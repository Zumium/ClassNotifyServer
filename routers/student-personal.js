var express=require('express');
var us=require('../userservice');

var router=exports.router=express.Router();

router.get('/',(req,res)=>{
	var queriedUser=req.params.sid;
	us.getStudentInfo(queriedUser).then((student)=>{
		res.json(student.dataValues);
	},(err)=>{
		res.status(400).json({message:err.message});
	});
});
