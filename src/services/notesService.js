import { db } from './firebase'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

const NOTES_COLLECTION = 'notes'

export async function saveNote(userId, title, chapters = [], pageCount = 0, folder = 'Uncategorized') {
    try {
        const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
            userId,
            title,
            chapters, // Now empty array as AI is removed
            pageCount,
            folder,
            createdAt: serverTimestamp(),
            isAnalyzed: false // Mark as not analyzed
        })
        return { id: docRef.id, title, folder }
    } catch (error) {
        console.error('Error saving note:', error)
        throw error
    }
}

export async function getUserNotes(userId) {
    try {
        const q = query(
            collection(db, NOTES_COLLECTION),
            where('userId', '==', userId)
        )

        const snapshot = await getDocs(q)
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        // Sort client-side (newest first)
        notes.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0
            const bTime = b.createdAt?.seconds || 0
            return bTime - aTime
        })

        return notes
    } catch (error) {
        console.error('Error fetching notes:', error)
        throw error
    }
}

export async function deleteNote(noteId) {
    try {
        await deleteDoc(doc(db, NOTES_COLLECTION, noteId))
    } catch (error) {
        console.error('Error deleting note:', error)
        throw error
    }
}
