const getYmdyoubi = function () {

    const date = new Date();
    const ymd = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    var weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    return `${ymd}(${weekdays[date.getDay()]})`;
};

module.exports = {
    getYmdyoubi,
};
