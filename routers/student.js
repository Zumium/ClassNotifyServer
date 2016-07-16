var express=require('express');

var studentPerson=require('./student-person');
var studentSid=require('./student-sid');
var studentNotification=require('./student-noti');

var router=module.exports=express.Router();

//====================================
router.use('/',studentPerson); // url=/
//====================================
router.use('/',studentSid);    // url=/:sid
//=============================================
router.get('/',studentNotification); // url=/:sid/notifications
