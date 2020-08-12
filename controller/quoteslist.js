const QuotesDao = require("../models/quotesDao");

 class QuotesList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {QuotesDao} quotesDao
    */
   constructor(quotesDao) {
     this.quotesDao = quotesDao;
   }
   
   async addQuotes(req, res) {
     const item = req.body;

     var data = await this.quotesDao.addItem(item);
    return data;
   }

   async getAllQuotes(req, res) {
    const querySpec = {
      query: "SELECT * FROM loadScreenQuotes q"
    };

    const items = await this.quotesDao.find(querySpec);
    return items
   }

 }

 module.exports = QuotesList;