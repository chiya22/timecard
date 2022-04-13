const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();
const common = require('../util/common');

const findPKey = async (ymd_irai, id, ymd_target) => {
    try {
        const retObj = await knex.from("hoseis").where({ymd_irai:ymd_irai},{id_users: id},{ymd_target: ymd_target} )
        return retObj;
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("hoseis").orderBy("ymd_irai","asc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findAll = async () => {
    try {
        const query = "SELECT h.*, u.id AS u_id_users, u.name AS u_id_users_name, u2.id AS u_id_users_hosei, u2.name AS u_id_users_hosei_name FROM hoseis h LEFT OUTER JOIN users u ON h.id_users = u.id LEFT OUTER JOIN users u2 ON h.id_users_hosei = u2.id ORDER BY h.ymd_irai desc"; 
        const retObj =await knex.raw(query)
        return retObj[0]
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into hoseis values (" + common.retValueForSql(inObj.ymd_irai) + "," + common.retValueForSql(inObj.id_users) + "," + common.retValueForSql(inObj.ymd_target) + "," + common.retValueForSql(inObj.message) + "," + common.retValueForSql(inObj.id_users_hosei) + "," + common.retValueForSql(inObj.ymd_hosei) + "," + common.retValueForSql(inObj.yyyymmddhhmmss_add) + ")";
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
        query = "update hoseis set  id_users_hosei = " + common.retValueForSql(inObj.id_users_hosei) + ", ymd_hosei = " + common.retValueForSql(inObj.ymd_hosei) + " where ymd_irai = '" + inObj.ymd_irai + "' and id_users = '" + inObj.id_users + "' and ymd_target = '" + inObj.ymd_target + "'";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (ymd_irai, id_users, ymd_target) => {
    try {
        const query = "delete from hoseis where ymd_irai = '" + ymd_irai + "' and id_users = '" + id_users + "' and ymd_target = '" + ymd_target + "'";
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findPKey,
    findAll,
    insert,
    update,
    remove,
};