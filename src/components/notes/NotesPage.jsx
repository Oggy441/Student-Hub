import { useState, useEffect, useMemo } from 'react'
import { getAllNotes } from '../../services/notesService'
import './NotesPage.css'

// Standardised to 'OOPS' (uppercase) to match scheduleData.js and SUBJECT_COLORS
const FOLDER_ICONS = {
  'BEEE': '🔌',
  'DET': '📝',
  'AC': '🧪',
  'OOPS': '💻',
  'EG': '📐',
}

const FOLDER_COLORS = {
  'BEEE': '#f59e0b',
  'DET': '#3b82f6',
  'AC': '#10b981',
  'OOPS': '#8b5cf6',
  'EG': '#6366f1',
}

const FOLDER_FULL_NAMES = {
  'BEEE': 'Basic Electrical & Electronics',
  'DET': 'Differential Equations and Transforms',
  'AC': 'Applied Chemistry',
  'OOPS': 'Object Oriented Programming',
  'EG': 'Engineering Graphics',
}

// Extracted to module scope so it is not re-created on every render
function NoteList({ notes }) {
  return (
    <div className="notes-list">
      {notes.map(note => (
        <div key={note.id} className="note-list-item card">
          <div className="note-list-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="note-list-info">
            <span className="note-list-title">{note.title}</span>
            <span className="note-list-meta">
              {formatFileSize(note.fileSize)}
              {note.uploadedAt?.seconds && (
                <> · {new Date(note.uploadedAt.seconds * 1000).toLocaleDateString()}</>
              )}
            </span>
          </div>
          <div className="note-list-actions">
            {note.driveViewUrl && (
              <a
                href={note.driveViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="note-action-btn view-btn"
                title="View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </a>
            )}
            {note.driveDownloadUrl && (
              <a
                href={note.driveDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="note-action-btn download-btn"
                title="Download"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            )}
            {!note.driveViewUrl && !note.driveDownloadUrl && (
              <span className="note-pending">Pending</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState(null)
  const [activeChapter, setActiveChapter] = useState(null)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      setLoading(true)
      const allNotes = await getAllNotes()
      setNotes(allNotes)
    } catch (err) {
      console.error('Error loading notes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Memoised: only re-computed when the notes array changes
  const folders = useMemo(() => {
    const folderMap = {}

    // Initialise all known subjects (in display order)
    Object.keys(FOLDER_ICONS).forEach(subject => {
      folderMap[subject] = { _root: [], _chapters: {} }
    })

    notes.forEach(note => {
      const subject = note.subject || 'BEEE'
      if (!folderMap[subject]) {
        folderMap[subject] = { _root: [], _chapters: {} }
      }

      const chapter = note.chapter
      if (chapter) {
        if (!folderMap[subject]._chapters[chapter]) {
          folderMap[subject]._chapters[chapter] = []
        }
        folderMap[subject]._chapters[chapter].push(note)
      } else {
        folderMap[subject]._root.push(note)
      }
    })

    return folderMap
  }, [notes])

  // --- Chapter view ---
  if (activeFolder && activeChapter) {
    const chapterNotes = folders[activeFolder]?._chapters[activeChapter] || []
    return (
      <div className="page notes-page">
        <header className="notes-header notes-header-centered">
          <button className="back-btn-notes" onClick={() => setActiveChapter(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1>📂 {activeChapter}</h1>
          <div style={{ width: 36 }} />
        </header>
        <div className="page-content">
          {chapterNotes.length === 0 ? (
            <div className="empty-state-box">
              <h3>No notes in this chapter</h3>
            </div>
          ) : (
            <NoteList notes={chapterNotes} />
          )}
        </div>
      </div>
    )
  }

  // --- Subject folder view ---
  if (activeFolder) {
    const folderData = folders[activeFolder] || { _root: [], _chapters: {} }
    const hasNotes = folderData._root.length > 0 || Object.keys(folderData._chapters).length > 0

    return (
      <div className="page notes-page">
        <header className="notes-header notes-header-centered">
          <button className="back-btn-notes" onClick={() => setActiveFolder(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1>{FOLDER_ICONS[activeFolder] || '📁'} {activeFolder}</h1>
          <div style={{ width: 36 }} />
        </header>

        <p className="folder-full-name">{FOLDER_FULL_NAMES[activeFolder] || ''}</p>

        <div className="page-content">
          {!hasNotes ? (
            <div className="empty-state-box">
              <h3>No notes yet</h3>
              <p>Notes for this subject will appear here once uploaded by admin.</p>
            </div>
          ) : (
            <div className="notes-container">
              {Object.keys(folderData._chapters).length > 0 && (
                <div className="folders-grid" style={{ marginBottom: 'var(--space-6)' }}>
                  {Object.entries(folderData._chapters).sort().map(([chapterName, chapterNotes]) => (
                    <div
                      key={chapterName}
                      className="folder-card card"
                      onClick={() => setActiveChapter(chapterName)}
                    >
                      <div className="folder-icon-bg" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <span className="folder-emoji">📂</span>
                      </div>
                      <h3 className="folder-name">{chapterName}</h3>
                      <p className="folder-count">{chapterNotes.length} notes</p>
                    </div>
                  ))}
                </div>
              )}

              {folderData._root.length > 0 && (
                <div className="root-section">
                  {Object.keys(folderData._chapters).length > 0 && (
                    <h3 className="chapter-title">📄 General Files</h3>
                  )}
                  <NoteList notes={folderData._root} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- Folder grid (main view) ---
  return (
    <div className="page notes-page">
      <header className="notes-header">
        <h1>📚 Notes</h1>
      </header>

      <div className="page-content">
        {loading ? (
          <div className="notes-loading">
            <span className="loading-spinner" />
            <p>Loading notes...</p>
          </div>
        ) : (
          <div className="folders-grid">
            {Object.entries(folders).map(([folderName, folderData]) => {
              const count =
                folderData._root.length +
                Object.values(folderData._chapters).reduce((acc, arr) => acc + arr.length, 0)
              return (
                <div
                  key={folderName}
                  className="folder-card card"
                  onClick={() => setActiveFolder(folderName)}
                >
                  <div
                    className="folder-icon-bg"
                    style={{ background: `${FOLDER_COLORS[folderName] || '#6b7280'}15` }}
                  >
                    <span className="folder-emoji">
                      {FOLDER_ICONS[folderName] || '📁'}
                    </span>
                  </div>
                  <h3 className="folder-name">{folderName}</h3>
                  <p className="folder-full-label">{FOLDER_FULL_NAMES[folderName] || ''}</p>
                  <p className="folder-count">{count} notes</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesPage