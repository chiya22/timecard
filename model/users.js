const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("users").where({id: id})
        return retObj;
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("users").orderBy("id","asc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into users values ('" + inObj.id + "','" + inObj.name + "','" + inObj.kubun + "','" + inObj.ymd_start + "','" + inObj.ymd_end + "','" + inObj.ymd_upd + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        let query;
        query = "update users set name = '" + inObj.name + "', kubun = " + inObj.kubun + ", ymd_start = '" + inObj.ymd_start + "', ymd_end = '" + inObj.ymd_end + "', ymd_upd = '" + inObj.ymd_upd + "' where id = '" + inObj.id + "'";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (id) => {
    try {
        const query = "delete from users where id = '" + id + "'";
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/*
区分（1：社員、2：バイト）と日付をもとに、
その日付時点で有効な社員情報に指定された日付の出勤情報を付帯した、社員情報一覧を返却する
*/
const findByKubunWithYyyymmddInfo = async (kubun, ymd_end, yyyymmdd) => {
    try {
        const query = "SELECT u.*, yy.yyyymmdd, yy.time_start, yy.time_end, yy.time_start_upd, yy.time_end_upd, yy.isYuukyuu FROM (SELECT * from users WHERE kubun = '" + kubun + "' and ymd_end > '" + ymd_end + "') AS u LEFT OUTER JOIN ( SELECT * FROM yyyymmdds y WHERE y.yyyymmdd = '" + yyyymmdd + "') yy ON u.id = yy.id_users ORDER BY u.id asc"
        const retObj =await knex.raw(query)
        return retObj[0]
    } catch(err) {
        throw err
    }
};

/*
IDと日付をもとに、出勤情報を取得する
*/
const findByUserIDWithYyyymmddInfo = async (id_users, yyyymmdd) => {
    try {
        const query = "SELECT u.*, yy.yyyymmdd, yy.time_start, yy.time_end, yy.time_start_upd, yy.time_end_upd, yy.isYuukyuu FROM (SELECT * from users WHERE id = '" + id_users + "') AS u LEFT OUTER JOIN ( SELECT * FROM yyyymmdds y WHERE y.yyyymmdd = '" + yyyymmdd + "') yy ON u.id = yy.id_users ORDER BY u.id asc"
        const retObj =await knex.raw(query)
        return retObj[0]
    } catch(err) {
        throw err
    }
};

/*
日付をもとに、出勤情報を取得する
 */
const findByYyyymmdd = async (yyyymmdd) => {
    try {
        logger.info(yyyymmdd);
        const query = "SELECT b.id, b.name FROM yyyymmdds a left outer join users b ON a.id_users = b.id where a.yyyymmdd = '" + yyyymmdd + "';"
        logger.info(query);
        const retObj =await knex.raw(query)
        return retObj[0]
    } catch(err) {
        throw err
    }
};



module.exports = {
    find: find,
    findPKey: findPKey,
    findByKubunWithYyyymmddInfo: findByKubunWithYyyymmddInfo,
    findByUserIDWithYyyymmddInfo: findByUserIDWithYyyymmddInfo,
    findByYyyymmdd: findByYyyymmdd,
    insert: insert,
    update: update,
    remove: remove,
};