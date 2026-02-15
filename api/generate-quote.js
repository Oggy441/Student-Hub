/**
 * Serverless function to generate quotes using Groq AI.
 * Uses direct HTTP fetch instead of SDK to avoid version issues.
 */
export default async function handler(req, res) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY

    if (!GROQ_API_KEY) {
        console.error('DIAGNOSIS: GROQ_API_KEY is missing from environment')
        return res.status(500).json({ error: 'GROQ API Key not configured on server' })
    }

    try {
        const prompt = `Generate a short, humorous, witty, and motivational quote specifically for a Computer Science student.
        It should be relatable to coders (bugs, coffee, deployment, etc.).
        Return ONLY a JSON object with two fields: "text" (the quote string) and "author" (the person who said it, or "Unknown" if generic). 
        Do not use markdown formatting.`

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 256,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Groq API error:', response.status, errorData)

            if (response.status === 401) {
                return res.status(500).json({ error: 'Invalid API key' })
            }
            if (response.status === 429) {
                return res.status(429).json({ error: 'Rate limit exceeded, try again later' })
            }
            throw new Error(`Groq API error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error('Invalid Groq response:', data)
            return res.status(500).json({ error: 'Invalid response from Groq API' })
        }

        const text = data.choices[0].message.content
        const quoteData = JSON.parse(text)

        // Validate response structure
        if (!quoteData.text || !quoteData.author) {
            console.error('Invalid quote format:', quoteData)
            return res.status(500).json({ error: 'Invalid quote format received' })
        }

        return res.status(200).json(quoteData)
    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Failed to generate quote', message: error.message })
    }
}
