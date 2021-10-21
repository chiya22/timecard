const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

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


const insert = async (inObj) => {
    try {
        const query = "insert into yyyymmdds values ('" + inObj.id_users + "','" + inObj.yyyymmdd + "','" + inObj.time_start + "','" + inObj.time_start_upd + "','" + inObj.time_end + "','" + inObj.time_end_upd + "','" + inObj.time_rest + "','" + inObj.kubun_makanai + "','" + inObj.kubun_asaoso + "','" + inObj.time_pay + "','" + inObj.ymd_upd + "')";
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
        query = "update yyyymmdds set time_start = '" + inObj.time_start + "', time_start_upd = " + inObj.time_start_upd + ", time_end = '" + inObj.time_end + "', time_end_upd = '" + inObj.time_end_upd + "', time_rest = '"  + inObj.time_rest + "', kubun_makanai = "  + inObj.kubun_makanai + ", kubun_asaoso = '"  + inObj.kubun_asaoso + "', time_pay = '" + inObj.time_pay + "' ymd_upd = '" + inObj.ymd_upd + "' where id_users = '" + inObj.id_users + "' and yyyymmdd = '" + inObj.yyyymmdd + "';"
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
    findPKey: findPKey,
    findByYyyymmAndUserid: findByYyyymmAndUserid,
    findByIntervalAndUserid: findByIntervalAndUserid,
    insert: insert,
    update: update,
    remove: remove,
};