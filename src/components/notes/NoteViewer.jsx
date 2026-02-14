import { useState } from 'react'
import './NotesPage.css'

function NoteViewer({ note, onBack }) {
    const [expandedChapter, setExpandedChapter] = useState(0)

    if (!note) return null

    const chapters = note.chapters || []

    return (
        <div className="page notes-page">
            <header className="notes-header">
                <button className="back-btn" onClick={onBack}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <h1 className="note-viewer-title">{note.title}</h1>
            </header>

            <div className="chapters-list">
                {chapters.map((chapter, index) => (
                    <div key={index} className="chapter-card card">
                        <button
                            className={`chapter-header ${expandedChapter === index ? 'expanded' : ''}`}
                            onClick={() => setExpandedChapter(expandedChapter === index ? -1 : index)}
                        >
                            <div className="chapter-number">{index + 1}</div>
                            <div className="chapter-title-group">
                                <h3 className="chapter-title">{chapter.title}</h3>
                                <p className="chapter-summary">{chapter.summary}</p>
                            </div>
                            <svg className="chapter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {expandedChapter === index && (
                            <div className="chapter-body">
                                {chapter.keyConcepts && chapter.keyConcepts.length > 0 && (
                                    <div className="key-concepts">
                                        <h4>Key Concepts</h4>
                                        <div className="concepts-tags">
                                            {chapter.keyConcepts.map((concept, i) => (
                                                <span key={i} className="concept-tag">{concept}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {chapter.content && (
                                    <div className="chapter-content">
                                        <p>{chapter.content}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NoteViewer
