const FeedbackDao = require("../models/feedbackDao");

 class FeedbackList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {FeedbackDao} feedbackDao
    */
   constructor(feedbackDao) {
     this.feedbackDao = feedbackDao;
   }
   
   async addFeedback(req, res) {
     const item = req.body;
     item.createdOn = new Date();
     var data = await this.feedbackDao.addItem(item);
    return data;
   }

   async getAll(req, res) {
    const querySpec = {
      query: "SELECT * FROM feedback q"
    };

    const items = await this.feedbackDao.find(querySpec);
    return items
   }

   async getFeedbackListBySingleUser(req, res){
      const querySpec = {
        query: "SELECT * FROM feedback c WHERE c.conversationId = '"+req.params.catrgotyId+"'"
      };
      // console.log(querySpec)
      const items = await this.feedbackDao.find(querySpec);
      return items
   }

 }

 module.exports = FeedbackList;