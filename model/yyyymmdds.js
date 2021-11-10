const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();
const common = require('../util/common');

const findPKey = async (id_users, yyyymmdd) => {
    try {
        const retObj = await knex.from("yyyymmdds").where({id_user: id_users, yyyymmdd: yyyymmdd })
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findByYyyymmAndUserid = async (yyyymm, id_users ) => {
    try {
        const query = "SELECT * FROM yyyymmdds WHERE left(yyyymmdd,6) = '" + yyyymm + "' and id_users = '" + id_users + "' ORDER BY yyyymmdd ASC;"
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByIntervalAndUserid = async (ymd_start, ymd_end, id_users ) => {
    try {
        const query = "SELECT * FROM yyyymmdds WHERE yyyymmdd >= '" + ymd_start + "' and yyyymmdd <= '" + ymd_end + "' and id_users = '" + id_users + "' ORDER BY yyyymmdd ASC;"
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findYyyymmInfoByUserId = async (id_users) => {
    try {
        const query = "SELECT yyyymm_seisan FROM yyyymmdds y WHERE id_users = '" + id_users + "' GROUP BY yyyymm_seisan ORDER BY yyyymm_seisan ASC;"
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj[0];

    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into yyyymmdds values (" + common.retValueForSql(inObj.id_users) + "," + common.retValueForSql(inObj.yyyymmdd) + "," + common.retValueForSql(inObj.yyyymm_seisan) + "," + common.retValueForSql(inObj.time_start) + "," + common.retValueForSql(inObj.time_start_upd) + "," + common.retValueForSql(inObj.time_end) + "," + common.retValueForSql(inObj.time_end_upd) + "," + common.retValueForSql(inObj.time_rest) + "," + common.retValueForSql(inObj.kubun_makanai) + "," + common.retValueForSql(inObj.kubun_asaoso) + "," + common.retValueForSql(inObj.time_pay) + ")";
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
        query = "update yyyymmdds set yyyymm_seisan = " + common.retValueForSql(inObj.yyyymm_seisan) + ", time_start = " + common.retValueForSql(inObj.time_start) + ", time_start_upd = " + common.retValueForSql(inObj.time_start_upd) + ", time_end = " + common.retValueForSql(inObj.time_end) + ", time_end_upd = " + common.retValueForSql(inObj.time_end_upd) + ", time_rest = "  + common.retValueForSql(inObj.time_rest) + ", kubun_makanai = "  + common.retValueForSql(inObj.kubun_makanai) + ", kubun_asaoso = "  + common.retValueForSql(inObj.kubun_asaoso) + ", time_pay = " + common.retValueForSql(inObj.time_pay) + " where id_users = '" + inObj.id_users + "' and yyyymmdd = '" + inObj.yyyymmdd + "';"
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (id_users, yyyymmdd) => {
    try {
        const query = "delete from yyyymmdds where id_users = '" + id_users + "' and yyyymmdd = '" + yyyymmdd + "';"
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    findPKey,
    findYyyymmInfoByUserId,
    findByYyyymmAndUserid,
    findByIntervalAndUserid,
    insert,
    update,
    remove,
};