
import { onerror, log, error, handleRequestCallback } from './helpers.js';

export default class DB {

    constructor(dbName, version, options = {}) {
        if (!window.indexedDB) {
            throw ("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
        }

        const { onsuccess, onupgradeneeded } = options;
        this.name = dbName;
        this.version = version || 1;



        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)


        // Opening a database is just like any other operation — you have to "request" it.
        this.req = this.indexedDB.open(this.name, this.version);
        this.req.onblocked = onerror;
        this.req.onerror = onerror;
        this.req.onsuccess = (e) => {
            this.db = this.req.result;
            log(`${this.name} database initialised successfully`);
            onsuccess && onsuccess(e);
        }

        this.req.onupgradeneeded = (e) => {
            this.db = this.req.result;
            log(`Databse onupgraded successfully ${this.name}`);
            if (this.db.objectStoreNames.contains(this.name)) {
                this.db.deleteObjectStore(this.name);
            }
            this.db.createObjectStore(this.name, { keyPath: 'id', autoIncrement: true });
            log(`Databse ObjectStore created successfully ${this.name}`);
            onupgradeneeded && onupgradeneeded(e);
        }


    }

    getStore(mode = "readonly") {
        return this.db.transaction(this.name, mode).objectStore(this.name);
    }

    get store() {
        return this.getStore();
    }

    insert(data, cb) {
        const tx = this.db.transaction([this.name], "readwrite");
        tx.oncomplete = e => log('Transaction Done');

        const req = tx.objectStore(this.name).put(data);
        handleRequestCallback(req, cb);
    }


    insertAll(data, cb) {
        if (!Array.isArray(data)) throw new TypeError(`insertAll requires Array, you have given ${typeof data}`)
        data.forEach(this.insert.bind(this))
        cb && cb(data);
    }


    get(key, cb) {
        handleRequestCallback(this.store.get(key), cb);

    }

    getAll(cb) {
        handleRequestCallback(this.store.getAll(), cb);
    }

    delete(key, cb) {
        handleRequestCallback(
            this.getStore('readwrite').delete(key),
            cb
        );
    }

    update(id, updates, cb) {
        const store = this.getStore('readwrite');
        const req = store.get(id);
        req.onerror = onerror;
        req.onsuccess = function (e) {
            let data = e.target.result;
            if (data) {
                data = { ...data, ...updates };
                const reqUpdate = store.put(data);
                reqUpdate.onerror = onerror;
                reqUpdate.onsuccess = function (e) {
                    log('Record updated successfully', updates)
                    cb(null, e);
                };
            }
            else {
                error(`No Record Found to update for id(${id})`)
                cb(true, null)
            }
        };
    }
}