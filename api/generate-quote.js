// api/generate-quote.js - GROQ VERSION (SIMPLER)
export default async function handler(req, res) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Return JSON: {"text": "quote", "author": "author"}' },
                    { role: 'user', content: 'Generate inspiring quote for students (max 20 words)' }
                ],
                temperature: 0.8,
                max_tokens: 100,
            })
        })

        const data = await response.json()
        const content = data.choices[0].message.content.trim()
        const cleaned = content.replace(/```json|```/g, '').trim()

        return res.status(200).json(JSON.parse(cleaned))
    } catch {
        return res.status(200).json({
            text: "Success is the sum of small efforts repeated day in and day out.",
            author: "Robert Collier"
        })
    }
}