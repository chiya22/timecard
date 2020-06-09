const datadir = './data';
const fs = require('fs');
const cm = require('./common');

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
            // todo ここは共通化する
            if (timedataarray[1] === '') {
                // starttime = '出勤';
            } else if (timedataarray[3] === '') {
                starttime = timedataarray[1];
            } else {
                starttime = timedataarray[3];
            }
            if (timedataarray[2] === '') {
                // endtime = '退勤';
            } else if (timedataarray[4] === '') {
                endtime = timedataarray[2];
            } else {
                endtime = timedataarray[4]
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
            //todo ここは共通化する
            if (timedataarray[1] === '') {
                starttime = '出勤';
            } else if (timedataarray[3] === '') {
                starttime = timedataarray[1];
            } else {
                starttime = timedataarray[3];
            }
            if (timedataarray[2] === '') {
                endtime = '退勤';
            } else if (timedataarray[4] === '') {
                endtime = timedataarray[2];
            } else {
                endtime = timedataarray[4]
            }
            if (shorikubun === 'start') {
                if (timedataarray[1] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmm},,,,${timedataarray[5]},${timedataarray[6]},${timedataarray[7]},${timedataarray[8]}\n`, 'utf-8');
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${hhmm},,${timedataarray[5]},${timedataarray[6]},${timedataarray[7]},${timedataarray[8]}\n`, 'utf-8');
                }
                starttime = hhmm;
            } else {
                let timeinfo;
                let paytime;
                let resttime;
                timeinfo = cm.getStartEndTime(timedataarray[1], hhmm, timedataarray[3], null);
                paytime = cm.getPaytime(timeinfo.starttime, timeinfo.endtime, cm.isWeekDay(yyyymmdd));
                resttime = cm.getResttime(timeinfo.starttime, cm.isWeekDay(yyyymmdd));
                if (timedataarray[2] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${hhmm},${timedataarray[3]},,${resttime},${timedataarray[6]},on,${paytime}\n`, 'utf-8');
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${timedataarray[3]},${hhmm},${resttime},${timedataarray[6]},on,${paytime}\n`, 'utf-8');
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
        fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmm},,,,,off,off,\n`, 'utf-8');
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
                resttime: timedataarray[5],
                makanai: timedataarray[6],
                asaoso: timedataarray[7],
                paytime: timedataarray[8],
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
指定した年月の出退勤情報一覧（出勤、退勤、出勤（更新）、退勤（更新）、賄手当、朝遅手当、支給時間）を設定する
*/
const updTime = function (id, yyyymm, yyyymmddlist, startlist, endlist, startupdlist, endupdlist, resttimelist, makanailist, asaosolist, paytimelist) {

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
    let paytime;
    let resttime;
    for (let i = 0; i < yyyymmddlist.length; i++) {
        timeinfo = cm.getStartEndTime(startlist[i], endlist[i], startupdlist[i], endupdlist[i]);
        if (paytimelist[i]) {
            paytime = paytimelist[i];
        } else {
            if (timeinfo.endtime) {
                if (resttimelist[i]) {
                    paytime = cm.getPaytime(timeinfo.starttime, timeinfo.endtime, cm.isWeekDay(yyyymmddlist[i]), resttimelist[i]);
                }else{
                    paytime = cm.getPaytime(timeinfo.starttime, timeinfo.endtime, cm.isWeekDay(yyyymmddlist[i]), null);
                }
            } else {
                paytime = '';
            }
        }
        if (resttimelist[i]) {
            resttime = resttimelist[i];
        } else {
            if (timeinfo.endtime) {
                resttime = cm.getResttime(timeinfo.starttime, cm.isWeekDay(yyyymmddlist[i]));
            } else {
                resttime = '';
            }
        }
        fs.appendFileSync(iddatedir, `${yyyymmddlist[i]},${startlist[i]},${endlist[i]},${startupdlist[i]},${endupdlist[i]},${resttime},${makanailist[i]},${asaosolist[i]},${paytime}\n`, 'utf-8');
    }
};

module.exports = {
    getTimedata,
    setTime,
    updTime,
    getMonthdata,
};