var express = require('express');
var router = express.Router();
const datadir = './data';
const master = require('../util/master');
const time = require('../util/time');
const common = require('../util/common');

/*
初期画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get('/', function (req, res) {

  const date = new Date();
  yyyy_mm_dd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
  let ret = master.getUserList(1);
  ret.forEach((user) => {
    common.createInitailFile(datadir, user.id, yyyy_mm_dd)
  })
  let parttimeret = master.getUserList(2);
  parttimeret.forEach((user) => {
    common.createInitailFile(datadir, user.id, yyyy_mm_dd)
  })
  
  res.render('index', {
    title: common.getYmdyoubi(new Date()),
    userlist: ret,
    parttimeuserlist: parttimeret,
  });

});

/*
管理者用の画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get('/admin', function (req, res) {

  let ret = master.getUserList(1);
  let parttimeret = master.getUserList(2);
  res.render('admin', {
    title: "管理者：" + common.getYmdyoubi(new Date()),
    userlist: ret,
    parttimeuserlist: parttimeret,
  });

});

/*
指定されたユーザIDの出退勤入力画面を表示する
すでに出勤、退勤時刻の入力がある場合は、その値を出力する
*/
router.get('/time/:id', function (req, res) {

  let date = new Date();
  let ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);

  let ret = master.getUserList();
  ret.forEach((userinfo) => {
    if (userinfo.id === req.params.id) {
      let timeinfo = {};
      timeinfo = time.getTimedata(req.params.id, ymd);
      res.render('time', {
        title: common.getYmdyoubi(new Date()) + "：" + userinfo.name,
        ymd: ymd,
        user: userinfo,
        time: timeinfo,
      });
    }
  })

});

/*
YYYYMMDDファイルに現在の時間を書き込む
req.body.shorikubun　⇒　start：出勤、end：退勤
*/
router.post('/time/set', function (req, res) {
  let ret = master.getUserList();
  ret.forEach((userinfo) => {
    if (userinfo.id === req.body.id) {

      let starttime = req.body.starttime;
      let endtime = req.body.endtime;

      let date = new Date();
      let timeinfo = {
        starttime: starttime,
        endtime: endtime,
      };

      //ファイルへ書き込む
      if (req.body.shorikubun === 'start') {
        if (starttime === '出勤') {
          starttime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
          timeinfo = time.setTime(req.body.id, req.body.shorikubun, req.body.ymd, starttime);
        }
      } else {
        if (endtime === '退勤') {
          endtime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
          timeinfo = time.setTime(req.body.id, req.body.shorikubun, req.body.ymd, endtime);
        }
      }

      res.render('time', {
        title: common.getYmdyoubi(new Date()) + "：" + userinfo.name,
        user: userinfo,
        ymd: req.body.ymd,
        time: timeinfo,
      });
    }
  })
});

/*
指定したユーザIDの実績が存在するYYYYMMファイルのファイル名リストを取得し表示する
*/
router.get('/admin/:id', function (req, res) {

  let date = new Date();
  let yyyymm = common.getTargetYYYYMM(date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2));

  let ret = master.getUserList();
  ret.forEach((userinfo) => {
    if (userinfo.id === req.params.id) {
      res.render('month', {
        title: "管理者：" + common.getYmdyoubi(new Date()) + "：" + userinfo.name,
        ym: yyyymm,
        user: userinfo,
        yyyymmlist: common.readDirSync(datadir + "/" + userinfo.id),
      });
    }
  })
});

/*
指定されたユーザーIDの指定された年月の実績を返却する
*/
router.get('/admin/:id/:yyyymm', function (req, res) {

  const id = req.params.id;
  const yyyymm = req.params.yyyymm;
  const userinfo = master.getUser(id);
  const timelist = time.getMonthdata(id, yyyymm);
  res.render('monthtime', {
    title: "管理者：" + yyyymm.slice(0,4) + "年" + yyyymm.slice(-2) + "月：" + userinfo.name,
    yyyymm: yyyymm,
    userinfo: userinfo,
    timelist: timelist,
  });
})

module.exports = router;
