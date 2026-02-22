import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from './firebase'
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Singleton promise to prevent double-fetching in React StrictMode
let currentFetchPromise = null

export const getDailyQuote = async () => {
    // If a request is already in progress, return the existing promise
    if (currentFetchPromise) {
        return currentFetchPromise
    }

    currentFetchPromise = (async () => {
        const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // 1. Check Firestore for today's cached quote
        try {
            const quotesRef = collection(db, 'daily_quotes')
            const q = query(quotesRef, where('date', '==', todayStr))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data()
                return { text: docData.text, author: docData.author }
            }
        } catch (firestoreError) {
            console.error('QuoteService: Error checking Firestore cache:', firestoreError)
        }

        // 2. No cached quote — fetch from Gemini API
        if (!API_KEY) {
            console.warn('QuoteService: VITE_GEMINI_API_KEY is not set.')
            return getFallbackQuote()
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

            const result = await model.generateContent(
                `Write a short, funny, and motivational quote (max 4 lines) for engineering students about coding, bugs, or studying. strictly return valid JSON format: { "text": "...", "author": "..." }`
            )

            const response = await result.response
            const raw = response.text()
            const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim()
            const data = JSON.parse(cleanJson)

            // 3. Cache the new quote in Firestore
            try {
                await addDoc(collection(db, 'daily_quotes'), {
                    text: data.text,
                    author: data.author,
                    date: todayStr,
                    createdAt: Timestamp.now(),
                })
            } catch (saveError) {
                console.error('QuoteService: Failed to cache quote in Firestore:', saveError)
            }

            return { text: data.text, author: data.author }
        } catch (error) {
            console.error('QuoteService: API error:', error)
            return getFallbackQuote(error.message)
        }
    })()

    try {
        return await currentFetchPromise
    } finally {
        // Reset so future calls can fetch again (e.g. next day)
        currentFetchPromise = null
    }
}

const getFallbackQuote = (errorMessage = null) => ({
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    error: true,
    errorMessage: errorMessage ?? 'Unknown error',
})
