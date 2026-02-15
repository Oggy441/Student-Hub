import { useState, useEffect } from 'react'
import { getDailyQuote } from '../../services/quoteService'
import './DailyQuote.css'

function DailyQuote() {
    const [quote, setQuote] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                // Check if we have today's quote in local storage to avoid extra reads
                const today = new Date().toISOString().split('T')[0]
                const cached = localStorage.getItem('daily_quote')

                if (cached) {
                    const parsed = JSON.parse(cached)
                    // Check if it's a valid quote (not an error fallback) and same date
                    if (parsed.date === today && parsed.text && !parsed.error) {
                        setQuote(parsed)
                        setLoading(false)
                        return
                    }
                }

                console.log('Fetching fresh quote from API...')
                const data = await getDailyQuote()
                console.log('Quote received:', data)
                setQuote(data)

                // Cache for session (only if valid)
                if (data.text && !data.error) {
                    localStorage.setItem('daily_quote', JSON.stringify({ ...data, date: today }))
                }
            } catch (err) {
                console.error('Failed to load quote', err)
            } finally {
                setLoading(false)
            }
        }

        fetchQuote()
    }, [])

    if (loading) return (
        <div className="daily-quote-skeleton card">
            <div className="skeleton-line width-80"></div>
            <div className="skeleton-line width-40"></div>
        </div>
    )

    if (!quote) return null

    return (
        <div className="daily-quote-card card">
            <div className="quote-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V3H19.017C20.6739 3 22.017 4.34315 22.017 6V15C22.017 16.6569 20.6739 18 19.017 18H16.017V21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 7.55228 5.0166 7V3H10.0166C11.6735 3 13.0166 4.34315 13.0166 6V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166V21H5.0166Z" />
                </svg>
            </div>
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
        </div>
    )
}

export default DailyQuote
