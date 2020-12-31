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

  async forgotPassword(itemId) {
    var data = await this.userDao.forgotPassword(itemId);
    return data;
  }

  async resetPassword(itemId,newPassword) {
    var data = await this.userDao.resetPassword(itemId,newPassword);
    return data;
  }

   async checkEmail(req, res) {
    const querySpec = {
      query: "SELECT * FROM users u WHERE u.email = '"+req.body.email+"'"
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

  async checkConversationId(conversationId) {
    const querySpec = {
      query: "SELECT * FROM users u WHERE u.conversationId = '"+conversationId+"'"
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

  async setName(itemId, fname, lname) {
    var data = await this.userDao.setName(itemId,fname,lname);
    return data;
  }

  async updateUserDetails(req, res) {
    const id = req.body.id;
    var data = await this.userDao.updateUserProfile(id,req);
    return data;
  }

  async giveFeedback(id) {
    var data = await this.userDao.giveFeedback(id);
    return data;
  }

  async getUsersList(req, res) {
    const querySpec = {
      query: "SELECT * FROM users u "
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

  async getUsersListByPostcode(req, res) {
    const querySpec = {
      query: "SELECT * FROM users u WHERE u.zip_code ='"+req.query.zip_code+"'"
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

  async giveFeedbackUsersList(req, res) {
    const querySpec = {
      query: "SELECT * FROM users u WHERE u.giveFeedback=true"
    };

    const items = await this.userDao.find(querySpec);
    return items
  }

  // async updateLatLongOfExistingUser(req, res) {
  async addNewParamsOfExistingUser(req, res) {
    const id = req.body.id;
    // var data = await this.userDao.updateLatLongOfExistingUser(id,req);
    var data = await this.userDao.addNewParamsOfExistingUser(id,req);
    return data;
  }

  async updateLastActiveTime(itemId) {
    var data = await this.userDao.updateLastActiveTime(itemId);
    return data;
  }
  
  async updateAccessEnabledBy(itemId, chkParam) {
    var data = await this.userDao.updateAccessEnabledBy(itemId, chkParam);
    return data;
  }

  async updateNotificationEnabled(itemId) {
    var data = await this.userDao.updateNotificationEnabled(itemId);
    return data;
  }

  async getAllFcmListForDailyNotification(req, res) {
    const querySpec = {
      query: "SELECT u.firstName, u.fcmToken FROM users u"
    };
    const items = await this.userDao.find(querySpec);
    let filtereddata = items.filter(data=>{
      return data.fcmToken
    })
    return filtereddata;
  }

 }

 module.exports = UserList;