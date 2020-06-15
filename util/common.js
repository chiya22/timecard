const fs = require('fs');

/*
日付をもとに、日付＋曜日の文字列を返却する
yyyy/mm/dd(曜日)
*/
const getYmdyoubi = function (date) {

    const ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const youbi = getYoubi(date);

    return `${ymd}(${youbi})`;
};
/*
日付をもとに、曜日を返却する
*/
const getYoubi = function (date) {

    const ymd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    let youbi = weekdays[date.getDay()];
    try {
        //祝日カレンダー
        let filecontent = fs.readFileSync('./data/master/holiday.dat', 'utf-8');
        const holidaylist = filecontent.split('\n');
        holidaylist.forEach((holiday) => {
            if (holiday === ymd) {
                youbi = '祝';
                return;
            }
        });
    } catch {
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
    const aaa = yyyymmdd.slice(0,4) + "/" + yyyymmdd.slice(4, 6) + "/" + yyyymmdd.slice(6, 8);
    let date = new Date(yyyymmdd.slice(0,4) + "/" + yyyymmdd.slice(4, 6) + "/" + yyyymmdd.slice(6, 8));
    const youbi = getYoubi(date);
    if ((youbi === '祝') || (youbi === '日') || (youbi === '土')) {
        return false;
    } else {
        return true;
    }
};

/*
日付（yyyy/mm/dd形式）で、その日付が対象となる給与支給対象年月を返却する
 1-15：当月
 16-月末：翌月
*/
const getTargetYYYYMM = function (yyyy_mm_dd) {

    const datearray = yyyy_mm_dd.split('/');
    let yyyy = Number(datearray[0]);
    let mm = Number(datearray[1]);
    let dd = Number(datearray[2]);

    // 15日締めのため
    // 01-15日⇒現在の月のファイルへ出力
    // 16-31日⇒現在の次の月のファイルへ出力
    if (dd >= 16) {
        if (mm === 12) {
            mm = 1
        } else {
            mm = mm + 1
        }
    }
    return "" + yyyy + ("0" + mm).slice(-2);
};

/*
引数で指定されたディレクトリに存在しているファイルリストを返却する
*/
const readDirSync = (folderPath) => {
    const result = fs.readdirSync(folderPath);
    return result.map((itemName) => {
        return itemName.slice(0, 4) + "/" + itemName.slice(-2);
    });
};

/*
引数で渡された出勤時間、退勤時間、出勤時間修正、退勤時間修正（hh:mm形式）をもとに
有効な出勤時間、退勤時間を返却する
優先度）
出勤時間＜出勤時間修正
退勤時間＜退勤時間修正
*/
const getStartEndTime = function (starttime, endtime, startupdtime, endupdtime) {

    let stime = starttime;
    let etime = endtime;
    if (startupdtime) {
        stime = startupdtime;
    };
    if (endupdtime) {
        etime = endupdtime;
    };
    return {
        starttime: stime,
        endtime: etime,
    };
};

module.exports = {
    getYmdyoubi,
    getYoubi,
    getTargetYYYYMM,
    readDirSync,
    getStartEndTime,
    isWeekDay,
};
