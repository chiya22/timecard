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
区分（1：社員、2：バイト）をもとに、
指定された日付の出勤情報を付帯した、社員情報一覧を返却する
*/
const findByKubunWithYyyymmddInfo = async (kubun, yyyymmdd) => {
    try {
        const query = "SELECT u.*, yy.yyyymmdd, yy.time_start, yy.time_end, yy.time_start_upd, yy.time_end_upd FROM (SELECT * from users WHERE kubun = '" + kubun + "') AS u LEFT OUTER JOIN ( SELECT * FROM yyyymmdds y WHERE y.yyyymmdd = '" + yyyymmdd + "') yy ON u.id = yy.id_users ORDER BY u.id asc"
        const retObj =await knex.raw(query)
        return retObj[0]
    } catch(err) {
        throw err
    }
};

module.exports = {
    find: find,
    findPKey: findPKey,
    insert: insert,
    update: update,
    remove: remove,
};