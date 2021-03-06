import mongodb from 'mongodb'
import logSys from '../server/msgSystem.js'
import {config} from '../assets/config.js'

/**
 * Manage mongoDB database
 * @class
 */
export default class Database {
    /**
     * Prepare mongoDB instance
     * @constructor
     */
    constructor() {
        try {
            this.uri = `mongodb://127.0.0.1:27017/?authSource=${config.global.dbName}&readPreference=primary&ssl=false`
            this.name = config.global.dbName
            this.connection().then()
        } catch (error) {
            logSys(error, 'error')
            return error
        }
    }

    /**
     * Connection to mongoDB
     * @method
     * @returns {Promise<void>} a MongoClient instance
     */
    async connection() {
        try {
            let MongoClient = mongodb.MongoClient
            this.client = new MongoClient(this.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            await this.client.connect()
            this.db = this.client.db(this.name)
        } catch (error) {
            await logSys(error, 'error')
            return error
        }
    }

    /**
     * Get all documents in targeted collection into Array [MongoDB]
     * @method
     * @param {string} [collection] targeted
     * @returns {Promise<Array>} Get all documents in collection
     */
    async getCollection(collection) {
        try {
            return await this.db.collection(collection).find().toArray()
        } catch (error) {
            await logSys(error, 'error')
            return error
        }
    }

    /**
     * Add new document in specific collection [MongoDB]
     * @method
     * @param {string} [collection] targeted
     * @param {object} [primaryKey] ex: {key: value} to check if document already exist
     * @param {object} [fields] to create new document
     * @returns {Promise<string>} message for error or success
     */
    async createDocument(collection, primaryKey, fields) {
        try {
            this.document = await this.db.collection(collection).find(primaryKey)
            if (this.document.length !== undefined) {
                return 'already existing document'
            } else {
                await this.db.collection(collection).insertOne(fields, error => {
                    if (error) {
                        logSys(error, 'error')
                    }
                    logSys(`Document ADD with success in ${collection}`, 'success')
                })
                return 'create document'
            }
        } catch (error) {
            await logSys(error, 'error')
            return error
        }
    }

    /**
     * Edit one document in specific collection [MongoDB]
     * @method
     * @param {string} [collection] targeted
     * @param {object} [primaryKey] ex: {key: value} to find document
     * @param {object} [fields] to edit document
     * @returns {Promise<string>} message for error or success
     */
    async editDocument(collection, primaryKey, fields) {
        try {
            await this.db.collection(collection).updateOne(primaryKey, {$set: fields})
            await logSys(`Document EDIT with success in ${collection}`, 'success')
            return 'edited document'
        } catch (error) {
            await logSys(error, 'error')
        }
    }

    /**
     * Get document on specific collection [MongoDB]
     * @method
     * @param {string} [collection] targeted
     * @param {object} [primaryKey] ex: {key: value} to find document
     * @returns {Promise<string|*>}
     */
    async getDocument(collection, primaryKey) {
        try {
            this.document = await this.db.collection(collection).find(primaryKey).toArray()
            return this.document[0] === undefined ? 'document not found' : this.document[0]
        } catch (error) {
            await logSys(error, 'error')
        }
    }
}