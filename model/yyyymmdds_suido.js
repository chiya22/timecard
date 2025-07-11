const knex = require('../db/knex.js').connect();
const log4js = require('log4js');
const logger = log4js.configure('./config/log4js-config.json').getLogger();
const common = require('../util/common');

const findLastRecord = async () => {
  const query = 'select * from yyyymmdds_suido a where a.yyyymmddhhmmss_add = (select MAX(yyyymmddhhmmss_add) from yyyymmdds_suido)';
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const insert = async (inObj) => {
  const query = `insert into yyyymmdds_suido values (${common.retValueForSql(inObj.yyyymmddhhmmss_add)},${common.retValueForSql(inObj.metervalue)});`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

const findsFromLastMonthToCurrent = async (yyyymm) => {
  const query = `select * from yyyymmdds_suido ys where ys.yyyymmddhhmmss_add >= '${yyyymm}01' order by ys.yyyymmddhhmmss_add desc`;
  logger.info(query);
  const retObj = await knex.raw(query);
  return retObj[0];
};

module.exports = {
  findLastRecord,
  insert,
  findsFromLastMonthToCurrent,
};
