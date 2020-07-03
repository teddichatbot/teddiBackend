const ChapterWiseFaqDao = require("../models/chapterWiseFAQDao");

 class ChapterWiseFaqList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {ChapterWiseFaqDao} chapterWiseFaqDao
    */
    constructor(chapterWiseFaqDao) {
      this.chapterWiseFaqDao = chapterWiseFaqDao;
    }  
   
    async addChapterWiseFaq(req, res) {
      const item = req.body;

      var data = await this.chapterWiseFaqDao.addItem(item);
      return data;
    }

    async checkFaq(req, res) {
      // var sql = 'SELECT * FROM chapterFaq cf WHERE cf.faq = "'+req.body.faq+'"' ;
      var sql = 'SELECT * FROM chapterFaq cf WHERE ARRAY_CONTAINS (cf.faq, "'+req.body.faq+'")' ;
  
      const querySpec = {
        query: sql
      };
      const items = await this.chapterWiseFaqDao.find(querySpec);
      return items
    }

    async faqList(req, res) {
      var sql = 'SELECT * FROM chapterFaq' ;
  
      const querySpec = {
        query: sql
      };
      const items = await this.chapterWiseFaqDao.find(querySpec);
      return items
    }
    async faqListByChapterName(req, res) {
      var sql = 'SELECT * FROM chapterFaq cf WHERE cf.chapterName= "'+req.query.chapterName+'"' ;
  
      const querySpec = {
        query: sql
      };
      const items = await this.chapterWiseFaqDao.find(querySpec);
      return items
    }

    async updateChapterWiseFaq(payload) {
      var data = await this.chapterWiseFaqDao.updateItem(payload.faqId, payload);
      return data;
    }

 }

 module.exports = ChapterWiseFaqList;