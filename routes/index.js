var express = require('express');
var router = express.Router();
const fs = require('fs');

const master = require('../util/master');

/* GET home page. */
router.get('/', function (req, res) {

  let ret = master.getUserList(1);
  let parttimeret = master.getUserList(2);
  res.render('index', {
    title: 'Express',
    userlist: ret,
    parttimeuserlist: parttimeret,
  });

});

router.get('/time/:id', function(req,res){

  let date = new Date();
  let ymd = date.getFullYear() + "/" + ("0" + date.getMonth()).slice(-2) + "/" + ("0"+ date.getDay()).slice(-2);

  let ret = master.getUserList();
  ret.forEach( (userinfo) => {
    if (userinfo.id === req.params.id){
      res.render('time', {
        title: 'Express',
        user: userinfo,
        ymd:ymd,
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


      let date = new Date();

      //ファイルへ書き込む
      if (req.body.kubun === 'start'){
        if (starttime === '') {
          starttime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
        }
      }else{
        if (endtime === ''){
          endtime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
        }
      }

      res.render('time', {
        title: 'Express',
        user: userinfo,
        ymd: req.body.ymd,
        starttime: starttime,
        endtime: endtime,
      });
    }
  })
});

module.exports = router;
