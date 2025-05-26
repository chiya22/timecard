const express = require('express');
const router = express.Router();
const common = require('../util/common');
const sendmail = require('../util/sendmail');
const users = require('../model/users');
const hoseis = require('../model/hoseis');
const yyyymmdds = require('../model/yyyymmdds');
const yyyymmdds_enso = require('../model/yyyymmdds_enso');
const yyyymmdds_suido = require('../model/yyyymmdds_suido');
const log4js = require('log4js');
const logger = log4js.configure('./config/log4js-config.json').getLogger();

/*
初期画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get('/', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const retObjAllUsers = await users.find();
  const retObjUsers = await users.findByKubunWithYyyymmddInfo(1, yyyymmdd, yyyymmdd);
  const retObjUsersParttime = await users.findByKubunWithYyyymmddInfo(2, yyyymmdd, yyyymmdd);
  const retObjHoseis = await hoseis.findAll();
  res.render('index', {
    title: `${yyyy_mm_dd}(${common.getYoubi(yyyymmdd)})`,
    userlist: retObjUsers,
    parttimeuserlist: retObjUsersParttime,
    hoseilist: retObjHoseis,
    selectuserlist: retObjAllUsers,
  });
});

/*
管理者用の画面を表示する
登録されているユーザーの一覧を表示する
*/
router.get('/admin', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const retObjUsers = await users.findByKubunWithYyyymmddInfo(1, '19900101', yyyymmdd);
  const retObjUsersParttime = await users.findByKubunWithYyyymmddInfo(2, '19900101', yyyymmdd);
  const retObjHosei = await hoseis.findAll();
  res.render('admin', {
    title: `管理者：${yyyy_mm_dd}(${common.getYoubi(yyyymmdd)})`,
    userlist: retObjUsers,
    hoseilist: retObjHosei,
    parttimeuserlist: retObjUsersParttime,
  });
});

/*
指定されたユーザIDの出退勤入力画面を表示する
*/
router.get('/time/:id', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const retObjUser = await users.findByUserIDWithYyyymmddInfo(req.params.id, yyyymmdd);
  const yyyymm_seisan = common.getYyyymmSeisan(yyyymmdd);
  const timelistJisseki = await yyyymmdds.findByYyyymmSeisanAndUserid(yyyymm_seisan, req.params.id);
  for (const timeJisseki of timelistJisseki) {
    timeJisseki.youbi = common.getYoubi(timeJisseki.yyyymmdd);
  }
  res.render('time', {
    title: `${yyyy_mm_dd}(${common.getYoubi(yyyymmdd)})：${retObjUser[0].name}`,
    yyyymmdd: yyyymmdd,
    user: retObjUser[0],
    timelist: timelistJisseki,
  });
});

/*
指定されたユーザIDの出退勤情報を登録・更新する
req.body.shorikubun⇒start：出勤、end：退勤
*/
router.post('/time/set', async (req, res) => {
  const inObjYyyymmdd = {};
  inObjYyyymmdd.id_users = req.body.id;
  inObjYyyymmdd.yyyymmdd = req.body.yyyymmdd;
  inObjYyyymmdd.yyyymm_seisan = common.getYyyymmSeisan(req.body.yyyymmdd);

  const date = new Date();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const timevalue = `${hh}${min}`;

  let action;
  // 出勤ボタンを押した場合
  if (req.body.shorikubun === 'start') {
    inObjYyyymmdd.time_start = timevalue;
    inObjYyyymmdd.time_end = req.body.time_end;
    inObjYyyymmdd.time_start_upd = req.body.time_start_upd;
    inObjYyyymmdd.time_end_upd = req.body.time_end_upd;
    await yyyymmdds.insert(inObjYyyymmdd);
    action = '出勤';

    // 退勤ボタンを押した場合
  } else if (req.body.shorikubun === 'end') {
    inObjYyyymmdd.time_start = req.body.time_start;
    inObjYyyymmdd.time_end = timevalue;
    inObjYyyymmdd.time_start_upd = req.body.time_start_upd;
    inObjYyyymmdd.time_end_upd = req.body.time_end_upd;
    const start = inObjYyyymmdd.time_start_upd ? inObjYyyymmdd.time_start_upd : inObjYyyymmdd.time_start;
    const end = inObjYyyymmdd.time_end_upd ? inObjYyyymmdd.time_end_upd : inObjYyyymmdd.time_end;
    inObjYyyymmdd.time_pay = common.getPaytime(start, end, '0000');
    inObjYyyymmdd.makanai = req.body.makanai;
    await yyyymmdds.update(inObjYyyymmdd);
    action = '退勤';
    // 有給休暇ボタンを押した場合
  } else {
    inObjYyyymmdd.isYuukyuu = 1;
    await yyyymmdds.insert(inObjYyyymmdd);
    action = '有給休暇';
  }

  const retObjUser = await users.findPKey(req.body.id);
  if (retObjUser[0].kubun === '2') {
    const title = `【出退勤管理：${retObjUser[0].name}】${action}`;
    sendmail.send(
      title,
      `${req.body.yyyymmdd.slice(0, 4)}年${req.body.yyyymmdd.slice(4, 6)}月${req.body.yyyymmdd.slice(6, 8)}日 ${hh}時${min}分 『${retObjUser[0].name}』が${action}しました。`
    );
    logger.info(`メール送信しました：【${action}】${req.body.id}`);
  }

  res.redirect('/');
});

/*
指定された補正情報を登録する
*/
router.post('/hosei/add', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyymmdd = `${yyyy}${mm}${dd}`;

  const inObjHosei = {};
  inObjHosei.ymd_irai = yyyymmdd;
  inObjHosei.id_users = req.body.id;
  inObjHosei.ymd_target = req.body.ymd_target.slice(0, 4) + req.body.ymd_target.slice(5, 7) + req.body.ymd_target.slice(-2);
  inObjHosei.message = req.body.message;
  inObjHosei.yyyymmddhhmmss_add = common.getTodayTime();
  await hoseis.insert(inObjHosei);
  res.redirect('/');
});

/*
指定されたキー情報をもとに補正情報を完了にする
*/
router.get('/admin/hosei/:key', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyymmdd = `${yyyy}${mm}${dd}`;

  const ymd_irai = req.params.key.split('_')[0];
  const id_users = req.params.key.split('_')[1];
  const ymd_target = req.params.key.split('_')[2];

  const retObjHosei = await hoseis.findPKey(ymd_irai, id_users, ymd_target);

  const inObjHosei = {};
  inObjHosei.ymd_irai = ymd_irai;
  inObjHosei.id_users = id_users;
  inObjHosei.ymd_target = ymd_target;
  inObjHosei.message = retObjHosei.message;
  inObjHosei.ymd_hosei = yyyymmdd;
  inObjHosei.id_users_hosei = 'yoshida';

  await hoseis.update(inObjHosei);
  res.redirect('/admin');
});
/*
指定したユーザIDの実績が存在する年月（精算）を取得する
*/
router.get('/admin/:id', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const retObjYyyymm = await yyyymmdds.findYyyymmInfoByUserId(req.params.id);
  const retObjUser = await users.findPKey(req.params.id);
  res.render('month', {
    title: `管理者：${yyyy_mm_dd}(${common.getYoubi(yyyymmdd)}) ：${retObjUser[0].name}`,
    user: retObjUser[0],
    yyyymmlist: retObjYyyymm,
  });
});

/**
 * ユーザ情報登録ボタンを押した場合
 */
router.get('/adminuseradd', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  res.render('userform', {
    title: `管理者：${yyyy_mm_dd}(${common.getYoubi(yyyymmdd)}) `,
    user: null,
  });
});

/**
 * ユーザー情報編集ボタンを押した場合
 */
router.get('/admin/userupdate/:id', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const retObjUser = await users.findPKey(req.params.id);
  res.render('userform', {
    title: `管理者：${yyyy_mm_dd}(${common.getYoubi(yyyymmdd)}) ：${retObjUser[0].name}`,
    user: retObjUser[0],
  });
});

/**
 * ユーザー情報を登録する
 */
router.post('/admin/insert', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyymmdd = `${yyyy}${mm}${dd}`;

  const inObjUser = {};
  inObjUser.yyyymmdd = yyyymmdd;

  inObjUser.id = req.body.id;
  inObjUser.name = req.body.name;
  inObjUser.kubun = req.body.kubun;
  inObjUser.ymd_start = req.body.ymd_start.replaceAll('/', '');
  inObjUser.ymd_end = req.body.ymd_end.replaceAll('/', '');
  inObjUser.ymd_upd = yyyymmdd;

  try {
    await users.insert(inObjUser);
    res.redirect('/admin');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/adminuseradd');
  }
});

/**
 * ユーザー情報を更新する
 */
router.post('/admin/update', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyymmdd = `${yyyy}${mm}${dd}`;

  const inObjUser = {};
  inObjUser.yyyymmdd = yyyymmdd;

  inObjUser.id = req.body.id;
  inObjUser.name = req.body.name;
  inObjUser.kubun = req.body.kubun;
  inObjUser.ymd_start = req.body.ymd_start.replaceAll('/', '');
  inObjUser.ymd_end = req.body.ymd_end.replaceAll('/', '');
  inObjUser.ymd_upd = yyyymmdd;

  res.redirect('/admin');
  try {
    await users.update(inObjUser);
    res.redirect('/admin');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admim/update/${inObjUser.id}`);
  }
});


/*
指定されたユーザIDの指定された年月の実績を表示する
*/
router.get('/admin/:id/:yyyymm', async (req, res) => {
  const retObjUser = await users.findPKey(req.params.id);
  const yyyymmdd_start = `${common.getBeforeMonthYyyymm(req.params.yyyymm)}16`;
  const yyyymmdd_end = `${req.params.yyyymm}15`;
  const timelist = common.getInitialTimeListAll(req.params.id, yyyymmdd_start, yyyymmdd_end);
  const timelistJisseki = await yyyymmdds.findByIntervalAndUserid(yyyymmdd_start, yyyymmdd_end, req.params.id);
  timelist.totalpayday = 0;
  timelist.totalpayhh = 0;
  timelist.totalpaymm = 0;
  for (const timeJisseki of timelistJisseki) {
    for (const time of timelist) {
      if (time.yyyymmdd === timeJisseki.yyyymmdd) {
        time.time_start = timeJisseki.time_start ? timeJisseki.time_start : null;
        time.time_start_upd = timeJisseki.time_start_upd ? timeJisseki.time_start_upd : null;
        time.time_end = timeJisseki.time_end ? timeJisseki.time_end : null;
        time.time_end_upd = timeJisseki.time_end_upd ? timeJisseki.time_end_upd : null;
        time.time_rest = timeJisseki.time_rest ? timeJisseki.time_rest : null;
        time.time_pay = timeJisseki.time_pay ? timeJisseki.time_pay : null;
        time.makanai = timeJisseki.makanai ? timeJisseki.makanai : null;
        time.isYuukyuu = timeJisseki.isYuukyuu ? timeJisseki.isYuukyuu : null;
        if (time.time_start || time.time_start_upd) {
          timelist.totalpayday += 1;
        }
        if (time.time_pay) {
          timelist.totalpayhh += Number(time.time_pay.slice(0, 2));
          timelist.totalpaymm += Number(time.time_pay.slice(-2));
        }
      }
    }
  }

  timelist.totalpayhh += Number.parseInt(timelist.totalpaymm / 60, 10);
  timelist.totalpaymm = String(timelist.totalpaymm % 60).padStart(2, '0');

  res.render('monthtime', {
    title: `管理者：${req.params.yyyymm.slice(0, 4)}年${req.params.yyyymm.slice(-2)}月：${retObjUser[0].name}`,
    yyyymm: req.params.yyyymm,
    userinfo: retObjUser[0],
    timelist: timelist,
  });
});

/*
指定されたユーザIDの指定された年月の実績を更新する
*/
router.post('/admin/:id/:yyyymm', (req, res) => {
  const id = req.params.id;
  const yyyymm = req.params.yyyymm;
  const yyyymmddlist = req.body.yyyymmdd;
  const yyyymm_seisan_list = req.body.yyyymm_seisan;
  const time_start_list = req.body.time_start;
  const time_startupd_list = req.body.time_start_upd;
  const time_end_list = req.body.time_end;
  const time_endupd_list = req.body.time_end_upd;
  const time_restlist = req.body.time_rest;
  const makanailist = req.body.makanai;
  const isYuukyuulist = req.body.isYuukyuu;

  (async () => {
    const inObjYyyyymmdds = {};
    let retObjYyyymmdds = {};
    let retObjtime = {};

    for (let i = 0; i < yyyymmddlist.length; i++) {
      // 開始時刻、開始時刻（更新）、終了時刻、終了時刻（更新）、賄、有給のいずれかに値が設定されている場合、強制的に更新対象とする
      if (time_start_list[i] !== '' || time_startupd_list[i] !== '' || time_end_list[i] !== '' || time_endupd_list[i] !== '' || makanailist[i] !== '0' || isYuukyuulist[i] !== '0') {
        // 支払時間を求める
        let time_pay;
        if (time_start_list[i] !== '' || time_startupd_list[i] !== '' || time_end_list[i] !== '' || time_endupd_list[i] !== '') {
          retObjtime = common.getStartEndTime(time_start_list[i], time_end_list[i], time_startupd_list[i], time_endupd_list[i]);
          if (retObjtime.time_start && retObjtime.time_end) {
            time_pay = common.getPaytime(retObjtime.time_start, retObjtime.time_end, time_restlist[i]);
          }
        }

        // 明細情報の設定
        inObjYyyyymmdds.id_users = id;
        inObjYyyyymmdds.yyyymmdd = yyyymmddlist[i];
        inObjYyyyymmdds.yyyymm_seisan = yyyymm_seisan_list[i];

        if (isYuukyuulist[i] === '1') {
          inObjYyyyymmdds.time_start = null;
          inObjYyyyymmdds.time_start_upd = null;
          inObjYyyyymmdds.time_end = null;
          inObjYyyyymmdds.time_end_upd = null;
          inObjYyyyymmdds.time_rest = null;
          inObjYyyyymmdds.makanai = 0;
          inObjYyyyymmdds.isYuukyuu = isYuukyuulist[i];
          inObjYyyyymmdds.time_pay = null;
        } else {
          inObjYyyyymmdds.time_start = time_start_list[i] ? (`000${time_start_list[i].replace(':', '')}`).slice(-4) : null;
          inObjYyyyymmdds.time_start_upd = time_startupd_list[i] ? (`000${time_startupd_list[i].replace(':', '')}`).slice(-4) : null;
          inObjYyyyymmdds.time_end = time_end_list[i] ? (`000${time_end_list[i].replace(':', '')}`).slice(-4) : null;
          inObjYyyyymmdds.time_end_upd = time_endupd_list[i] ? (`000${time_endupd_list[i].replace(':', '')}`).slice(-4) : null;
          inObjYyyyymmdds.time_rest = time_restlist[i] ? (`000${time_restlist[i].replace(':', '')}`).slice(-4) : null;
          inObjYyyyymmdds.makanai = makanailist[i] ? makanailist[i] : 0;
          inObjYyyyymmdds.isYuukyuu = isYuukyuulist[i] ? isYuukyuulist[i] : 0;
          inObjYyyyymmdds.time_pay = time_pay ? time_pay : null;
        }

        retObjYyyymmdds = await yyyymmdds.findPKey(id, inObjYyyyymmdds.yyyymmdd);
        if (retObjYyyymmdds.length !== 0) {
          await yyyymmdds.update(inObjYyyyymmdds);
        } else {
          await yyyymmdds.insert(inObjYyyyymmdds);
        }
      } else {
        await yyyymmdds.remove(id, yyyymmddlist[i]);
      }
    }
    res.redirect(`/admin/${id}/${yyyymm}`);
  })();
});

/*
指定された年月の出退勤情報をダウンロードする
*/
router.post('/admin/download', (req, res) => {
  (async () => {
    const yyyymm = req.body.target_yyyymm.replace('/', '');

    const retObjForDownload = await yyyymmdds.download(yyyymm);

    // 最初のユーザーの1カ月配列
    const yyyymmdd_start = `${common.getBeforeMonthYyyymm(yyyymm)}16`;
    const yyyymmdd_end = `${yyyymm}15`;
    let timelist = common.getInitialTimeListAll(retObjForDownload[0].id_users, yyyymmdd_start, yyyymmdd_end);

    // keyの設定
    let key = '';
    let beforekey = retObjForDownload[0].id_users;

    // 出力用スタック領域
    let csv = '';

    for (const row of retObjForDownload) {
      key = row.id_users;
      if (beforekey !== key) {
        for (const timerow of timelist) {
          csv += `${timerow.id_users},${timerow.yyyymmdd},${timerow.time_start ? timerow.time_start : ''},${timerow.time_end ? timerow.time_end : ''},${timerow.time_start_upd ? timerow.time_start_upd : ''},${timerow.time_end_upd ? timerow.time_end_upd : ''},${timerow.time_rest ? timerow.time_rest : ''},${timerow.makanai ? timerow.makanai : ''},${timerow.isYuukyuu ? timerow.isYuukyuu : ''},${timerow.time_pay ? timerow.time_pay : ''}\r\n`;
        }
        timelist = common.getInitialTimeListAll(row.id_users, yyyymmdd_start, yyyymmdd_end);
        for (const time of timelist) {
          if (time.yyyymmdd === row.yyyymmdd) {
            time.time_start = row.time_start;
            time.time_start_upd = row.time_start_upd;
            time.time_end = row.time_end;
            time.time_end_upd = row.time_end_upd;
            time.time_rest = row.time_rest;
            time.makanai = row.makanai;
            time.isYuukyuu = row.isYuukyuu;
            time.time_pay = row.time_pay;
          }
        }
        beforekey = row.id_users;
      } else {
        for (const time of timelist) {
          if (time.yyyymmdd === row.yyyymmdd) {
            time.time_start = row.time_start;
            time.time_start_upd = row.time_start_upd;
            time.time_end = row.time_end;
            time.time_end_upd = row.time_end_upd;
            time.time_rest = row.time_rest;
            time.makanai = row.makanai;
            time.isYuukyuu = row.isYuukyuu;
            time.time_pay = row.time_pay;
          }
        }
      }
    }
    for (const timerow of timelist) {
      csv += `${timerow.id_users},${timerow.yyyymmdd},${timerow.time_start ? timerow.time_start : ''},${timerow.time_end ? timerow.time_end : ''},${timerow.time_start_upd ? timerow.time_start_upd : ''},${timerow.time_end_upd ? timerow.time_end_upd : ''},${timerow.time_rest ? timerow.time_rest : ''},${timerow.makanai ? timerow.makanai : ''},${timerow.isYuukyuu ? timerow.isYuukyuu : ''},${timerow.time_pay ? timerow.time_pay : ''}\r\n`;
    }

    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.status(200).send(csv);
  })();
});

/**
 * 水道メーター記入画面へ遷移
 */
router.get('/suido', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const suido = await yyyymmdds_suido.findLastRecord();
  if (suido.length === 0) {
    suido.metervalue = 0;
  }

  // 現在の日付を取得
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 月を取得（0から11）

  // 一か月前の日付を作成
  const lastMonth = month - 1;
  const lastdate = new Date(year, lastMonth, '1');
  const lastYear = lastdate.getFullYear();
  const displastMonth = String(lastdate.getMonth() + 1).padStart(2, '0');

  // 一か月前の水道記入履歴リストを取得
  const suidolist = await yyyymmdds_suido.findsFromLastMonthToCurrent(`${lastYear}${displastMonth}`);

  res.render('suido', {
    title: `水道メーター：${yyyy_mm_dd}`,
    suido: suido[0],
    suidolist: suidolist,
  });
});

/**
 * 水道メーター登録時の処理
 */
router.post('/suido', async (req, res) => {
  const inObjSuido = {};
  inObjSuido.metervalue = req.body.metervalue;
  inObjSuido.yyyymmddhhmmss_add = common.getTodayTime();
  await yyyymmdds_suido.insert(inObjSuido);

  res.redirect('/');
});

/*
残留塩素濃度記入画面へ遷移
*/
router.get('/enso', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy_mm_dd = `${yyyy}/${mm}/${dd}`;
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const objEnso = await yyyymmdds_enso.findPKey(yyyymmdd);
  const objUsersList = await users.findByYyyymmdd(yyyymmdd);
  let enso = {};
  if (objEnso.length === 0) {
    enso = {
      yyyymmdd: yyyymmdds_enso.findPKey(`${yyyy}${mm}${dd}`),
      id_users: '',
      level: 0.3,
      color: '1',
      nigori: '0',
      nioi: '1',
      aji: '0',
      bikou: '0',
      yyyymmddhhmmss_add: '',
      yyyymmddhhmmss_upd: '',
    };
  } else {
    enso = objEnso[0];
  }
  res.render('enso', {
    userlist: objUsersList,
    title: `残留塩素：${yyyy_mm_dd}`,
    enso,
  });
});

/**
 * 残留塩素登録時の処理
 */
router.post('/enso', async (req, res) => {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyymmdd = `${yyyy}${mm}${dd}`;
  const objEnso = await yyyymmdds_enso.findPKey(yyyymmdd);

  const inObjEnso = {};
  inObjEnso.yyyymmdd = yyyymmdd;
  inObjEnso.id_users = req.body.id_users;
  inObjEnso.level = req.body.level;
  inObjEnso.color = req.body.color;
  inObjEnso.nigori = req.body.nigori;
  inObjEnso.nioi = req.body.nioi;
  inObjEnso.aji = req.body.aji;
  inObjEnso.bikou = req.body.bikou;
  inObjEnso.yyyymmddhhmmss_upd = common.getTodayTime();
  if (objEnso.length === 0) {
    inObjEnso.yyyymmddhhmmss_add = common.getTodayTime();
    await yyyymmdds_enso.insert(inObjEnso);
  } else {
    inObjEnso.yyyymmddhhmmss_add = objEnso[0].yyyymmddhhmmss_add;
    await yyyymmdds_enso.update(inObjEnso);
  }

  res.redirect('/');
});




module.exports = router;
