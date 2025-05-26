const knex = require('../db/knex.js').connect();
const log4js = require('log4js');
const logger = log4js.configure('./config/log4js-config.json').getLogger();
const common = require('../util/common');

const findPKey = async (yyyymmdd) => {
  const retObj = await knex.from('yyyymmdds_enso').where({yyyymmdd: yyyymmdd });
  return retObj;
};

const insert = async (inObj) => {
  const query = 'insert into yyyymmdds_enso values (' + common.retValueForSql(inObj.yyyymmdd) + ',' + common.retValueForSql(inObj.id_users) + ',' + common.retValueForSql(inObj.level) + ',' + common.retValueForSql(inObj.color) + ',' + common.retValueForSql(inObj.nigori) + ',' + common.retValueForSql(inObj.nioi) + ',' + common.retValueForSql(inObj.aji) + ',' + common.retValueForSql(inObj.bikou) + ',' +  common.retValueForSql(inObj.yyyymmddhhmmss_add) + ',' + common.retValueForSql(inObj.yyyymmddhhmmss_upd) + ');';
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const update = async (inObj) => {
  const query = 'update yyyymmdds_enso set id_users = ' + common.retValueForSql(inObj.id_users) + ', level = ' + parseFloat(inObj.level) + ', color = ' + common.retValueForSql(inObj.color) + ', nigori = ' + common.retValueForSql(inObj.nigori) + ', nioi = ' + common.retValueForSql(inObj.nioi) + ', aji = ' + common.retValueForSql(inObj.aji) + ',  bikou = ' + common.retValueForSql(inObj.bikou) + ', yyyymmddhhmmss_add = '  + common.retValueForSql(inObj.yyyymmddhhmmss_add) + ', yyyymmddhhmmss_upd = ' + common.retValueForSql(inObj.yyyymmddhhmmss_add) + ' where yyyymmdd = \'' + inObj.yyyymmdd + '\';';
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

// const remove = async (id_users, yyyymmdd) => {
//   try {
//     const query = "delete from yyyymmdds where id_users = '" + id_users + "' and yyyymmdd = '" + yyyymmdd + "';"
//     const retObj = await knex.raw(query)
//     return retObj[0];
//   } catch(err) {
//     throw err;
//   }
// };

// const download = async (yyyymm) => {
//   try {
//     const query = "SELECT y.id_users, y.yyyymmdd, y.time_start, y.time_end, y.time_start_upd, y.time_end_upd, y.makanai, y.isYuukyuu, y.time_rest, y.time_pay FROM yyyymmdds y WHERE y.yyyymm_seisan = '" + yyyymm + "' ORDER BY y.id_users, y.yyyymmdd asc";
//     logger.info(query);
//     const retObj = await knex.raw(query);
//     return retObj[0];
//   } catch(err) {
//     throw err;
//   }
// }

module.exports = {
  findPKey,
  insert,
  update,
};