// api/generate-quote.js
export default async function handler(req, res) {
    // Only allow POST requests (optional, but good practice)
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Get API key from environment variable
        const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

        if (!GOOGLE_API_KEY) {
            console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
            return res.status(500).json({
                error: 'API key not configured'
            })
        }

        // Call Google Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Generate a short, inspiring, and thought-provoking quote (max 20 words) suitable for students studying computer science or engineering. Return ONLY a JSON object with format: {"text": "quote here", "author": "original author or 'Anonymous' if self-created"}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 100,
                    }
                })
            }
        )

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Google API error:', response.status, errorData)
            throw new Error(`Google API returned ${response.status}`)
        }

        const data = await response.json()

        // Extract the generated text
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!generatedText) {
            throw new Error('No content in API response')
        }

        // Try to parse JSON from the response
        let quoteData
        try {
            // Remove markdown code blocks if present
            const cleanText = generatedText.replace(/```json\n?/g, '').replace(/```/g, '').trim()
            quoteData = JSON.parse(cleanText)
        } catch (parseError) {
            console.error('Failed to parse quote JSON:', generatedText)
            // Fallback: treat entire response as quote text
            quoteData = {
                text: generatedText.substring(0, 200), // Limit length
                author: 'Generated'
            }
        }

        // Validate response
        if (!quoteData.text || !quoteData.author) {
            throw new Error('Invalid quote format')
        }

        // Return the quote
        return res.status(200).json({
            text: quoteData.text,
            author: quoteData.author
        })

    } catch (error) {
        console.error('Error generating quote:', error)

        // Return a fallback quote instead of error
        return res.status(200).json({
            text: "The best way to predict the future is to invent it.",
            author: "Alan Kay",
            fallback: true
        })
    }
}