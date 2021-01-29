const { json } = require("body-parser");
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

   async getUserFeedbackOfASingleChapter(req, res){
    const querySpec = {
      query: "SELECT * FROM feedback c WHERE c.conversationId = '"+req.body.conversationId+"' AND c.chapterType='"+req.body.chapterType+"'"
    };
    // console.log(querySpec)
    const items = await this.feedbackDao.find(querySpec);
    return items
  }
  async updateFeedback(itemId, payload) {
    var data = await this.feedbackDao.updateItem(itemId,payload);
    return data;
  }

  async getListForExporting(req, res) {
    const querySpec = {
      query: "SELECT * FROM feedback q WHERE q.chapterType='"+req.body.chapterType+"' AND q.createdOn>='"+req.body.startDate+"' AND q.createdOn<='"+req.body.endDate+"'"
    };
    const items = await this.feedbackDao.find(querySpec);
    return items
  }

  async feedBackListByConvIds(req, res) {
    let convIds = JSON.stringify(req.body.convIds)
    const querySpec = {
      query: "SELECT * FROM feedback q WHERE ARRAY_CONTAINS("+convIds+" ,q.conversationId)"
    };

    const items = await this.feedbackDao.find(querySpec);
    return items
  }
 }

 module.exports = FeedbackList;