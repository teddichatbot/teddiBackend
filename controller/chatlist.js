const ChatDao = require("../models/chatDao");

 class ChatList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {ChatDao} chatDao
    */
   constructor(chatDao) {
     this.chatDao = chatDao;
   }
   
   async saveChat(req, res) {
     const item = req.body;

     var data = await this.chatDao.addItem(item);
    return data;
   }

   async chatHistory(req, res) {
    var sql = 'SELECT * FROM chatHistory ch WHERE ch.conversationId = "'+req.body.conversationId+'" AND ch.chapterType = "'+req.body.chapterType+'" ORDER BY ch._ts DESC OFFSET '+req.body.offset+' LIMIT '+req.body.limit ;
 
    const querySpec = {
      query: sql
    };
    const items = await this.chatDao.find(querySpec);
    return items
  }

 }

 module.exports = ChatList;