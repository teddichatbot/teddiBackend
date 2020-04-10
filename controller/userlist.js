const UserDao = require("../models/userDao");

 class UserList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {UserDao} userDao
    */
   constructor(userDao) {
     this.userDao = userDao;
   }
   
   async addUser(req, res) {
     const item = req.body;

     var data = await this.userDao.addItem(item);
    //  res.redirect("/");
    return data;
   }

   async userRegister(req, res) {
    const id = req.body.id;
    var data = await this.userDao.userRegistration(id,req);
    return data;
  }

   async checkEmail(req, res) {
    const querySpec = {
      query: "SELECT * FROM users u WHERE u.email = '"+req.body.email+"'"
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

  async checkConversationId(req, res) {
    const querySpec = {
      query: "SELECT * FROM users u WHERE u.conversationId = '"+req.body.conversationId+"'"
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

 }

 module.exports = UserList;