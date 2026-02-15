/**
 * Serverless function to generate quotes using Gemini AI.
 * To run locally, use 'vercel dev' or setup a Node server.
 */
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
    const API_KEY = process.env.GOOGLE_AI_KEY

    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key not configured on server' })
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a short, humorous, witty, and motivational quote specifically for a Computer Science student.
        It should be relatable to coders (bugs, coffee, deployment, etc.).
        Return ONLY a JSON object with two fields: "text" (the quote string) and "author" (the person who said it, or "Unknown" if generic). 
        Do not use markdown formatting.`

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // More robust JSON extraction
        let jsonStr = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        try {
            const quoteData = JSON.parse(jsonStr);
            return res.status(200).json(quoteData);
        } catch (parseError) {
            console.error('JSON Parse Error. Raw text:', text);
            return res.status(500).json({
                error: 'Invalid response format from AI',
                details: text.substring(0, 100)
            });
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({
            error: 'Failed to generate quote',
            message: error.message
        });
    }
}
