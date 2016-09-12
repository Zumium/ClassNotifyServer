var express=require('express');

var studentPerson=require('./student-person');
var studentSid=require('./student-sid');
var studentNotification=require('./student-noti');
var studentPortrait=require('./student-portrait');
var studentPassword=require('./student-password');

var router=module.exports=express.Router();

//=============================================
router.use('/',studentNotification); // url=/:sid/notifications
//====================================
router.use('/',studentPortrait); // url=/:sid/portrait
//====================================
router.use('/',studentPassword); // url=/:sid/password
//====================================
router.use('/',studentSid);    // url=/:sid
//====================================
router.use('/',studentPerson); // url=/
