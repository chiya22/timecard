const fs = require('node:fs');

/*
値が設定されているかどうかで、SQL用へのバインド用文字列を返却する
*/
const retValueForSql = (value) => (value ? `'${value}'` : null);

/*
引数の日付をもとに、精算対象月を求める
15日締めのため
yyyymm16⇒yyyymm+1
yyyymm01⇒yyyymm
yyyymm15⇒yyyymm
 */
const getYyyymmSeisan = (yyyymmdd) => {
  const yyyy = Number(yyyymmdd.slice(0, 4));
  let resultMonth = Number(yyyymmdd.slice(4, 6));
  const dd = Number(yyyymmdd.slice(-2));
  let resultYear = yyyy;
  if (dd >= 16) {
    if (resultMonth === 12) {
      resultMonth = 1;
      resultYear += 1;
    } else {
      resultMonth += 1;
    }
  }
  return `${resultYear}${String(resultMonth).padStart(2, '0')}`;
};

/*
年月をもとに、前月を求める
 */
const getBeforeMonthYyyymm = (yyyymm) => {
  const date = new Date(yyyymm.slice(0, 4), Number(yyyymm.slice(-2)) - 1, 1);
  date.setMonth(date.getMonth() - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}${mm}`;
};

/*
日付をもとに、曜日を返却する
*/
const getYoubi = (yyyymmdd) => {
  const date = new Date(`${yyyymmdd.slice(0, 4)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(-2)}`);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  let youbi = weekdays[date.getDay()];
  let filecontent;
  try {
    filecontent = fs.readFileSync('./data/holiday.dat', 'utf-8');
  } catch (err) {
    // holiday.datが存在しない場合や読み込みエラー時は祝日判定をスキップ
    return youbi;
  }
  const holidaylist = filecontent.split('\r\n');
  for (const holiday of holidaylist) {
    if (holiday === yyyymmdd) {
      youbi = '祝';
      break;
    }
  }
  return youbi;
};
/*
日付（yyyymmdd形式）をもとに平日、祝日を判定する
true：平日
false：土日祝
*/
const isWeekDay = (yyyymmdd) => {
  const youbi = getYoubi(yyyymmdd);
  return !(youbi === '祝' || youbi === '日' || youbi === '土');
};

/*
ユーザーID、開始年月日、終了年月日をもとに、初期設定用のタイムリストを作成し返却する
*/
const getInitialTimeListAll = (id_users, yyyymmdd_start, yyyymmdd_end) => {
  const afteryear = yyyymmdd_end.slice(0, 4);
  const aftermonth = yyyymmdd_end.slice(4, 6);
  const afterstartday = 1;
  const afterendday = 15;
  const beforeyear = yyyymmdd_start.slice(0, 4);
  const beforemonth = yyyymmdd_start.slice(4, 6);
  const beforestartday = 16;
  const date = new Date(`${yyyymmdd_end.slice(0, 4)}/${yyyymmdd_end.slice(4, 6)}/01`);
  date.setDate(date.getDate() - 1);
  const beforeendday = date.getDate();
  const timeInfoList = [];
  for (let i = beforestartday; i <= beforeendday; i++) {
    const timeInfo = {
      id_users,
      yyyymmdd: beforeyear + beforemonth + String(i).padStart(2, '0'),
      yyyymm_seisan: getYyyymmSeisan(beforeyear + beforemonth + String(i).padStart(2, '0')),
      youbi: getYoubi(beforeyear + beforemonth + String(i).padStart(2, '0')),
    };
    timeInfoList.push(timeInfo);
  }
  for (let i = afterstartday; i <= afterendday; i++) {
    const timeInfo = {
      id_users,
      yyyymmdd: afteryear + aftermonth + String(i).padStart(2, '0'),
      yyyymm_seisan: getYyyymmSeisan(afteryear + aftermonth + String(i).padStart(2, '0')),
      youbi: getYoubi(afteryear + aftermonth + String(i).padStart(2, '0')),
    };
    timeInfoList.push(timeInfo);
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
  const starthh = Number.parseInt(`${'000'}${time_start.replace(':', '')}`.slice(-4).slice(0, 2), 10);
  const startmm = Number.parseInt(time_start.slice(-2), 10);
  const endhh = Number.parseInt(`${'000'}${time_end.replace(':', '')}`.slice(-4).slice(0, 2), 10);
  const endmm = Number.parseInt(time_end.slice(-2), 10);
  const time_calcstart = starthh * 60 + startmm;
  const time_calcend = endhh * 60 + endmm;
  if (time_calcend < time_calcstart) {
    return false;
  }
  let time_calcrest = 0;
  if (time_rest) {
    const resthh = Number.parseInt(`${'000'}${time_rest.replace(':', '')}`.slice(-4).slice(0, 2), 10);
    const restmm = Number.parseInt(time_rest.slice(-2), 10);
    time_calcrest = resthh * 60 + restmm;
  }
  let time_pay = time_calcend - time_calcstart - time_calcrest;
  time_pay -= time_pay % 15;
  const payhh = String(Math.floor(time_pay / 60)).padStart(2, '0');
  const paymm = String(time_pay % 60).padStart(2, '0');
  return `${payhh}${paymm}`;
};

/*
引数で渡された出勤時間、退勤時間、出勤時間修正、退勤時間修正をもとに
有効な出勤時間、退勤時間を返却する
優先度）
出勤時間＜出勤時間修正
退勤時間＜退勤時間修正
*/
const getStartEndTime = (time_start, time_end, time_startupd, time_endupd) => {
  const stime = time_startupd || time_start;
  const etime = time_endupd || time_end;
  return {
    time_start: stime.replace(':', ''),
    time_end: etime.replace(':', ''),
  };
};


const getTodayTime = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${d.getFullYear()}${mm}${dd}${hh}${mi}${ss}`;
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
  getTodayTime,
};
