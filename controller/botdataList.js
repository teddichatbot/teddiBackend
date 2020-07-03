const BotDataDao = require("../models/botDataDao");

 class BotDataList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {BotDataDao} botDataDao
    */
   constructor(botDataDao) {
     this.botDataDao = botDataDao;
   }
   
  //  async add(req, res) {
  //    const item = req.body;

  //    var data = await this.adminDao.addItem(item);
  //   return data;
  //  }

   async getAllList(req, res) {
    var sql = 'SELECT * FROM botdata' ;
  
    const querySpec = {
      query: sql
    };
    const items = await this.botDataDao.find(querySpec);
    return items
  }
  async checkConversationId(req, res) {
    // console.log("SELECT * FROM botdata c WHERE c.document.userInfo.conversationId = '"+req.body.conversationId+"'")
    const querySpec = {
      query: "SELECT * FROM botdata c WHERE c.document.userInfo.conversationId = '"+req.body.conversationId+"'"
    };

    const items = await this.botDataDao.find(querySpec);
    
    return items
  }

  async setUserName(itemId, fname, lname) {
    console.log('itemId list', itemId)
    var data = await this.botDataDao.updateUserName(itemId, fname, lname);
    return data;
  }

 }

 module.exports = BotDataList;