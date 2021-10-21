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

module.exports = {
    find: find,
    findPKey: findPKey,
    insert: insert,
    update: update,
    remove: remove,
};