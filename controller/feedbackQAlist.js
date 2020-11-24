const FeedbackQADao = require("../models/feedbackQADao");

 class FeedbackQAList {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {FeedbackQADao} feedbackQADao
    */
   constructor(feedbackQADao) {
     this.feedbackQADao = feedbackQADao;
   }
   
   async addFeedbackQA(req, res) {
     const item = req.body;
     item.createdOn = new Date();
     var data = await this.feedbackQADao.addItem(item);
    return data;
   }

   async getAll(req, res) {
    const querySpec = {
      query: "SELECT * FROM feedbackQA q"
    };

    const items = await this.feedbackQADao.find(querySpec);
    return items
   }
   
   async getQAbyChapter(req, res) {
    const querySpec = {
      query: "SELECT * FROM feedbackQA q WHERE q.chapter='"+req.query.chapter+"'"
    };

    const items = await this.feedbackQADao.find(querySpec);
    return items
   }

 }

 module.exports = FeedbackQAList;