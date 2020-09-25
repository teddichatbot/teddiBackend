// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

// For simplicity we'll set a constant partition key
const partitionKey = undefined
class RandomMsgDao {
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

  async updateMsgDetails(item){
    const doc = await this.getItem(item.msgId)

    doc.respMsg = item.respMsg;
    doc.predict = item.predict;
    doc.chapterType = item.chapterType;
    
    const { resource: replaced } = await this.container
      .item(item.msgId, partitionKey)
      .replace(doc)
    return replaced
  }

  async getItem(itemId) {
    const { resource } = await this.container.item(itemId, partitionKey).read()
    return resource
  }
}

module.exports = RandomMsgDao