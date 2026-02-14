import { db } from './firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const NOTES_COLLECTION = 'notes'

/**
 * Fetch ALL notes from Firestore (shared across all students).
 * Notes are uploaded by admin via the CLI organizer tool.
 * @returns {Promise<Array>} All notes sorted by upload date.
 */
export async function getAllNotes() {
    try {
        const q = query(
            collection(db, NOTES_COLLECTION),
            orderBy('uploadedAt', 'desc')
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error('Error fetching notes:', error)
        // Fallback without ordering (if index not ready)
        try {
            const snapshot = await getDocs(collection(db, NOTES_COLLECTION))
            const notes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            notes.sort((a, b) => {
                const aTime = a.uploadedAt?.seconds || 0
                const bTime = b.uploadedAt?.seconds || 0
                return bTime - aTime
            })
            return notes
        } catch (fallbackError) {
            console.error('Fallback fetch also failed:', fallbackError)
            return []
        }
    }
}
