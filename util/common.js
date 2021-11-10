const fs = require("fs");

/*
値が設定されているかどうかで、SQL用へのバインド用文字列を返却する
*/
const retValueForSql = (value) => {
  return value ? `'${value}'` : null;
};

/*
引数の日付をもとに、精算対象月を求める
15日締めのため
yyyymm16⇒yyyymm+1
yyyymm01⇒yyyymm
yyyymm15⇒yyyymm
 */
const getYyyymmSeisan = (yyyymmdd) => {
  let yyyy = Number(yyyymmdd.slice(0, 4));
  let mm = Number(yyyymmdd.slice(4, 6));
  let dd = Number(yyyymmdd.slice(-2));
  // 15日締めのため
  // 01-15日⇒現在の月のファイルへ出力
  // 16-31日⇒現在の次の月のファイルへ出力
  if (dd >= 16) {
    if (mm === 12) {
      mm = 1;
      yyyy += 1;
    } else {
      mm += 1;
    }
  }
  return "" + yyyy + ("0" + mm).slice(-2);
};

/*
年月をもとに、前月を求める
 */
const getBeforeMonthYyyymm = (yyyymm) => {
  let date = new Date(yyyymm.slice(0, 4), yyyymm.slice(-2) - 1, "01");
  date.setMonth(date.getMonth() - 1);
  const yyyy = date.getFullYear();
  const mm = ("0" + (date.getMonth() + 1)).slice(-2);
  return "" + yyyy + mm;
};

/*
日付をもとに、曜日を返却する
*/
const getYoubi = (yyyymmdd) => {
  const date = new Date(yyyymmdd.slice(0, 4) + "/" + yyyymmdd.slice(4, 6) + "/" + yyyymmdd.slice(-2));
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  let youbi = weekdays[date.getDay()];
  try {
    //祝日カレンダー
    let filecontent = fs.readFileSync("./data/master/holiday.dat", "utf-8");
    const holidaylist = filecontent.split("\n");
    holidaylist.forEach((holiday) => {
      if (holiday === yyyymmdd) {
        youbi = "祝";
        return;
      }
    });
  } catch (err) {
    throw err;
  }
  return youbi;
};
/*
日付（yyyymmdd形式）をもとに平日、祝日を判定する
true：平日
false：土日祝
*/
const isWeekDay = function (yyyymmdd) {
  const youbi = getYoubi(yyyymmdd);
  if (youbi === "祝" || youbi === "日" || youbi === "土") {
    return false;
  } else {
    return true;
  }
};

/*
ユーザーID、開始年月日、終了年月日をもとに、初期設定用のタイムリストを作成し返却する
*/
const getInitialTimeListAll = function (id_users, yyyymmdd_start, yyyymmdd_end) {
  const afteryear = yyyymmdd_end.slice(0, 4);
  const aftermonth = yyyymmdd_end.slice(4, 6);
  const afterstartday = 1;
  const afterendday = 15;

  const beforeyear = yyyymmdd_start.slice(0, 4);
  const beforemonth = yyyymmdd_start.slice(4, 6);
  const beforestartday = 16;
  let date = new Date(yyyymmdd_end.slice(0, 4) + "/" + yyyymmdd_end.slice(4, 6) + "/01");
  date.setDate(date.getDate() - 1);
  const beforeendday = date.getDate();

  let timeInfoList = [];
  let timeInfo = {};
  for (let i = beforestartday; i <= beforeendday; i++) {
    timeInfo.id_users = id_users;
    timeInfo.yyyymmdd = beforeyear + beforemonth + ("0" + i).slice(-2);
    timeInfo.yyyymm_seisan = getYyyymmSeisan(timeInfo.yyyymmdd);
    timeInfo.youbi = getYoubi(timeInfo.yyyymmdd);
    timeInfoList.push(timeInfo);
    timeInfo = {};
  }
  for (let i = afterstartday; i <= afterendday; i++) {
    timeInfo.id_users = id_users;
    timeInfo.yyyymmdd = afteryear + aftermonth + ("0" + i).slice(-2);
    timeInfo.yyyymm_seisan = getYyyymmSeisan(timeInfo.yyyymmdd);
    timeInfo.youbi = getYoubi(timeInfo.yyyymmdd);
    timeInfoList.push(timeInfo);
    timeInfo = {};
  }
  return timeInfoList;
};

/*
引数で渡された出勤時間（hhmm形式）、退勤時間（hhmm形式）、休憩時間（hhmm形式）をもとに、
支給時間を算出し返却する

※休憩時間は引数で設定されている場合は、その値を優先的に使用する
　引数で設定されていない場合は、ルールに従って設定される

*/
const getPaytime = (time_start, time_end, time_rest) => {
  const starthh = parseInt(time_start.slice(0, 2));
  const startmm = parseInt(time_start.slice(2, 4));
  const endhh = parseInt(time_end.slice(0, 2));
  const endmm = parseInt(time_end.slice(2, 4));

  //starttimeとendtimeの大小比較
  let time_calcstart = starthh * 60 + startmm;
  let time_calcend = endhh * 60 + endmm;
  if (time_calcend < time_calcstart) {
    return false;
  }

  let time_calcrest = 0;
  if (time_rest) {
    const resthh = parseInt(time_rest.slice(0, 2));
    const restmm = parseInt(time_rest.slice(2, 4));
    time_calcrest = resthh * 60 + restmm;
  }

  let time_pay = 0;
  time_pay = time_calcend - time_calcstart - time_calcrest;

  //15分単位で区切る
  time_pay = time_pay - (time_pay % 15);
  const payhh = ("0" + parseInt(time_pay / 60, 10)).slice(-2);
  const paymm = ("0" + (time_pay % 60)).slice(-2);
  return "" + payhh + paymm;
};

/*
引数で渡された出勤時間、退勤時間、出勤時間修正、退勤時間修正をもとに
有効な出勤時間、退勤時間を返却する
優先度）
出勤時間＜出勤時間修正
退勤時間＜退勤時間修正
*/
const getStartEndTime = (time_start, time_end, time_startupd, time_endupd) => {
  const stime = time_startupd? time_startupd: time_start;
  const etime = time_endupd? time_endupd: time_end;
  return {
    time_start: stime,
    time_end: etime,
  };
};

module.exports = {
  retValueForSql,
  getYyyymmSeisan,
  getBeforeMonthYyyymm,
  getYoubi,
  getPaytime,
  getStartEndTime,
  isWeekDay,
  getInitialTimeListAll,
};
