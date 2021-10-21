var express = require('express');
var router = express.Router();
const datadir = './data';
const master = require('../util/master');
const time = require('../util/time');
const common = require('../util/common');
const hosei = require('../util/hosei');

/*
初期画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get('/', function (req, res) {

  const date = new Date();
  yyyy_mm_dd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
  let ret = getUserListWithTime(1);
  ret.forEach((user) => {
    time.createInitailFile(datadir, user.id, yyyy_mm_dd)
  })
  let parttimeret = getUserListWithTime(2);
  parttimeret.forEach((user) => {
    time.createInitailFile(datadir, user.id, yyyy_mm_dd)
  })

  let hoseilist = hosei.getHoseiList('wait');

  let userlist = getUserListWithTime();

  res.render('index', {
    title: common.getYmdyoubi(new Date()),
    userlist: ret,
    parttimeuserlist: parttimeret,
    hoseilist: hoseilist,
    selectuserlist: userlist,
  });

});

/*
管理者用の画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get('/admin', function (req, res) {

  let ret = getUserListWithTime(1);
  let parttimeret = getUserListWithTime(2);
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

  let ret = getUserListWithTime();
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
指定されたユーザIDの出退勤情報を登録する
YYYYMMDDファイルに現在の時間を書き込む
req.body.shorikubun　⇒　start：出勤、end：退勤
*/
router.post('/time/set', function (req, res) {
  let ret = getUserListWithTime();
  ret.forEach((userinfo) => {
    if (userinfo.id === req.body.id) {

      let starttime = req.body.starttime;
      let endtime = req.body.endtime;

      const date = new Date();
      let timeinfo = {
        starttime: starttime,
        endtime: endtime,
      };

      // 日付を
      const ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);

      //ファイルへ書き込む
      if (req.body.shorikubun === 'start') {
        if (starttime === '出勤') {
          starttime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2);
          timeinfo = time.setTime(req.body.id, req.body.shorikubun, ymd, starttime);
        }
      } else {
        if (endtime === '退勤') {
          endtime = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2);
          timeinfo = time.setTime(req.body.id, req.body.shorikubun, ymd, endtime);
        }
      }
      
      res.redirect('/');

      // res.render('time', {
      //   title: common.getYmdyoubi(new Date()) + "：" + userinfo.name,
      //   user: userinfo,
      //   ymd: req.body.ymd,
      //   time: timeinfo,
      // });
    }
  })
});

/*
指定された補正情報を登録する
*/
router.post('/hosei/add', function (req, res) {
  let user = master.getUser(req.body.id);
  let inObj = {};
  inObj.id = user.id;
  const date = req.body.targetdate
  inObj.targetdate = date.slice(0, 4) + date.slice(5, 7) + date.slice(-2);
  inObj.content = req.body.content;
  hosei.addHosei(inObj);
  res.redirect('/');
});

/*
指定したユーザIDの実績が存在するYYYYMMファイルの
ファイル名リストを取得し表示する
*/
router.get('/admin/:id', function (req, res) {

  let date = new Date();
  let yyyymm = common.getTargetYYYYMM(date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2));

  let ret = getUserListWithTime();
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
指定されたユーザIDの指定された年月の実績を表示する
*/
router.get('/admin/:id/:yyyymm', function (req, res) {

  const id = req.params.id;
  const yyyymm = req.params.yyyymm;
  const userinfo = master.getUser(id);
  const timelist = time.getMonthdata(id, yyyymm);
  res.render('monthtime', {
    title: "管理者：" + yyyymm.slice(0, 4) + "年" + yyyymm.slice(-2) + "月：" + userinfo.name,
    yyyymm: yyyymm,
    userinfo: userinfo,
    timelist: timelist,
  });
});

/*
指定されたユーザIDの指定された年月の実績を更新する
*/
router.post('/admin/:id/:yyyymm', function (req, res) {

  const id = req.params.id;
  const yyyymm = req.params.yyyymm;
  const yyyymmddlist = req.body.yyyymmdd;
  const startlist = req.body.start;
  const startupdlist = req.body.startupd;
  const endlist = req.body.end;
  const endupdlist = req.body.endupd;
  const resttimelist = req.body.resttime;
  const makanailist = req.body.makanai;
  const asaosolist = req.body.asaoso;
  const paytimelist = req.body.paytime;

  let isError = false;

  let tmp;
  startupdlist.forEach(startupd => {
    if (startupd !== '') {
      tmp = startupd.split(":")
      if (tmp.length === 2) {

      } else {
        isError = true;
      }
    }
  });

  //入力チェック
  // if (!checkTimeList(startupdlist)) {
  //   if (!checkTimeList(endupdlist)) {
  //     if (!checkTimeList(resttimelist)) {
        time.updTime(id, yyyymm, yyyymmddlist, startlist, endlist, startupdlist, endupdlist, resttimelist, makanailist, asaosolist, paytimelist);
  //     }
  //   }
  // }

  //TODO 入力チェックがエラーの場合はエラーメッセージを格納する
  //TODO 入力チェックがエラーの場合は、エラー内容のリストをそのまま返却する

  const userinfo = master.getUser(id);
  const timelist = time.getMonthdata(id, yyyymm);

  res.render('monthtime', {
    title: "管理者：" + yyyymm.slice(0, 4) + "年" + yyyymm.slice(-2) + "月：" + userinfo.name,
    yyyymm: yyyymm,
    userinfo: userinfo,
    timelist: timelist,
  });

});

router.post('/admin/download', function (req, res) {

  const yyyymm = req.body.target_yyyymm;
  const userinfo = getUserListWithTime();

  let csv = '';

  userinfo.forEach((user) => {
    let timeinfolist = time.getMonthdata(user.id, yyyymm);
    if (timeinfolist) {
      for (let i = 0; i < timeinfolist.length; i++) {
        csv += user.id + ',' + timeinfolist[i].yyyymmdd + ',' + timeinfolist[i].start + ',' + timeinfolist[i].end + ',' + timeinfolist[i].startupd + ',' + timeinfolist[i].endupd + ',' + timeinfolist[i].resttime + ',' + timeinfolist[i].makanai + ',' + timeinfolist[i].asaoso + ',' + timeinfolist[i].paytime + '\r\n';
      }
    }
  });

  res.setHeader('Content-disposition', 'attachment; filename=data.csv');
  res.setHeader('Content-Type', 'text/csv; charset=UTF-8');

  res.send(csv);
  // res.redirect(req.baseUrl + '/admin');

});

const getUserListWithTime = (kubun) => {

  // ユーザ情報の取得
  let userlist = master.getUserList(kubun);

  const date = new Date();
  const ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);

  let ret = [];

  // 時間情報の付与
  userlist.forEach((user) => {
    let timeinfo = time.getTimedata(user.id, ymd);
    ret.push({
      'id': user.id,
      'name': user.name,
      'kubun': user.kubun,
      'starttime': timeinfo.starttime,
      'endtime': timeinfo.endtime,
    })
  });
  return ret;
}



function checkTimeList(timelist) {
  isError = false;
  const pattern = /^\d{2}$/;
  timelist.forEach(time => {
    if (time !== '') {
      let arr = time.split(":");
      if (arr.length === 2) {
        if (!pattern.test(arr[0])) {
          isError = true;
        };
      }else{
        isError = true;
      }
    }
  })
  return isError;
}

module.exports = router;
