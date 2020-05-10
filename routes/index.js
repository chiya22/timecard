var express = require('express');
var router = express.Router();
const fs = require('fs');

const master = require('../util/master');

/* GET home page. */
router.get('/', function (req, res) {

  let ret = master.getUserList();
  res.render('index', {
    title: 'Express',
    userlist: ret,
  });

});

router.get('/time/:id', function(req,res){

  let ret = master.getUserList();
  ret.forEach( (userinfo) => {
    if (userinfo.id === req.params.id){
      res.render('time', {
        title: 'Express',
        user: userinfo,
        starttime: null,
        endtime: null,
      });
    }
  })

});

router.post('/time/start', function(req,res){
  let ret = master.getUserList();
  ret.forEach( (userinfo) => {
    if (userinfo.id === req.body.id){

      let starttime = req.body.starttime;
      let endtime = req.body.endtime;

      //ファイルへ書き込む
      if (req.body.kubun === 'start'){
        starttime = '08:30:00';
      }else{
        endtime = '08:30:00';
      }

      res.render('time', {
        title: 'Express',
        user: userinfo,
        starttime: starttime,
        endtime: endtime,
      });
    }
  })
});

module.exports = router;
