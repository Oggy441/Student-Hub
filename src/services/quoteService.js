import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Initialize the API with the key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const getDailyQuote = async () => {
    // 1. Check Firestore for today's quote
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const quotesRef = collection(db, 'daily_quotes');
        const q = query(quotesRef, where('date', '==', todayStr));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Found a quote for today in Firestore
            const docData = querySnapshot.docs[0].data();
            console.log('QuoteService: Retrieved quote from Firestore for date:', todayStr);
            return {
                text: docData.text,
                author: docData.author
            };
        }
    } catch (firestoreError) {
        console.error("QuoteService: Error checking Firestore:", firestoreError);
        // Continue to API fallback if Firestore fails, don't break the app
    }

    // 2. If no quote in Firestore (or error), fetch from Gemini API
    console.log('QuoteService: No quote in Firestore for today. Fetching from API...');

    // Debugging: Check if API Key is present
    if (!API_KEY) {
        console.warn('QuoteService: VITE_GEMINI_API_KEY is missing in .env');
        return getFallbackQuote();
    }

    try {
        // Use the Web-compatible SDK
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Use the standard free model (v1beta) - trying gemini-pro/flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log('QuoteService: Requesting quote from model: gemini-1.5-flash');

        const result = await model.generateContent(
            `Write a short, funny, and motivational quote for engineering students about coding, bugs, or studying. strictly return valid JSON format: { "text": "...", "author": "..." }`
        );

        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        // 3. Save the new quote to Firestore
        try {
            await addDoc(collection(db, 'daily_quotes'), {
                text: data.text,
                author: data.author,
                date: todayStr,
                createdAt: Timestamp.now()
            });
            console.log('QuoteService: Saved new quote to Firestore');
        } catch (saveError) {
            console.error("QuoteService: Failed to save quote to Firestore:", saveError);
        }

        return {
            text: data.text,
            author: data.author
        };

    } catch (error) {
        console.error("QuoteService Error:", error);
        return getFallbackQuote(error.message);
    }
};

const getFallbackQuote = (errorMessage = null) => {
    return {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        error: true,
        errorMessage: errorMessage || "Unknown error"
    };
};
