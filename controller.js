'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const modelIn = require('../../../modeldb/incoming');
const replylog = require('../../../modeldb/reply_log')
const logger = require('../../../config/logger');

exports.incomingMsg = async function (req, res) {
    logger.debug(moment().format('YYYY-MM-DD HH:mm:ss') + '| Insert DB - Incoming: |' + JSON.stringify(req.body));
    let hasil,respon;

    try {
      if(req.body.results[0]['message'].type === 'TEXT')
      {
        respon = req.body.results[0].message.text.toLowerCase().replace(/\s/g, '');
      }
      else if(req.body.results[0]['message'].type === 'IMAGE' || req.body.results[0]['message'].type === 'DOCUMENT' )
      {
        logger.debug(`sending file ${req.body.results[0]['message'].type} from ${req.body.results[0].from} with caption ${req.body.results[0].message.caption}`);
        respon = {
          caption: req.body.results[0].message.caption,
          url: req.body.results[0].message.url
        }
      }
      else
      {
        respon = 'default'
      }

        await modelIn.create({
          id: uuidv4(),
          from_: req.body.results[0]['from'],
          to_: req.body.results[0]['to'],
          integrationType: req.body.results[0]['integrationType'],
          receivedAt: moment(req.body.results[0]['receivedAt']).format('YYYY-MM-DD, HH:mm:ss'),
          messageId: req.body.results[0]['messageId'],
          pairedMessageId: req.body.results[0]['pairedMessageId'],
          callbackData: req.body.results[0]['callbackData'],
          message: respon,
          price: req.body.results[0]['price'].pricePerMessage
        });

        //checking reply from table keyword
        let from = req.body.results[0].from;

        // checking respon in database, if keyword not match, go to manual logic code
        let cek = await replylog.count({
          where: {
            keyword: respon
          }
        });

        logger.debug(cek + '| CEK|');
        if (cek == 0) {
          let a = respon.split('#');
          if (a[1] == 'da') {
            hasil = await utils.findOidByKtp(a[2]);
           if (hasil.status != '200')
           {
             respon = '!ESB-00-000';
             await utils.tomq(respon, from, req.body.results[0]['messageId']);
           }
           else
           {
             hasil = await utils.getContractList(hasil.message.data.data[0]['oid']);
             if(hasil.status != '200')
             {
               respon = 'contractObjectnotmatch';
               await utils.tomq(respon, from, req.body.results[0]['messageId']);
             }
             else
             {
               hasil = hasil.message.data.data;
               logger.debug('searching contract number : ', a[3]);
               let contractObject = hasil.find((el) => {
                 return el.contractNo == a[3];
               });
               if (contractObject == null || contractObject == undefined || contractObject == '' || !contractObject)
               {
                 respon = 'contractObjectnotmatch';
                 await utils.tomq(respon, from, req.body.results[0]['messageId']);
               }
               else
               {
                 hasil = await utils.InquiryPayment(a[3]);
                 if (hasil.status != '200') {
                   respon = '404';
                   await utils.tomq(respon, from, req.body.results[0]['messageId']);
                 }
                 else
                 {
                   await utils.tomq('verifikasiangsuran', from, req.body.results[0]['messageId'], hasil);
                 }
               }
             }
           }
          }
          else if (a[1] == 'rp') {
            hasil = await utils.findOidByKtp(a[2]);
            if (hasil.status != '200') {
              respon = '!ESB-00-000!';
              await utils.tomq(respon, from, req.body.results[0]['messageId']);
            }
            else {
              let doc = await utils.pdfWA(a[3], from, req.body.results[0]['messageId']);
            }
          }
          else {
            if (respon.includes("#")) {
              await utils.tomq('wrongformat', from, req.body.results[0]['messageId']);
            }
            else {
              await utils.tomq('default', from, req.body.results[0]['messageId']);
            }
          }
        }
        else
        {
          await utils.tomq(respon, from, req.body.results[0]['messageId']);
        }
      return res.json(rsmg());
    }
    catch (e) {
      logger.error(moment().format('YYYY-MM-DD HH:mm:ss') + '| ERROR - Incoming Flow |');
      logger.error(e.toString());
    }
};