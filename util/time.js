const datadir = './data';
const fs = require('fs');
const cm = require('./common');

/*
引数で指定されたディレクトリ、指定されたユーザID、指定された日付をもとに、
初期ファイルを作成する
*/
const createInitailFile = function (datadir, id, yyyy_mm_dd) {

    const yyyymm = cm.getTargetYYYYMM(yyyy_mm_dd)

    try {
        fs.statSync(datadir + "/" + id + "/" + yyyymm);
    } catch (err) {
        if (err.code === "ENOENT") {

            const yyyymm = cm.getTargetYYYYMM(yyyy_mm_dd)
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
                linedata += beforeyear + beforemonth + ("0" + i).slice(-2) + ",,,,\n";
            }
            for (let i = afterstartday; i <= afterendday; i++) {
                linedata += afteryear + aftermonth + ("0" + i).slice(-2) + ",,,,\n";
            }

            try {
                fs.writeFileSync(datadir + "/" + id + "/" + yyyymm, linedata);
            } catch {
                throw new Error("初期ファイル作成時にエラーが発生しました。");
            }

        } else {
            throw err;
        };
    };
};

/*
指定されたユーザID、指定された年月日(yyyy/mm/dd形式)の
出勤時間、退勤時間を取得し返却する
*/
const getTimedata = function (id, yyyy_mm_dd) {

    const yyyymm = cm.getTargetYYYYMM(yyyy_mm_dd);
    const yyyymmdd = yyyy_mm_dd.replace(/\//g, '');
    const iddatedir = `${datadir}/${id}/${yyyymm}`;
    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code === "ENOENT") {
            return {
                starttime: '出勤',
                endtime: '退勤',
            }
        } else {
            throw err;
        }
    }
    let filecontent = fs.readFileSync(iddatedir, 'utf-8');
    const timelist = filecontent.split('\n');
    let starttime = '出勤';
    let endtime = '退勤';
    timelist.forEach((time) => {
        const timedataarray = time.split(',');
        if (timedataarray[0] === yyyymmdd) {
            isexit = true;
            const currentTime = cm.getStartEndTime(timedataarray[1],timedataarray[2],timedataarray[3],timedataarray[4]);
            if (currentTime.starttime){
                starttime = currentTime.starttime;
            }
            if (currentTime.endtime){
                endtime = currentTime.endtime;
            }
        }
    });

    return {
        starttime: starttime,
        endtime: endtime,
    };
}

/*
指定したユーザID、出退勤区分、指定した日付（yyyy/mm/dd形式）、時間（hh:mm形式）のデータを
対象となるyyyymmファイルへ書き込む
shorikubun：start⇒出勤、end⇒退勤
*/
const setTime = function (id, shorikubun, yyyy_mm_dd, hhmm) {

    const yyyymm = cm.getTargetYYYYMM(yyyy_mm_dd);
    const yyyymmdd = yyyy_mm_dd.replace(/\//g, '');
    const iddatedir = `${datadir}/${id}/${yyyymm}`;

    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code === "ENOENT") {
            fs.writeFileSync(iddatedir, `${yyyymmdd},${hhmm},,,\n`, 'utf-8');
            return {
                starttime: hhmm,
                endtime: '退勤',
            };
        } else {
            throw err;
        }
    }
    let isexit = false;
    let filecontent = fs.readFileSync(iddatedir, 'utf-8');
    const timelist = filecontent.split('\n');
    let starttime = '出勤';
    let endtime = '退勤';
    fs.writeFileSync(iddatedir, '', 'utf-8');
    timelist.forEach((time) => {
        const timedataarray = time.split(',');
        if (timedataarray[0] === yyyymmdd) {
            isexit = true;
            const currentTime = cm.getStartEndTime(timedataarray[1],timedataarray[2],timedataarray[3],timedataarray[4]);
            if (currentTime.starttime){
                starttime = currentTime.starttime;
            }
            if (currentTime.endtime){
                endtime = currentTime.endtime;
            }
            if (shorikubun === 'start') {
                if (timedataarray[1] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmm},,,\n`, 'utf-8');
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${hhmm},\n`, 'utf-8');
                }
                starttime = hhmm;
            } else {
                let timeinfo;
                timeinfo = cm.getStartEndTime(timedataarray[1], hhmm, timedataarray[3], null);
                if (timedataarray[2] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${hhmm},${timedataarray[3]},\n`, 'utf-8');
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${timedataarray[3]},${hhmm}\n`, 'utf-8');
                }
                endtime = hhmm;
            };
        } else {
            if (time !== '') {
                fs.appendFileSync(iddatedir, `${time}\n`);
            }
        }
    });
    if (!isexit) {
        fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmm},,,\n`, 'utf-8');
        starttime = hhmm;
    };
    return {
        starttime: starttime,
        endtime: endtime,
    };
};

/*
指定したユーザID、指定した年月（yyyy/mm形式）の
出勤退勤情報一覧を取得する
*/
const getMonthdata = function (id, yyyy_mm) {

    const yyyymm = yyyy_mm.replace(/\//g, '');
    const iddatedir = `${datadir}/${id}/${yyyymm}`;
    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code === "ENOENT") {
            return null;
        } else {
            throw err;
        }
    }
    let filecontent = fs.readFileSync(iddatedir, 'utf-8');
    const timelist = filecontent.split('\n');
    let timeinfo = {};
    let timeinfolist = [];
    timelist.forEach((time) => {
        if (time !== '') {
            const timedataarray = time.split(',');
            timeinfo = {
                yyyymmdd: timedataarray[0],
                start: timedataarray[1],
                end: timedataarray[2],
                startupd: timedataarray[3],
                endupd: timedataarray[4],
                youbi: cm.getYoubi(new Date(timedataarray[0].slice(0, 4) + "/" + timedataarray[0].slice(4, 6) + "/" + timedataarray[0].slice(-2))),
                yyyymmddyoubi: cm.getYmdyoubi(new Date(timedataarray[0].slice(0, 4) + "/" + timedataarray[0].slice(4, 6) + "/" + timedataarray[0].slice(-2)))
            };
            timeinfolist.push(timeinfo);
        }
    });
    return timeinfolist;
};

/*
指定したユーザID、指定した年月（yyyymm形式）、
指定した年月の出退勤情報一覧（出勤、退勤、出勤（更新）、退勤（更新））を設定する
*/
const updTime = function (id, yyyymm, yyyymmddlist, startlist, endlist, startupdlist, endupdlist) {

    const iddatedir = `${datadir}/${id}/${yyyymm}`;

    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    fs.writeFileSync(iddatedir, '', 'utf-8');

    let timeinfo;
    for (let i = 0; i < yyyymmddlist.length; i++) {
        timeinfo = cm.getStartEndTime(startlist[i], endlist[i], startupdlist[i], endupdlist[i]);
        fs.appendFileSync(iddatedir, `${yyyymmddlist[i]},${startlist[i]},${endlist[i]},${startupdlist[i]},${endupdlist[i]}\n`, 'utf-8');
    }
};

module.exports = {
    createInitailFile,
    getTimedata,
    setTime,
    updTime,
    getMonthdata,
};