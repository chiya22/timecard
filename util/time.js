const datadir = './data';
const fs = require('fs');
const cm = require('./common');

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
            throw new Error("get timecard error");
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
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmm},,,,${timedataarray[5]},${timedataarray[6]}\n`, 'utf-8');
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${hhmm},,${timedataarray[5]},${timedataarray[6]}\n`, 'utf-8');
                }
                starttime = hhmm;
            } else {
                if (timedataarray[2] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${hhmm},${timedataarray[3]},,${timedataarray[5]},${timedataarray[6]}\n`, 'utf-8');
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${timedataarray[3]},${hhmm},${timedataarray[5]},${timedataarray[6]}\n`, 'utf-8');
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
        fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmm},,,,,\n`, 'utf-8');
        starttime = hhmm;
    };
    return {
        starttime: starttime,
        endtime: endtime,
    };
};

const getMonthdata = function (id, yyyy_mm) {

    const yyyymm = yyyy_mm.replace(/\//g, '');
    const iddatedir = `${datadir}/${id}/${yyyymm}`;
    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code === "ENOENT") {
            return null;
        } else {
            throw new Error("get timecard error");
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
                makanai: timedataarray[5],
                asaoso: timedataarray[6],
                yyyymmddyoubi: cm.getYmdyoubi(new Date(timedataarray[0].slice(0, 4) + "/" + timedataarray[0].slice(4, 6) + "/" + timedataarray[0].slice(-2)))
            };
            timeinfolist.push(timeinfo);
        }
    });
    return timeinfolist;
};

/*

*/
const updTime = function (id, yyyymm, yyyymmddlist, startlist, endlist, startupdlist, endupdlist, makanailist, asaosolist) {

    const iddatedir = `${datadir}/${id}/${yyyymm}`;

    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw new Error("update timecard error");
        }
    }
    fs.writeFileSync(iddatedir, '', 'utf-8');

    for (let i = 0; i < yyyymmddlist.length; i++) {
        fs.appendFileSync(iddatedir, `${yyyymmddlist[i]},${startlist[i]},${endlist[i]},${startupdlist[i]},${endupdlist[i]},${makanailist[i]},${asaosolist[i]}\n`, 'utf-8');
    }
};

module.exports = {
    getTimedata,
    setTime,
    updTime,
    getMonthdata,
};