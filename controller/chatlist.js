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

 }

 module.exports = ChatList;