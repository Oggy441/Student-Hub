import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Fallback quotes in case API fails or key is missing
const FALLBACK_QUOTES = [
    {
        text: "The best way to predict the future is to invent it.",
        author: "Alan Kay"
    },
    {
        text: "Talk is cheap. Show me the code.",
        author: "Linus Torvalds"
    },
    {
        text: "Programs must be written for people to read, and only incidentally for machines to execute.",
        author: "Harold Abelson"
    },
    {
        text: "Simplicity is the soul of efficiency.",
        author: "Austin Freeman"
    }
]

export const getDailyQuote = async () => {
    try {
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const quoteRef = doc(db, 'daily_quotes', today)
        const quoteSnap = await getDoc(quoteRef)

        if (quoteSnap.exists()) {
            return quoteSnap.data()
        }

        // Call Secure Backend API
        console.log('Generating new quote via secure backend...')
        const response = await fetch('/api/generate-quote')

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `Failed to generate quote: ${response.status}`)
        }

        const quoteData = await response.json()

        // Save to Firestore
        await setDoc(quoteRef, {
            ...quoteData,
            date: today,
            createdAt: new Date().toISOString()
        })

        return quoteData

    } catch (error) {
        console.error('Error fetching/generating quote:', error)
        // Return random fallback
        return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
    }
}
