/**
 * Serverless function to generate quotes using Gemini AI via REST API.
 * This avoids SDK dependency issues in serverless environments.
 */
export default async function handler(req, res) {
    const API_KEY = process.env.GOOGLE_AI_KEY

    // Set CORS headers to allow requests from any origin (or restrict to your domain)
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (!API_KEY) {
        console.error('Missing GOOGLE_AI_KEY environment variable')
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' })
    }

    try {
        const prompt = `Generate a short, humorous, witty, and motivational quote specifically for a Computer Science student.
        It should be relatable to coders (bugs, coffee, deployment, etc.).
        Return ONLY a JSON object with two fields: "text" (the quote string) and "author" (the person who said it, or "Unknown" if generic). 
        Do not use markdown formatting.`

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini API Check failed:', response.status, errorText)
            throw new Error(`Gemini API responded with ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text) {
            throw new Error('No text generated from Gemini API')
        }

        // Robust JSON extraction
        let jsonStr = text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            jsonStr = jsonMatch[0]
        }

        try {
            const quoteData = JSON.parse(jsonStr)
            return res.status(200).json(quoteData)
        } catch (parseError) {
            console.error('JSON Parse Error:', text)
            return res.status(500).json({
                error: 'Invalid response format from AI',
                details: text.substring(0, 100)
            })
        }

    } catch (error) {
        console.error('Handler Error:', error)
        return res.status(500).json({
            error: 'Failed to generate quote',
            message: error.message
        })
    }
}
