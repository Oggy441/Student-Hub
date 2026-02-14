const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// API Key from environment variables (Vercel)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

if (!GROQ_API_KEY) {
    console.error('Missing Groq API Key. Please set VITE_GROQ_API_KEY in your .env file or Vercel settings.')
}

/**
 * Splits extracted PDF text into structured chapters using Llama 3.3 via Groq.
 * @param {string} text - The raw text extracted from a PDF.
 * @param {string} filename - The original filename for context.
 * @returns {Promise<Array>} Array of chapter objects.
 */
export async function splitContentIntoChapters(text, filename) {
    // Truncate text to ~12000 chars to stay within token limits
    const truncatedText = text.length > 12000 ? text.substring(0, 12000) + '...' : text

    const prompt = `You are an academic document analyzer. Analyze this text extracted from a PDF titled "${filename}" and split it into logical chapters or sections.

For each chapter/section, provide:
1. title: A clear, descriptive title
2. summary: A 2-3 sentence summary of what the section covers
3. keyConcepts: An array of 3-5 key terms or concepts from that section
4. content: The relevant text content for that section (condensed if needed)

Return your response as a valid JSON array. Example format:
[
  {
    "title": "Chapter 1: Introduction",
    "summary": "This chapter introduces the fundamental concepts...",
    "keyConcepts": ["concept1", "concept2", "concept3"],
    "content": "The introduction covers..."
  }
]

If the text doesn't have clear chapters, create logical groupings based on topic changes.
If the text is too short or unclear, create at least one section with what's available.

IMPORTANT: Return ONLY the JSON array, no other text.

Here is the text to analyze:

${truncatedText}`

    const response = await fetch(GROQ_API_URL, {
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
                    content: 'You are a helpful academic assistant that analyzes documents and returns structured JSON data. Always return valid JSON arrays.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 4096,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    // Parse JSON from the response (handle markdown code blocks)
    let jsonStr = content
    if (content.startsWith('```')) {
        jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    }

    try {
        const chapters = JSON.parse(jsonStr)
        return Array.isArray(chapters) ? chapters : [chapters]
    } catch {
        // If JSON parsing fails, create a single chapter with the raw content
        return [{
            title: filename.replace('.pdf', ''),
            summary: 'Auto-generated section from uploaded document.',
            keyConcepts: ['Document', 'Notes'],
            content: truncatedText.substring(0, 2000)
        }]
    }
}
