var express = require("express");
var router = express.Router();
const datadir = "./data";
const master = require("../util/master");
const time = require("../util/time");
const common = require("../util/common");
const hosei = require("../util/hosei");

const users = require("../model/users");
const hoseis = require("../model/hoseis");
const yyyymmdds = require("../model/yyyymmdds");

/*
初期画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get("/", function (req, res) {
  (async () => {
    const date = new Date();
    const yyyy_mm_dd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    const yyyymmdd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    const retObjAllUsers = await users.find();
    const retObjUsers = await users.findByKubunWithYyyymmddInfo(1, yyyymmdd);
    const retObjUsersParttime = await users.findByKubunWithYyyymmddInfo(2, yyyymmdd);
    const retObjHoseis = await hoseis.findUnCompleted();
    res.render("index", {
      title: yyyy_mm_dd + "(" + common.getYoubi(yyyymmdd) + ")",
      userlist: retObjUsers,
      parttimeuserlist: retObjUsersParttime,
      hoseilist: retObjHoseis,
      selectuserlist: retObjAllUsers,
    });
  })();
});

/*
管理者用の画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get("/admin", function (req, res) {
  (async () => {
    const date = new Date();
    const yyyy_mm_dd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    const yyyymmdd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    const retObjUsers = await users.findByKubunWithYyyymmddInfo(1, yyyymmdd);
    const retObjUsersParttime = await users.findByKubunWithYyyymmddInfo(2, yyyymmdd);
    res.render("admin", {
      title: yyyy_mm_dd + "(" + common.getYoubi(yyyymmdd) + ")",
      userlist: retObjUsers,
      parttimeuserlist: retObjUsersParttime,
    });
  })();
});

/*
指定されたユーザIDの出退勤入力画面を表示する
*/
router.get("/time/:id", function (req, res) {
  (async () => {
    let date = new Date();
    const yyyy_mm_dd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    const yyyymmdd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);

    const retObjUser = await users.findByUserIDWithYyyymmddInfo(req.params.id, yyyymmdd);
    res.render("time", {
      title: yyyy_mm_dd + "(" + common.getYoubi(yyyymmdd) + ")：" + retObjUser[0].name,
      yyyymmdd: yyyymmdd,
      user: retObjUser[0],
    });
  })();
});

/*
指定されたユーザIDの出退勤情報を登録・更新する
req.body.shorikubun　⇒　start：出勤、end：退勤
*/
router.post("/time/set", function (req, res) {
  (async () => {
    let inObjYyyymmdd = {};
    inObjYyyymmdd.id_users = req.body.id;
    inObjYyyymmdd.yyyymmdd = req.body.yyyymmdd;
    inObjYyyymmdd.yyyymm_seisan = common.getYyyymmSeisan(req.body.yyyymmdd);

    const date = new Date();
    const timevalue = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

    // 出勤ボタンを押した場合
    if (req.body.shorikubun === "start") {
      inObjYyyymmdd.time_start = timevalue;
      const retObjUserInsert = await yyyymmdds.insert(inObjYyyymmdd);
      // 退勤ボタンを押した場合
    } else {
      inObjYyyymmdd.time_start = req.body.time_start;
      inObjYyyymmdd.time_end = timevalue;
      inObjYyyymmdd.time_pay = common.getPaytime(inObjYyyymmdd.time_start, inObjYyyymmdd.time_end, "0000");
      const retObjUserUpdate = await yyyymmdds.update(inObjYyyymmdd);
    }
    res.redirect("/");
  })();
});

/*
指定された補正情報を登録する
*/
router.post("/hosei/add", function (req, res) {
  (async () => {
    const date = new Date();
    const yyyymmdd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);

    let inObjHosei = {};
    inObjHosei.ymd_irai = yyyymmdd;
    inObjHosei.id_users = req.body.id;
    inObjHosei.ymd_target = req.body.ymd_target.slice(0, 4) + req.body.ymd_target.slice(5, 7) + req.body.ymd_target.slice(-2);
    inObjHosei.message = req.body.message;
    const retObjHosei = await hoseis.insert(inObjHosei);
    res.redirect("/");
  })();
});

/*
指定したユーザIDの実績が存在する年月（精算）を取得する
*/
router.get("/admin/:id", function (req, res) {
  (async () => {
    const date = new Date();
    const yyyy_mm_dd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    const yyyymmdd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    const retObjYyyymm = await yyyymmdds.findYyyymmInfoByUserId(req.params.id);
    const retObjUser = await users.findPKey(req.params.id);
    res.render("month", {
      title: "管理者：" + yyyy_mm_dd + "(" + common.getYoubi(yyyymmdd) + ") ：" + retObjUser[0].name,
      user: retObjUser[0],
      yyyymmlist: retObjYyyymm,
    });
  })();
});

/*
指定されたユーザIDの指定された年月の実績を表示する
*/
router.get("/admin/:id/:yyyymm", function (req, res) {
  (async () => {
    const retObjUser = await users.findPKey(req.params.id);
    const yyyymmdd_start = common.getBeforeMonthYyyymm(req.params.yyyymm) + "16";
    const yyyymmdd_end = req.params.yyyymm + "15";
    let timelist = common.getInitialTimeListAll(req.params.id, yyyymmdd_start, yyyymmdd_end);
    const timelistJisseki = await yyyymmdds.findByIntervalAndUserid(yyyymmdd_start, yyyymmdd_end, req.params.id);

    timelistJisseki.forEach((timeJisseki) => {
      timelist.forEach((time) => {
        if (time.yyyymmdd === timeJisseki.yyyymmdd) {
          time.time_start = timeJisseki.time_start ? timeJisseki.time_start : null;
          time.time_start_upd = timeJisseki.time_start_upd ? timeJisseki.time_start_upd : null;
          time.time_end = timeJisseki.time_end ? timeJisseki.time_end : null;
          time.time_end_upd = timeJisseki.time_end_upd ? timeJisseki.time_end_upd : null;
          time.time_rest = timeJisseki.time_rest ? timeJisseki.time_rest : null;
          time.time_pay = timeJisseki.time_pay ? timeJisseki.time_pay : null;
        }
      });
    });

    res.render("monthtime", {
      title: "管理者：" + req.params.yyyymm.slice(0, 4) + "年" + req.params.yyyymm.slice(-2) + "月：" + retObjUser[0].name,
      yyyymm: req.params.yyyymm,
      userinfo: retObjUser[0],
      timelist: timelist,
    });
  })();
});

/*
指定されたユーザIDの指定された年月の実績を更新する
*/
router.post("/admin/:id/:yyyymm", (req, res) => {
  const id = req.params.id;
  const yyyymm = req.params.yyyymm;
  const yyyymmddlist = req.body.yyyymmdd;
  const yyyymm_seisan_list = req.body.yyyymm_seisan;
  const time_start_list = req.body.time_start;
  const time_startupd_list = req.body.time_start_upd;
  const time_end_list = req.body.time_end_upd;
  const time_endupd_list = req.body.time_end_upd;
  const time_restlist = req.body.time_rest;
  // const time_paytlist = req.body.time_pay;

  (async () => {
    let inObjYyyyymmdds = {};
    let retObjYyyymmdds = {};
    let retObjtime = {};
    let retObj = {};

    for (let i = 0; i < yyyymmddlist.length; i++) {
      // 支払時間を求める
      // 開始時刻、開始時刻（更新）、終了時刻、終了時刻（更新）のいずれかに値が設定されている場合
      if (time_start_list[i] !== "" || time_startupd_list[i] !== "" || time_end_list[i] !== "" || time_endupd_list[i] !== "") {
        retObjtime = common.getStartEndTime(time_start_list[i], time_end_list[i], time_startupd_list[i], time_endupd_list[i]);
        let time_pay = common.getPaytime(retObjtime.time_start, retObjtime.time_end, time_restlist[i]);

        // 明細情報の設定
        inObjYyyyymmdds.id_users = id;
        inObjYyyyymmdds.yyyymmdd = yyyymmddlist[i];
        inObjYyyyymmdds.yyyymm_seisan = yyyymm_seisan_list[i];
        inObjYyyyymmdds.time_start = time_start_list[i] ? ("0" + time_start_list[i].replace(":", "")).slice(-2) : time_start_list[i];
        inObjYyyyymmdds.time_start_upd = time_startupd_list[i] ? ("0" + time_startupd_list[i].replace(":", "")).slice(-2) : time_startupd_list[i];
        inObjYyyyymmdds.time_end = time_end_list[i] ? ("0" + time_end_list[i].replace(":", "")).slice(-2) : time_end_list[i];
        inObjYyyyymmdds.time_end_upd = time_endupd_list[i] ? ("0" + time_endupd_list[i].replace(":", "")).slice(-2) : time_endupd_list[i];
        inObjYyyyymmdds.time_rest = time_restlist[i] ? ("0" + time_restlist[i].replace(":", "")).slice(-2) : time_restlist[i];
        inObjYyyyymmdds.time_pay = time_pay;

        retObjYyyymmdds = await yyyymmdds.findPKey(id, yyyymmdd[i]);
        if (retObjYyyymmdds) {
          retObj = await yyyymmdds.update(inObj);
        } else {
          retObj = await yyyymmdds.insert(inObj);
        }
      }
    }
  })();

  res.redirect("/admin/" + id + "/" + yyyymm);
});

router.post("/admin/download", function (req, res) {
  const yyyymm = req.body.target_yyyymm;
  const userinfo = getUserListWithTime();

  let csv = "";

  userinfo.forEach((user) => {
    let timeinfolist = time.getMonthdata(user.id, yyyymm);
    if (timeinfolist) {
      for (let i = 0; i < timeinfolist.length; i++) {
        csv +=
          user.id +
          "," +
          timeinfolist[i].yyyymmdd +
          "," +
          timeinfolist[i].start +
          "," +
          timeinfolist[i].end +
          "," +
          timeinfolist[i].startupd +
          "," +
          timeinfolist[i].endupd +
          "," +
          timeinfolist[i].resttime +
          "," +
          timeinfolist[i].makanai +
          "," +
          timeinfolist[i].asaoso +
          "," +
          timeinfolist[i].paytime +
          "\r\n";
      }
    }
  });

  res.setHeader("Content-disposition", "attachment; filename=data.csv");
  res.setHeader("Content-Type", "text/csv; charset=UTF-8");

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
      id: user.id,
      name: user.name,
      kubun: user.kubun,
      starttime: timeinfo.starttime,
      endtime: timeinfo.endtime,
    });
  });
  return ret;
};

function checkTimeList(timelist) {
  isError = false;
  const pattern = /^\d{2}$/;
  timelist.forEach((time) => {
    if (time !== "") {
      let arr = time.split(":");
      if (arr.length === 2) {
        if (!pattern.test(arr[0])) {
          isError = true;
        }
      } else {
        isError = true;
      }
    }
  });
  return isError;
}

module.exports = router;
