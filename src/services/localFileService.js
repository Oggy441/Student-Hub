const DB_NAME = 'StudentHubStorage'
const STORE_NAME = 'files'
const DB_VERSION = 1

/**
 * Open the IndexedDB database
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = (event) => {
            resolve(event.target.result)
        }

        request.onerror = (event) => {
            reject(`IndexedDB error: ${event.target.error}`)
        }
    })
}

/**
 * Save a file to IndexedDB and return a unique ID
 * @param {File} file 
 * @returns {Promise<string>} fileId
 */
export async function saveFileToLocal(file) {
    const db = await openDB()
    const fileId = `${Date.now()}_${file.name}`

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(file, fileId)

        request.onsuccess = () => resolve(fileId)
        request.onerror = () => reject('Failed to save file locally')
    })
}

/**
 * Retrieve a file from IndexedDB by ID
 * @param {string} fileId 
 * @returns {Promise<Blob>}
 */
export async function getFileFromLocal(fileId) {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(fileId)

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result)
            } else {
                reject('File not found')
            }
        }
        request.onerror = () => reject('Failed to retrieve file')
    })
}

/**
 * Generate a Blob URL for a file ID
 * @param {string} fileId 
 * @returns {Promise<string>} Blob URL
 */
export async function getLocalFileUrl(fileId) {
    try {
        const blob = await getFileFromLocal(fileId)
        return URL.createObjectURL(blob)
    } catch (error) {
        console.error(error)
        return null
    }
}
