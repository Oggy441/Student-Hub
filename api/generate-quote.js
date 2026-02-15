// api/generate-quote.js - GROQ VERSION (NO GOOGLE CODE!)
// This file should have ZERO mentions of @google/generative-ai

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        // Get Groq API key from environment
        const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY

        if (!GROQ_API_KEY) {
            console.error('Missing VITE_GROQ_API_KEY environment variable')
            throw new Error('Groq API key not configured')
        }

        console.log('Generating quote with Groq...')

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a quote generator. Generate inspiring quotes for students. Always return valid JSON with this exact format: {"text": "the quote here", "author": "author name"}. No markdown, no backticks, no extra text - ONLY the JSON object.'
                    },
                    {
                        role: 'user',
                        content: 'Generate a short inspiring quote (maximum 20 words) about learning, technology, personal growth, or education. Make it motivational for college students.'
                    }
                ],
                temperature: 0.8,
                max_tokens: 150,
                response_format: { type: "json_object" } // Force JSON response
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Groq API error:', response.status, errorText)
            throw new Error(`Groq API returned ${response.status}`)
        }

        const data = await response.json()
        console.log('Groq response:', data)

        // Extract the generated content
        const content = data.choices?.[0]?.message?.content

        if (!content) {
            throw new Error('No content in Groq response')
        }

        // Parse the JSON response
        let quoteData
        try {
            // Clean up any markdown code blocks (just in case)
            const cleanContent = content
                .replace(/```json\n?/g, '')
                .replace(/```/g, '')
                .trim()

            quoteData = JSON.parse(cleanContent)

            // Validate structure
            if (!quoteData.text || !quoteData.author) {
                throw new Error('Invalid quote structure from Groq')
            }

            console.log('Successfully parsed quote:', quoteData)

        } catch (parseError) {
            console.error('Failed to parse Groq response:', content)
            console.error('Parse error:', parseError)

            // Emergency fallback
            quoteData = {
                text: content.substring(0, 200).trim(),
                author: 'Generated'
            }
        }

        // Return the quote
        return res.status(200).json({
            text: quoteData.text,
            author: quoteData.author,
            source: 'groq'
        })

    } catch (error) {
        console.error('Error generating quote:', error.message)
        console.error('Full error:', error)

        // Return a fallback quote (always works)
        const fallbackQuotes = [
            { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
            { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
            { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
            { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" }
        ]

        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]

        return res.status(200).json({
            ...randomQuote,
            fallback: true,
            error: error.message
        })
    }
}