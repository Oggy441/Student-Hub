import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

        // Check for API Key
        const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY
        if (!API_KEY) {
            console.warn('Google AI API Key not found. Using fallback quote.')
            return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
        }

        // If not found, generate a new one
        console.log('Generating new quote with Google AI...')
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a short, humorous, witty, and motivational quote specifically for a Computer Science student.
        It should be relatable to coders (bugs, coffee, deployment, etc.).
        Return ONLY a JSON object with two fields: "text" (the quote string) and "author" (the person who said it, or "Unknown" if generic). 
        Do not use markdown formatting.`

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const quoteData = JSON.parse(jsonStr)

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
