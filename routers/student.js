var express=require('express');

var studentPerson=require('./student-person');
var studentSid=require('./student-sid');
var studentNotification=require('./student-noti');

var router=module.exports=express.Router();

//=============================================
router.get('/',studentNotification); // url=/:sid/notifications
//====================================
router.use('/',studentSid);    // url=/:sid
//====================================
router.use('/',studentPerson); // url=/
