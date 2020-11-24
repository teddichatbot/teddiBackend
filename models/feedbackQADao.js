// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

// For simplicity we'll set a constant partition key
const partitionKey = undefined
class FeedbackQADao {
  /**
   * Manages reading, adding, and updating Users in Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId

    this.database = null
    this.container = null
  }

  async init() {
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })
    this.database = dbResponse.database
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId
    })
    this.container = coResponse.container
  }

  async find(querySpec) {
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    return resources
  }

  async addItem(item) {
    const { resource: doc } = await this.container.items.create(item)
    return doc
  }
}

module.exports = FeedbackQADao