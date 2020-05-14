const datadir = './data';
const fs = require('fs');

const getTimedata = function (id, yyyy_mm_dd) {
    const yyyymmdd = yyyy_mm_dd.replace(/\//g, '');
    const yyyymm = yyyymmdd.slice(0,6);
    const iddatedir = `${datadir}/${id}/${yyyymm}`;
    //★fs.statsyncを使用するべき
    try {
        fs.statSync(iddatedir);
    } catch (err) {
        if (err.code === "ENOENT") {
            return {
                starttime: null,
                endtime: null,
                starttimeupd: null,
                endtimeupd: null,
            }
        }
    }

    let filecontent = fs.readFileSync(iddatedir, 'utf-8');
    const timelist = filecontent.split('\n');
    let starttime = null;
    let endtime = null;
    let starttimeupd = null;
    let endtimeupd = null;
    timelist.forEach((time) => {
        const timedataarray = time.split(',');
        if (timedataarray[0] === yyyymmdd) {
            starttime = timedataarray[1];
            endtime = timedataarray[2];
            starttimeupd = timedataarray[3];
            endtimeupd = timedataarray[4];
        }
    });
    
    return {
        starttime: starttime,
        endtime: endtime,
        starttimeupd: starttimeupd,
        endtimeupd: endtimeupd,
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
                endtime:null,
                starttimeupd:null,
                endtimeupd:null,
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
    let starttimeupd = null;
    let endtimeupd = null;
    fs.writeFileSync(iddatedir, '');
    timelist.forEach((time) => {
        const timedataarray = time.split(',');
        if (timedataarray[0] === yyyymmdd) {
            isexit = true;
            starttime = timedataarray[1];
            endtime = timedataarray[2];
            starttimeupd = timedataarray[3];
            endtimeupd = timedataarray[4];
            if (shorikubun === 'start'){
                if (timedataarray[1] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${hhmmss},,,`);
                    starttime = hhmmss;
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${hhmmss},`);
                    starttimeupd = hhmmss;
                }
            } else {
                if (timedataarray[2] === '') {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${hhmmss},${timedataarray[3]},`);
                    endtime = hhmmss;
                } else {
                    fs.appendFileSync(iddatedir, `${yyyymmdd},${timedataarray[1]},${timedataarray[2]},${timedataarray[3]},${hhmmss}`);
                    endtimeupd = hhmmss;
                }
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
        starttimeupd:starttimeupd,
        endtimeupd:endtimeupd,
    };
};

module.exports = {
    getTimedata,
    setTime,
};