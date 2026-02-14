import { useState, useRef } from 'react'
import { saveNote } from '../../services/notesService'
import { useAuth } from '../../context/AuthContext'

const FOLDER_OPTIONS = [
    'My Notes',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'English',
    'Economics',
]

function UploadModal({ isOpen, onClose, onNoteAdded, defaultFolder }) {
    const [file, setFile] = useState(null)
    const [folder, setFolder] = useState(defaultFolder || 'My Notes')
    const [error, setError] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)
    const { currentUser } = useAuth()

    if (!isOpen) return null

    function handleFileChange(e) {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile)
            setError('')
        } else {
            setError('Please select a PDF file')
            setFile(null)
        }
    }

    async function handleUpload() {
        if (!file) return

        try {
            setUploading(true)
            setError('')

            const note = await saveNote(
                currentUser.uid,
                file.name.replace('.pdf', ''),
                [],
                0,
                folder
            )

            if (onNoteAdded) onNoteAdded(note)
            handleClose()
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    function handleClose() {
        if (uploading) return
        setFile(null)
        setError('')
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upload Notes</h2>
                    {!uploading && (
                        <button className="modal-close" onClick={handleClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                {error && <div className="auth-error">{error}</div>}

                <div
                    className="upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        hidden
                    />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="upload-text">
                        {file ? file.name : 'Tap to select a PDF file'}
                    </p>
                    {file && (
                        <p className="upload-size">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    )}
                </div>

                <div className="folder-select-group">
                    <label htmlFor="folder-select">Save to folder</label>
                    <select
                        id="folder-select"
                        className="folder-select"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                    >
                        {FOLDER_OPTIONS.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn btn-primary btn-full"
                    disabled={!file || uploading}
                    onClick={handleUpload}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    )
}

export default UploadModal
