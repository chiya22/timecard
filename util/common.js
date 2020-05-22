const fs = require('fs');

const getYmdyoubi = function (date) {

    const ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    var weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    return `${ymd}(${weekdays[date.getDay()]})`;
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
                linedata += beforeyear + beforemonth + ("0" + i).slice(-2) + ",,,,,false,false\n";
            }
            for (let i = afterstartday; i <= afterendday; i++) {
                linedata += afteryear + aftermonth + ("0" + i).slice(-2) + ",,,,,false,false\n";
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

module.exports = {
    getYmdyoubi,
    getTargetYYYYMM,
    readDirSync,
    createInitailFile,
};
