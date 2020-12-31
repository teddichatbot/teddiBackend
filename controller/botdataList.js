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
    var data = await this.botDataDao.updateUserName(itemId, fname, lname);
    return data;
  }

  async lastChatDaysCount(req, res) {
    const querySpec = {
      query: "SELECT * FROM botdata c WHERE c.document.userInfo.conversationId = '"+req.query.conversationId+"'"
    };

    const items = await this.botDataDao.find(querySpec);
    let daysdiff = parseInt((Date.now() - items[0].document.userInfo.convLastTime)/(1000*86400))
    return daysdiff
  }

  async reminderAllUserForTeddiExpiration(req, res) {
    const querySpec = {
      query: "SELECT c.document.userInfo.conversationId, c.document.userInfo.convLastTime FROM c"
    };

    const items = await this.botDataDao.find(querySpec);
    let filtereddata = items.filter(data=>{
      return parseInt((Date.now() - data.convLastTime)/(1000*86400)) > 11 && parseInt((Date.now() - data.convLastTime)/(1000*86400)) < 14
    })
    return filtereddata;
  }

 }

 module.exports = BotDataList;