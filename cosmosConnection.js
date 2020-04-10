const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./config')

const cosmosClient = new CosmosClient({
    endpoint: config.host,
    key: config.authKey
  })

module.exports = cosmosClient;