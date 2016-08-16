var express=require('express');

var notificationRoot=require('./notification-root');
var notificationNid=require('./notification-nid');
var notificationStatus=require('./notification-status');
var notificationComment=require('./notification-comment');

var router=module.exports=express.Router();
//=============================================
router.use('/',notificationStatus);// url=/:nid/status
//=============================================
router.use('/',notificationComment); //url=/:nid/comments
//=============================================
router.use('/',notificationNid);  // url=/:nid
//=============================================
router.use('/',notificationRoot); // url=/
