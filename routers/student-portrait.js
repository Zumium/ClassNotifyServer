var pts=require('../services/portraitservice');
var genError=require('../tools/gene-error');
var passport=require('passport');
var express=require('express');

var router=module.exports=express.Router();

//====================================================
//  /users/:sid/portrait
//====================================================
router.get('/:sid/portrait',
	pts.init(),
	(req,res,next)=>{
		pts.getPortrait(req.params.sid,res)
			.then(()=>{
				res.sendStatus(200);
			})
			.catch(next);
	}
);

router.put('/:sid/portrait',
	passport.authenticate('basic',{session:false}),
	pts.init(),
	(req,res,next)=>{
		if(req.user!=req.params.sid)
			return next(genError('403','Not permitted'));
		pts.setPortrait(req.params.sid,req)
			.then(()=>{
				res.sendStatus(200);
			})
			.catch(next);
	}
);
