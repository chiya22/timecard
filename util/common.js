const fs = require('fs');

const getYmdyoubi = function (date) {

    const ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);

    
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const youbi = getYoubi(date);

    return `${ymd}(${youbi})`;
};
const getYoubi = function (date) {

    const ymd = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    let youbi = weekdays[date.getDay()];
    try {
        //祝日カレンダー
        let filecontent = fs.readFileSync('./data/master/holiday.dat', 'utf-8');
        const holidaylist = filecontent.split('\n');
        holidaylist.forEach( (holiday) => {
            if (holiday === ymd) {
                youbi = '祝';
                return;
            }
        });
    } catch {
        throw new Error(err);
    }
    return youbi;
};

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

const readDirSync = (folderPath) => {
    const result = fs.readdirSync(folderPath);
    return result.map((itemName) => {
        return itemName.slice(0, 4) + "/" + itemName.slice(-2);
    });
};

const createInitailFile = function (datadir, id, yyyy_mm_dd) {

    const yyyymm = getTargetYYYYMM(yyyy_mm_dd)

    try {
        fs.statSync(datadir + "/" + id + "/" + yyyymm);
    } catch (err) {
        if (err.code === "ENOENT") {

            const yyyymm = getTargetYYYYMM(yyyy_mm_dd)
            let date = new Date(yyyymm.slice(0, 4) + "/" + yyyymm.slice(-2) + "/01");

            const afterstartday = 1;
            const afterendday = 15;
            const aftermonth = ("0" + (date.getMonth() + 1)).slice(-2);
            const afteryear = date.getFullYear();

            const beforestartday = 16;
            date.setDate(date.getDate() - 1);
            const beforeendday = date.getDate();
            const beforemonth = ("0" + (date.getMonth() + 1)).slice(-2);
            const beforeyear = date.getFullYear();

            let linedata = '';
            for (let i = beforestartday; i <= beforeendday; i++) {
                linedata += beforeyear + beforemonth + ("0" + i).slice(-2) + ",,,,,off,off,\n";
            }
            for (let i = afterstartday; i <= afterendday; i++) {
                linedata += afteryear + aftermonth + ("0" + i).slice(-2) + ",,,,,off,off,\n";
            }

            try {
                fs.writeFileSync(datadir + "/" + id + "/" + yyyymm, linedata);
            } catch {
                throw new Error("初期ファイル作成時にエラーが発生しました。");
            }

        } else {
            console.log(err);
        };
    };
};

const getPaytime = function (starttime, endtime, weekday) {

    const starthh = parseInt(starttime.split(':')[0]);
    const startmm = parseInt(starttime.split(':')[1]);
    const endhh = parseInt(endtime.split(':')[0]);
    const endmm = parseInt(endtime.split(':')[1]);

    //starttimeとendtimeの大小比較
    let calcstarttime = (starthh * 60) + startmm;
    let calcendtime = (endhh * 60) + endmm;
    if (calcendtime < calcstarttime) {
        return false;
    }

    //シフトによって勤務時間間隔、休憩時間を決める
    let basestarttime = 0;
    let baseendtime = 0;
    let baseresttime = 0;

    if (weekday) {
        //平日出勤
        if (starthh > 12) {
            //午前出勤
            basestarttime = (7 * 60) + 30;
            baseendtime = (15 * 60);
            baseresttime = 60;
        } else {
            //午後出勤
            basestarttime = (15 * 60);
            baseendtime = (22 * 60);
            baseresttime = 30;
        }
    } else {
        //土日祝日出勤
        if (starthh > 12) {
            //午前出勤
            basestarttime = (7 * 60) + 30;
            baseendtime = (14 * 60);
            baseresttime = 0;
        } else {
            //午後出勤
            basestarttime = (12 * 60) + 30;
            baseendtime = (19 * 60) + 30;
            baseresttime = 0;
        }
    }

    //勤務時間の計算
    //
    //◆出勤時間
    //basestarttime > calcstarttime
    // ⇒ basestarttime を使用
    //basestarttime < calcstarttime
    // ⇒ calcstarttime を使用
    //basestarttime = calcstarttime
    // ⇒ basestarttime を使用
    //
    //◆退勤時間
    //baseendtime < calcendtime
    // ⇒　calcendtimeを使用
    //baseendtime > calcendtime
    // ⇒　calcendtimeを使用
    //baseendtime = calcendtime
    // ⇒　calcendtimeを使用
    //
    //
    let paytime = 0;
    if (basestarttime >= starttime) {
        calsstarttime = basestarttime;
    }
    paytime = (calcendtime - calsstarttime - baseresttime);
    //15分単位で区切る
    paytime = paytime - (paytime % 15);
    const payhh = slice('0' + (paytime / 6), -2);
    const paymm = slice('0' + (paytime % 60), -2);
    return payhh + ":" + paymm;
}


module.exports = {
    getYmdyoubi,
    getYoubi,
    getTargetYYYYMM,
    readDirSync,
    createInitailFile,
    getPaytime,
};
