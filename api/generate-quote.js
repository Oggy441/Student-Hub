// api/generate-quote.js - FIXED VERSION
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
    // Add CORS headers for client requests
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

        if (!GOOGLE_API_KEY) {
            console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
            throw new Error('API key not configured')
        }

        console.log('Generating quote with Google Gemini...')

        // Initialize the Google Generative AI client
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)

        // ✅ FIXED: Use correct model name
        // Options: gemini-1.5-pro, gemini-1.5-flash-latest, gemini-pro
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        const prompt = `Generate a short, inspiring, and thought-provoking quote (maximum 20 words) suitable for students studying computer science or engineering. 

Return ONLY a valid JSON object with this exact format (no markdown, no backticks, no extra text):
{"text": "the quote here", "author": "original author name or 'Anonymous' if self-created"}

Example:
{"text": "The best way to predict the future is to invent it.", "author": "Alan Kay"}`

        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log('Raw API response:', text)

        // Parse the response
        let quoteData
        try {
            // Clean up the response (remove markdown code blocks if present)
            const cleanText = text
                .replace(/```json\n?/g, '')
                .replace(/```/g, '')
                .trim()

            quoteData = JSON.parse(cleanText)

            // Validate the structure
            if (!quoteData.text || !quoteData.author) {
                throw new Error('Invalid quote structure')
            }

        } catch (parseError) {
            console.error('Failed to parse quote JSON:', text)
            console.error('Parse error:', parseError)

            // Fallback: use the raw text as the quote
            quoteData = {
                text: text.substring(0, 200).trim(),
                author: 'Generated'
            }
        }

        console.log('Returning quote:', quoteData)

        // Return the quote
        return res.status(200).json({
            text: quoteData.text,
            author: quoteData.author,
            generated: true
        })

    } catch (error) {
        console.error('Error generating quote:', error)

        // Return a fallback quote on error
        const fallbackQuotes = [
            { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
            { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
            { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
            { text: "First, solve the problem. Then, write the code.", author: "John Johnson" }
        ]

        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]

        return res.status(200).json({
            ...randomQuote,
            fallback: true
        })
    }
}