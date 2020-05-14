const AdminDao = require("../models/adminDao");

 class AdminList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {AdminDao} adminDao
    */
   constructor(adminDao) {
     this.adminDao = adminDao;
   }
   
   async add(req, res) {
     const item = req.body;

     var data = await this.adminDao.addItem(item);
    return data;
   }

   async checkUserName(req, res) {
    const querySpec = {
      query: "SELECT * FROM admin u WHERE u.username = '"+req.body.username+"'"
    };
    
    const items = await this.adminDao.find(querySpec);
    return items
  }

 }

 module.exports = AdminList;