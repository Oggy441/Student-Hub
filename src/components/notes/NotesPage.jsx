import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUserNotes, deleteNote } from '../../services/notesService'
import UploadModal from './UploadModal'
import NoteViewer from './NoteViewer'
import './NotesPage.css'

const FOLDER_ICONS = {
  'Mathematics': '📐',
  'Physics': '⚡',
  'Chemistry': '🧪',
  'Biology': '🧬',
  'Computer Science': '💻',
  'History': '📜',
  'English': '📖',
  'Economics': '📈',
  'My Notes': '📝',
}

const FOLDER_COLORS = {
  'Mathematics': '#f59e0b',
  'Physics': '#3b82f6',
  'Chemistry': '#10b981',
  'Biology': '#8b5cf6',
  'Computer Science': '#6366f1',
  'History': '#ef4444',
  'English': '#ec4899',
  'Economics': '#14b8a6',
  'My Notes': '#6b7280',
}

function NotesPage() {
  const { currentUser } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [activeFolder, setActiveFolder] = useState(null)

  useEffect(() => {
    if (currentUser) {
      loadNotes()
    }
  }, [currentUser])

  async function loadNotes() {
    try {
      setLoading(true)
      const userNotes = await getUserNotes(currentUser.uid)
      setNotes(userNotes)
    } catch (err) {
      console.error('Error loading notes:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleNoteAdded() {
    loadNotes()
  }

  async function handleDelete(e, noteId) {
    e.stopPropagation()
    if (window.confirm('Delete this note?')) {
      await deleteNote(noteId)
      setNotes(notes.filter(n => n.id !== noteId))
    }
  }

  // Group notes by folder
  function getFolders() {
    const folderMap = {}
    notes.forEach(note => {
      const folder = note.folder || 'My Notes'
      if (!folderMap[folder]) {
        folderMap[folder] = []
      }
      folderMap[folder].push(note)
    })

    // Always show 'My Notes' even if empty
    if (!folderMap['My Notes']) {
      folderMap['My Notes'] = []
    }

    return folderMap
  }

  // If viewing a specific note
  if (selectedNote) {
    return <NoteViewer note={selectedNote} onBack={() => setSelectedNote(null)} />
  }

  const folders = getFolders()

  // If inside a folder
  if (activeFolder) {
    const folderNotes = folders[activeFolder] || []
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
          <button className="btn btn-primary upload-btn-sm" onClick={() => setShowUpload(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </header>

        <div className="page-content">
          {folderNotes.length === 0 ? (
            <div className="empty-state-box">
              <h3>No notes in this folder</h3>
              <p>Upload a PDF and assign it to this folder</p>
              <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                Upload Note
              </button>
            </div>
          ) : (
            <div className="notes-list">
              {folderNotes.map(note => (
                <div key={note.id} className="note-list-item card">
                  <div className="note-list-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="note-list-info">
                    <span className="note-list-title">{note.title}</span>
                    <span className="note-list-date">
                      {note.createdAt?.seconds
                        ? new Date(note.createdAt.seconds * 1000).toLocaleDateString()
                        : 'Just now'}
                    </span>
                  </div>
                  <button className="note-list-delete" onClick={() => handleDelete({ stopPropagation: () => { } }, note.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onNoteAdded={handleNoteAdded}
          defaultFolder={activeFolder}
        />
      </div>
    )
  }

  // Folder grid view (main view)
  return (
    <div className="page notes-page">
      <header className="notes-header">
        <h1>📚 My Notes</h1>
        <button className="btn btn-primary upload-btn" onClick={() => setShowUpload(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload
        </button>
      </header>

      <div className="page-content">
        {loading ? (
          <div className="notes-loading">
            <span className="loading-spinner" />
            <p>Loading notes...</p>
          </div>
        ) : (
          <div className="folders-grid">
            {Object.entries(folders).map(([folderName, folderNotes]) => (
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
                <p className="folder-count">
                  {folderNotes.length} {folderNotes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onNoteAdded={handleNoteAdded}
      />
    </div>
  )
}

export default NotesPage