require('dotenv').config()
const config = {};
config.ENV_MOOD = process.env.ENV_MOOD;
config.host = (config.ENV_MOOD == 'DEV') ? "https://teddi-cosmosdb-instance-sql.documents.azure.com:443/" : "https://teddi-db.documents.azure.com:443/";
config.authKey = (config.ENV_MOOD == 'DEV') ? "FAtkho7iQAq7CvuArBfpOb9MD1ByFCVPEIkUpRp8NCtN3N0cGptD8xANihUYYpZZJf4McyQfOCCfCIdjZMdgYQ==" : "QywTQMRPKGGROlyIxmdAxvm4uWumPPbeGjGzbgsFg4710K1pLapMcBn5woKGU1k7YTXn1GGYaXtBNSXpCZPoEw==";
config.databaseId = "botdocs";
config.containerUserId = "users";
config.containerChatHistoryId = "chatHistory";
config.containerLoadingScreenQuotesId = "loadScreenQuotes";
config.containerAdminId = "admin";
config.containerChapterWiseFaqId = "chapterFaq";
// config.containerChapterWiseFaqId = "chapterFaqTest";
config.containerUserSessionId = "botdata";
config.containerPostcodeId = "postcodes";
config.containerFeedbackId = "feedback";
config.containerFeedbackQAId = "feedbackQA";
config.containerCategoryId = "category";
config.containerRecipesId = "recipes";
config.containerRandomMsgId = "randomMessages";


module.exports = config;