const RandomMsgDao = require("../models/randomMsgDao");

 class RandomMsgList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {RandomMsgDao} randomMsgDao
    */
   constructor(randomMsgDao) {
     this.randomMsgDao = randomMsgDao;
   }
   
   async addRandomMsg(req, res) {
     const item = req.body;
     var data = await this.randomMsgDao.addItem(item);
    return data;
   }

   async addRandomMsgForBulkInsert(respMsg, predict, chapterType) {
    const item = {};
    item.respMsg = respMsg;
    item.predict = predict;
    item.chapterType = chapterType;
    // console.log(item)
    var data = await this.randomMsgDao.addItem(item);
   return data;
  
  }

   async getMsgListByChapter(req, res){
      const querySpec = {
        query: "SELECT * FROM randomMessages c WHERE c.chapterType = '"+req.query.chapterType+"'"
      };
      
      const items = await this.randomMsgDao.find(querySpec);
      return items
   }

   async updateRandomMsg(req, res) {
    const item = req.body;
    var data = await this.randomMsgDao.updateMsgDetails(item);
   return data;
  }

 }

 module.exports = RandomMsgList;