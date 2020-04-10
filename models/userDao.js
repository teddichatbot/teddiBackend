// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

// For simplicity we'll set a constant partition key
const partitionKey = undefined
class UserDao {
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
    var dateNow = new Date()
    item.convStartDate = dateNow.getDate() +"-"+ (dateNow.getMonth() + 1) +"-"+ dateNow.getFullYear()
    item.convStartTime = Date.now()
    item.convEndDate = dateNow.getDate() +"-"+ (dateNow.getMonth() + 1) +"-"+ dateNow.getFullYear()
    item.convEndTime = Date.now()
    item.registerCompleted = false
    item.email = ''
    item.password = ''
    item.child_dob = ''
    item.child_age_range = ''
    item.child_gender = ''
    item.parent_age_range = ''
    item.parent_gender = ''
    item.zip_code = ''
    item.occupation = ''
    item.ethnicityMaster = ''
    item.ethnicityChild = ''
    const { resource: doc } = await this.container.items.create(item)
    return doc
  }

  async userRegistration(itemId,req) {
    const doc = await this.getItem(itemId)
    var dateNow = new Date()
    doc.registrationDate = dateNow.getDate() +"-"+ (dateNow.getMonth() + 1) +"-"+ dateNow.getFullYear()
    doc.registrationTime = Date.now()
    doc.registerCompleted = true
    doc.email = req.body.email
    doc.password = req.body.password
    doc.child_dob = req.body.child_dob
    doc.child_age_range = req.body.child_age_range
    doc.child_gender = req.body.child_gender
    doc.parent_age_range = req.body.parent_age_range
    doc.parent_gender = req.body.parent_gender
    doc.zip_code = req.body.zip_code
    doc.occupation = req.body.occupation
    doc.ethnicityMaster = req.body.ethnicityMaster
    doc.ethnicityChild = req.body.ethnicityChild

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async getItem(itemId) {
    const { resource } = await this.container.item(itemId, partitionKey).read()
    return resource
  }
}

module.exports = UserDao