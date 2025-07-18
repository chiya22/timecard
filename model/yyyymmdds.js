const knex = require('../db/knex.js').connect();
const log4js = require('log4js');
const logger = log4js.configure('./config/log4js-config.json').getLogger();
const common = require('../util/common');

const findPKey = async (id_users, yyyymmdd) => {
  const retObj = await knex.from('yyyymmdds').where({id_users: id_users, yyyymmdd: yyyymmdd });
  return retObj;
};

// SQLクエリの組み立てはテンプレートリテラルで統一
const findByYyyymmAndUserid = async (yyyymm, id_users ) => {
  const query = `SELECT * FROM yyyymmdds WHERE left(yyyymmdd,6) = '${yyyymm}' and id_users = '${id_users}' ORDER BY yyyymmdd ASC;`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const findByIntervalAndUserid = async (ymd_start, ymd_end, id_users ) => {
  const query = `SELECT * FROM yyyymmdds WHERE yyyymmdd >= '${ymd_start}' and yyyymmdd <= '${ymd_end}' and id_users = '${id_users}' ORDER BY yyyymmdd ASC;`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const findByYyyymmSeisanAndUserid = async (yyyymm_seisan, id_users ) => {
  const query = `SELECT * FROM yyyymmdds WHERE yyyymm_seisan = '${yyyymm_seisan}' and id_users = '${id_users}' ORDER BY yyyymmdd ASC;`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const findYyyymmInfoByUserId = async (id_users) => {
  const query = `SELECT yyyymm_seisan FROM yyyymmdds y WHERE id_users = '${id_users}' GROUP BY yyyymm_seisan ORDER BY yyyymm_seisan ASC;`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const insert = async (inObj) => {
  const query = `insert into yyyymmdds values (${common.retValueForSql(inObj.id_users)},${common.retValueForSql(inObj.yyyymmdd)},${common.retValueForSql(inObj.yyyymm_seisan)},${common.retValueForSql(inObj.time_start)},${common.retValueForSql(inObj.time_end)},${common.retValueForSql(inObj.time_start_upd)},${common.retValueForSql(inObj.time_end_upd)},${common.retValueForSql(inObj.makanai)},${common.retValueForSql(inObj.isYuukyuu)},${common.retValueForSql(inObj.time_rest)},${common.retValueForSql(inObj.time_pay)})`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const update = async (inObj) => {
  const query = `update yyyymmdds set yyyymm_seisan = ${common.retValueForSql(inObj.yyyymm_seisan)}, time_start = ${common.retValueForSql(inObj.time_start)}, time_start_upd = ${common.retValueForSql(inObj.time_start_upd)}, time_end = ${common.retValueForSql(inObj.time_end)}, time_end_upd = ${common.retValueForSql(inObj.time_end_upd)}, makanai = ${common.retValueForSql(inObj.makanai)},  isYuukyuu = ${common.retValueForSql(inObj.isYuukyuu)}, time_rest = ${common.retValueForSql(inObj.time_rest)}, time_pay = ${common.retValueForSql(inObj.time_pay)} where id_users = '${inObj.id_users}' and yyyymmdd = '${inObj.yyyymmdd}';`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const remove = async (id_users, yyyymmdd) => {
  const query = `delete from yyyymmdds where id_users = '${id_users}' and yyyymmdd = '${yyyymmdd}';`;
  const retObj = await knex.raw(query);
  return retObj[0];
};

const download = async (yyyymm) => {
  const query = `SELECT y.id_users, y.yyyymmdd, y.time_start, y.time_end, y.time_start_upd, y.time_end_upd, y.makanai, y.isYuukyuu, y.time_rest, y.time_pay FROM yyyymmdds y WHERE y.yyyymm_seisan = '${yyyymm}' ORDER BY y.id_users, y.yyyymmdd asc`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

module.exports = {
  findPKey,
  findYyyymmInfoByUserId,
  findByYyyymmAndUserid,
  findByIntervalAndUserid,
  findByYyyymmSeisanAndUserid,
  insert,
  update,
  remove,
  download,
};