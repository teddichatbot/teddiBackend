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
    var sql = 'SELECT * FROM chapterFaq cf WHERE cf.faq = "'+req.body.faq+'"' ;
 
    const querySpec = {
      query: sql
    };
    const items = await this.chapterWiseFaqDao.find(querySpec);
    return items
  }

 }

 module.exports = ChapterWiseFaqList;