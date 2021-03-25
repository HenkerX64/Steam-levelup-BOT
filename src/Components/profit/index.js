const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');

const utils = require('../../Utils');
const log = require('../log');

const Profit = require('./constants/profit');

const init = (period) => {
  if (!fs.existsSync(`./Data/History/Profit/${period}.json`)) {
    fs.writeFile(
      `./Data/History/Profit/${period}.json`,
      JSON.stringify(Profit),
      {
        flags: 'w',
      },
      (ERR) => {
        if (ERR) {
          log.error(`An error occurred while writing profit file: ${ERR}`);
        }
      }
    );
  }
};

const read = async (period) => {
  try {
    init(period);

    return JSON.parse(
      await utils.readFileAsync(`./Data/History/Profit/${period}.json`)
    );
  } catch (error) {
    throw new Error(error);
  }
};

const write = async (profit, period) => {
  const data = await read(period);
  const add = (a, b) => _.defaultTo(_.add(a, b), undefined);
  const profited = _.mergeWith({}, data, profit, add);

  fs.writeFile(
    `./Data/History/Profit/${period}.json`,
    JSON.stringify(profited),
    (ERR) => {
      if (ERR) {
        log.error(`An error occurred while writing profit file: ${ERR}`);
      }
    }
  );
};

const calculate = async (offer) => {
  try {
    const profit = _.cloneDeep(Profit);

    if (offer.data('commandused').search(/BUY/) !== -1) {
      profit.totaltrades += 1;
      if (offer.data('commandused').search(/CSGO/) !== -1) {
        profit.buy.csgo.sets += parseInt(offer.data('amountofsets'), 10);
        profit.buy.csgo.currency += parseInt(offer.data('amountofkeys'), 10);
        profit.status.csgo += parseInt(offer.data('amountofkeys'), 10);
        profit.status.sets -= parseInt(offer.data('amountofsets'), 10);
      }
      if (offer.data('commandused').search(/HYDRA/) !== -1) {
        profit.buy.hydra.sets += parseInt(offer.data('amountofsets'), 10);
        profit.buy.hydra.currency += parseInt(offer.data('amountofkeys'), 10);
        profit.status.hydra += parseInt(offer.data('amountofkeys'), 10);
        profit.status.sets -= parseInt(offer.data('amountofsets'), 10);
      }
      if (offer.data('commandused').search(/TF/) !== -1) {
        profit.buy.tf.sets += parseInt(offer.data('amountofsets'), 10);
        profit.buy.tf.currency += parseInt(offer.data('amountofkeys'), 10);
        profit.status.tf += parseInt(offer.data('amountofkeys'), 10);
        profit.status.sets -= parseInt(offer.data('amountofsets'), 10);
      }
      if (offer.data('commandused').search(/GEMS/) !== -1) {
        profit.buy.gems.sets += parseInt(offer.data('amountofsets'), 10);
        profit.buy.gems.currency += parseInt(offer.data('amountofgems'), 10);
        profit.status.gems += parseInt(offer.data('amountofgems'), 10);
        profit.status.sets -= parseInt(offer.data('amountofsets'), 10);
      }
    }
    if (offer.data('commandused').search(/SELL/) !== -1) {
      profit.totaltrades += 1;
      if (offer.data('commandused').search(/CSGO/) !== -1) {
        profit.sell.csgo.sets += parseInt(offer.data('amountofsets'), 10);
        profit.sell.csgo.currency += parseInt(offer.data('amountofkeys'), 10);
        profit.status.csgo -= parseInt(offer.data('amountofkeys'), 10);
        profit.status.sets += parseInt(offer.data('amountofsets'), 10);
      }
      if (offer.data('commandused').search(/HYDRA/) !== -1) {
        profit.sell.hydra.sets += parseInt(offer.data('amountofsets'), 10);
        profit.sell.hydra.currency += parseInt(offer.data('amountofkeys'), 10);
        profit.status.hydra -= parseInt(offer.data('amountofkeys'), 10);
        profit.status.sets += parseInt(offer.data('amountofsets'), 10);
      }
      if (offer.data('commandused').search(/TF/) !== -1) {
        profit.sell.tf.sets += parseInt(offer.data('amountofsets'), 10);
        profit.sell.tf.currency += parseInt(offer.data('amountofkeys'), 10);
        profit.status.tf -= parseInt(offer.data('amountofkeys'), 10);
        profit.status.sets += parseInt(offer.data('amountofsets'), 10);
      }
      if (offer.data('commandused').search(/GEMS/) !== -1) {
        profit.sell.gems.sets += parseInt(offer.data('amountofsets'), 10);
        profit.sell.gems.currency += parseInt(offer.data('amountofgems'), 10);
        profit.status.gems -= parseInt(offer.data('amountofgems'), 10);
        profit.status.sets += parseInt(offer.data('amountofsets'), 10);
      }
    }

    write(profit, `Daily/${moment().format('DD-MM-YYYY')}`);
    write(profit, `Monthly/${moment().format('MM-YYYY')}`);
    write(profit, `Yearly/${moment().format('YYYY')}`);
  } catch (error) {
    log.error(`An error occurred while getting profit file: ${error}`);
  }
};

module.exports = { calculate, read };