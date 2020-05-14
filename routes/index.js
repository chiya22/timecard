var express = require('express');
var router = express.Router();
const fs = require('fs');

const master = require('../util/master');
const time = require('../util/time');
const common = require('../util/common');

/* GET home page. */
router.get('/', function (req, res) {

  let ret = master.getUserList(1);
  let parttimeret = master.getUserList(2);
  res.render('index', {
    title: common.getYmdyoubi(),
    userlist: ret,
    parttimeuserlist: parttimeret,
  });

});

router.get('/time/:id', function (req, res) {

  let date = new Date();
  let ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);

  let ret = master.getUserList();
  ret.forEach((userinfo) => {
    if (userinfo.id === req.params.id) {
      let timeinfo = {};
      timeinfo = time.getTimedata(req.params.id, ymd);
      res.render('time', {
        title: common.getYmdyoubi(),
        ymd: ymd,
        user: userinfo,
        time: timeinfo,
      });
    }
  })

});

router.post('/time/start', function (req, res) {
  let ret = master.getUserList();
  ret.forEach((userinfo) => {
    if (userinfo.id === req.body.id) {

      let starttime = req.body.starttime;
      let endtime = req.body.endtime;
      let starttimeupd = req.body.starttimeupd;
      let endtimeupd = req.body.endtimeupd;

      let date = new Date();
      let timeinfo = {
        starttime: starttime,
        endtime: endtime,
        starttimeupd: starttimeupd,
        endtimeupd: endtimeupd,
      };

      //ファイルへ書き込む
      if (req.body.shorikubun === 'start') {
        if (starttime === '') {
          starttime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
          timeinfo = time.setTime(req.body.id, req.body.shorikubun, req.body.ymd, starttime);
        }
      } else {
        if (endtime === '') {
          endtime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
          timeinfo = time.setTime(req.body.id, req.body.shorikubun, req.body.ymd, endtime);
        }
      }

      res.render('time', {
        title: common.getYmdyoubi(),
        user: userinfo,
        ymd: req.body.ymd,
        time: timeinfo,
      });
    }
  })
});

module.exports = router;
