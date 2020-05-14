const datadir = './data';
const fs = require('fs');

const getTimedata = function (id, yyyy_mm_dd) {
    const yyyymmdd = yyyy_mm_dd.replace(/\//g, '');
    const yyyymm = yyyymmdd.slice(0,6);
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
    let starttime = null;
    let endtime = null;
    timelist.forEach((time) => {
        const timedataarray = time.split(',');
        // todo ここは共通化する
        if (timedataarray[1] === ''){
            starttime = '出勤';
        }else if (timedataarray[3] === ''){
            starttime = timedataarray[1];
        }else{
            starttime = timedataarray[3];
        }
        if (timedataarray[2] === ''){
            endtime = '退勤';
        }else if (timedataarray[4] === '') {
            endtime = timedataarray[2];
        }else{
            endtime = timedataarray[4]
        }
    });
    
    return {
        starttime: starttime,
        endtime: endtime,
    };
}

const setTime = function (id, shorikubun, yyyy_mm_dd, hhmmss) {

    const yyyymmdd = yyyy_mm_dd.replace(/\//g, '');
    const yyyymm = yyyymmdd.slice(0,6);
    const iddatedir = `${datadir}/${id}/${yyyymm}`;

    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code === "ENOENT") {
            fs.writeFileSync(iddatedir, `${yyyymmdd},${hhmmss},,,`);
            return {
                starttime: hhmmss,
                endtime:'退勤',
            };
        } else {
            throw new Error("get timecard error");
        }
    }
    let isexit = false;
    let filecontent = fs.readFileSync(iddatedir, 'utf-8');
    const timelist = filecontent.split('\n');
    let starttime = null;
    let endtime = null;
    fs.writeFileSync(iddatedir, '');
    timelist.forEach((time) => {
        const timedataarray = time.split(',');
        if (timedataarray[0] === yyyymmdd) {
            isexit = true;
            //todo ここは共通化する
            if (timedataarray[1] === ''){
                starttime = '出勤';
            }else if (timedataarray[3] === ''){
                starttime = timedataarray[1];
            }else{
                starttime = timedataarray[3];
            }
            if (timedataarray[2] === ''){
                endtime = '退勤';
            }else if (timedataarray[4] === '') {
                endtime = timedataarray[2];
            }else{
                endtime = timedataarray[4]
            }
            if (shorikubun === 'start'){
                if (timedataarray[1] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmmss},,,`);
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${hhmmss},`);
                }
                starttime = hhmmss;
            } else {
                if (timedataarray[2] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${hhmmss},${timedataarray[3]},`);
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${timedataarray[3]},${hhmmss}`);
                }
                endtime = hhmmss;
            };
        }else{
            fs.appendFileSync(iddatedir, time);
        }
    });
    if (!isexit) {
        fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmmss},,,`, "UTF-8");
        starttime = hhmmss;
    };
    return {
        starttime: starttime,
        endtime:endtime,
    };
};

module.exports = {
    getTimedata,
    setTime,
};