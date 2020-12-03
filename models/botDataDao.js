// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

// For simplicity we'll set a constant partition key
const partitionKey = { paths: ["/id"] }
class BotdataDao {
  /**
   * Manages reading, adding, and updating Tasks in Cosmos DB
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
      id: this.collectionId, partitionKey
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

  // async addItem(item) {
  //   item.date = Date.now()
  //   const { resource: doc } = await this.container.items.create(item)
  //   return doc
  // }

  async updateUserName(itemId, fname, lname) {
    const doc = await this.getItem(itemId);
    // console.log(doc)
    doc.document.userInfo.firstName = fname
    doc.document.userInfo.lastName = lname

    const { resource: replaced } = await this.container
      // .item(itemId, partitionKey)
      .item(itemId, itemId)
      .replace(doc)
    return replaced
  }

  async getItem(itemId) {
    // const { resource } = await this.container.item(itemId, partitionKey).read()
    const { resource } = await this.container.item(itemId, itemId).read()
    return resource
  }
}

module.exports = BotdataDao