'use client'

import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { useAppStore, type ElevenLabsVoice } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useState, useCallback, useRef, useMemo } from 'react'
import { Settings, Upload, Download, Loader2, AlertCircle, CheckCircle, Trash2, Plus } from 'lucide-react'
import { createPortal } from 'react-dom'
import {
  generateSpeech,
  downloadAudio,
  createFilenameFromText,
  parseTextFile,
  delay,
} from '@/lib/elevenlabs'
import JSZip from 'jszip'

// ============================================
// Settings Modal Component
// ============================================
interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { voiceGenerator, addVoice, removeVoice } = useAppStore()
  const [newVoiceName, setNewVoiceName] = useState('')
  const [newVoiceId, setNewVoiceId] = useState('')

  const handleAddVoice = useCallback(() => {
    if (!newVoiceName.trim() || !newVoiceId.trim()) return

    const voice: ElevenLabsVoice = {
      id: `voice-${Date.now()}`,
      name: newVoiceName.trim(),
      voiceId: newVoiceId.trim(),
    }

    addVoice(voice)
    setNewVoiceName('')
    setNewVoiceId('')
  }, [newVoiceName, newVoiceId, addVoice])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Escape key closes modal
  useMemo(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <GlassPanel variant="frosted" padding="none" className="max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Voice Generator Settings
            </h2>
            <p className="text-sm text-text-secondary font-medium">
              Manage ElevenLabs voices
            </p>
          </div>
          <button
            onClick={onClose}
            className="nodrag nopan w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.5)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Add Voice Section */}
        <div className="p-4 border-b border-[rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Add Voice</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={newVoiceName}
              onChange={(e) => setNewVoiceName(e.target.value)}
              placeholder="Voice Name (e.g., Rachel)"
              className="nodrag nopan w-full px-3 py-2 rounded-lg
                bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(40,40,60,0.8)]
                border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)]
                text-text-primary text-sm font-medium
                focus:outline-none focus:ring-[3px] focus:ring-[rgba(155,89,182,0.3)]
                placeholder:text-text-muted"
            />
            <input
              type="text"
              value={newVoiceId}
              onChange={(e) => setNewVoiceId(e.target.value)}
              placeholder="Voice ID (Obtain from ElevenLabs)"
              className="nodrag nopan w-full px-3 py-2 rounded-lg
                bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(40,40,60,0.8)]
                border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)]
                text-text-primary text-sm font-medium
                focus:outline-none focus:ring-[3px] focus:ring-[rgba(155,89,182,0.3)]
                placeholder:text-text-muted"
            />
            <GlassButton
              size="sm"
              variant="primary"
              onClick={handleAddVoice}
              disabled={!newVoiceName.trim() || !newVoiceId.trim()}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Voice</span>
            </GlassButton>
          </div>
        </div>

        {/* Saved Voices List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Saved Voices</h3>
          {voiceGenerator.voices.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              No voices configured yet
            </p>
          ) : (
            <div className="space-y-2">
              {voiceGenerator.voices.map((voice) => (
                <div
                  key={voice.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(60,60,80,0.5)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {voice.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {voice.voiceId}
                    </p>
                  </div>
                  <button
                    onClick={() => removeVoice(voice.id)}
                    className="nodrag nopan w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-[rgba(255,0,0,0.1)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.3)]">
          <GlassButton
            size="md"
            variant="primary"
            onClick={onClose}
          >
            Done
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  )

  // Portal to body so it's outside any CSS transforms from block scaling
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return null
}

// ============================================
// Main Panel Component
// ============================================
export function VoiceGeneratorPanel() {
  const { voiceGenerator, setSelectedVoice } = useAppStore()
  const { user, isAuthenticated } = useAuthStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [singleText, setSingleText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  const [status, setStatus] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const selectedVoice = voiceGenerator.voices.find(v => v.id === voiceGenerator.selectedVoiceId)

  // Clear status after 5 seconds
  const showStatus = useCallback((type: 'error' | 'success' | 'info', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 5000)
  }, [])

  // Handle single generation
  const handleSingleGenerate = useCallback(async () => {
    if (!selectedVoice || !singleText.trim() || isGenerating) return

    // Check authentication
    if (!isAuthenticated || !user) {
      showStatus('error', 'Please sign in to use Voice Generator')
      return
    }

    setIsGenerating(true)
    setStatus(null)

    const result = await generateSpeech({
      text: singleText.trim(),
      voiceId: selectedVoice.voiceId,
      voiceName: selectedVoice.name,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    })

    if (result.success && result.audioBlob) {
      const filename = createFilenameFromText(singleText)
      downloadAudio(result.audioBlob, filename)
      showStatus('success', 'Audio generated and downloaded!')
      setSingleText('')
    } else {
      showStatus('error', result.error || 'Generation failed')
    }

    setIsGenerating(false)
  }, [selectedVoice, singleText, isGenerating, showStatus, isAuthenticated, user])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
      setSelectedFile(file)
      setStatus(null)
    } else if (file) {
      showStatus('error', 'Please select a .txt file')
    }
  }, [showStatus])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isGenerating) {
      setIsDragOver(true)
    }
  }, [isGenerating])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (isGenerating) return

    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
      setSelectedFile(file)
      setStatus(null)
    } else if (file) {
      showStatus('error', 'Please drop a .txt file')
    }
  }, [isGenerating, showStatus])

  // Handle bulk generation
  const handleBulkGenerate = useCallback(async () => {
    if (!selectedVoice || !selectedFile || isGenerating) return

    // Check authentication
    if (!isAuthenticated || !user) {
      showStatus('error', 'Please sign in to use Voice Generator')
      return
    }

    setIsGenerating(true)
    setStatus(null)

    try {
      // Read file contents
      const content = await selectedFile.text()
      const sentences = parseTextFile(content)

      if (sentences.length === 0) {
        showStatus('error', 'File is empty or contains no valid sentences')
        setIsGenerating(false)
        return
      }

      setBulkProgress({ current: 0, total: sentences.length })

      const zip = new JSZip()
      const errors: string[] = []

      // Generate each sentence
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i]
        setBulkProgress({ current: i + 1, total: sentences.length })

        const result = await generateSpeech({
          text: sentence,
          voiceId: selectedVoice.voiceId,
          voiceName: selectedVoice.name,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        })

        if (result.success && result.audioBlob) {
          const filename = createFilenameFromText(sentence, i)
          zip.file(filename, result.audioBlob)
        } else {
          errors.push(`Line ${i + 1}: ${result.error}`)
        }

        // Add delay between requests to avoid rate limiting
        if (i < sentences.length - 1) {
          await delay(500)
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
      downloadAudio(zipBlob, `voice-generation-${timestamp}.zip`)

      if (errors.length > 0) {
        showStatus('info', `Generated ${sentences.length - errors.length}/${sentences.length} files. Some failed.`)
      } else {
        showStatus('success', `Generated ${sentences.length} audio files!`)
      }

      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Bulk generation failed')
    }

    setBulkProgress({ current: 0, total: 0 })
    setIsGenerating(false)
  }, [selectedVoice, selectedFile, isGenerating, showStatus])

  return (
    <>
      <GlassPanel variant="frosted" className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Voice Generator
          </h2>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="nodrag nopan w-9 h-9 rounded-xl flex items-center justify-center
              bg-[rgba(155,89,182,0.15)] text-[#9B59B6]
              hover:bg-[rgba(155,89,182,0.25)] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Selector */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-text-secondary mb-2 block">
            Voice
          </label>
          <select
            value={voiceGenerator.selectedVoiceId || ''}
            onChange={(e) => setSelectedVoice(e.target.value || null)}
            disabled={voiceGenerator.voices.length === 0}
            className="nodrag nopan w-full px-3 py-2 rounded-lg
              bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(40,40,60,0.8)]
              border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)]
              text-text-primary text-sm font-medium
              focus:outline-none focus:ring-[3px] focus:ring-[rgba(155,89,182,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voiceGenerator.voices.length === 0 ? (
              <option value="">No voices configured</option>
            ) : (
              <>
                <option value="">Select a voice...</option>
                {voiceGenerator.voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Single Generation Section */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">
            Single Generation
          </h3>
          <textarea
            value={singleText}
            onChange={(e) => setSingleText(e.target.value)}
            placeholder="Enter text to generate..."
            disabled={!selectedVoice || isGenerating}
            rows={3}
            className="nodrag nopan w-full px-3 py-2 rounded-lg resize-none
              bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(40,40,60,0.8)]
              border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)]
              text-text-primary text-sm font-medium
              focus:outline-none focus:ring-[3px] focus:ring-[rgba(155,89,182,0.3)]
              placeholder:text-text-muted
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <GlassButton
            size="sm"
            variant="primary"
            onClick={handleSingleGenerate}
            disabled={!selectedVoice || !singleText.trim() || isGenerating}
            className="w-full mt-2 flex items-center justify-center gap-2"
          >
            {isGenerating && bulkProgress.total === 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate & Download</span>
              </>
            )}
          </GlassButton>
        </div>

        {/* Bulk Generation Section */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">
            Bulk Generation
          </h3>

          {/* File Input Area */}
          <div
            onClick={() => !isGenerating && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              nodrag nopan flex-1 min-h-[80px] rounded-lg border-2 border-dashed
              flex flex-col items-center justify-center cursor-pointer
              transition-colors
              ${isDragOver
                ? 'border-[#9B59B6] bg-[rgba(155,89,182,0.2)] scale-[1.02]'
                : selectedFile
                  ? 'border-[#9B59B6] bg-[rgba(155,89,182,0.1)]'
                  : 'border-[rgba(155,89,182,0.3)] hover:border-[rgba(155,89,182,0.5)] bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(40,40,60,0.4)]'
              }
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileSelect}
              disabled={isGenerating}
              className="hidden"
            />
            {isDragOver ? (
              <>
                <Upload className="w-6 h-6 text-[#9B59B6] mb-1" />
                <span className="text-sm font-medium text-[#9B59B6]">
                  Drop file here
                </span>
              </>
            ) : selectedFile ? (
              <>
                <CheckCircle className="w-6 h-6 text-[#9B59B6] mb-1" />
                <span className="text-sm font-medium text-text-primary">{selectedFile.name}</span>
                <span className="text-xs text-text-muted">Drop or click to change</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-text-muted mb-1" />
                <span className="text-sm font-medium text-text-secondary">
                  Drop .txt file or click to upload
                </span>
                <span className="text-xs text-text-muted">One sentence per line</span>
              </>
            )}
          </div>

          <GlassButton
            size="sm"
            variant="primary"
            onClick={handleBulkGenerate}
            disabled={!selectedVoice || !selectedFile || isGenerating}
            className="w-full mt-2 flex items-center justify-center gap-2"
          >
            {isGenerating && bulkProgress.total > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {bulkProgress.current}/{bulkProgress.total}...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate ZIP</span>
              </>
            )}
          </GlassButton>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`
            mt-3 p-2 rounded-lg flex items-center gap-2 text-sm
            ${status.type === 'error' ? 'bg-[rgba(255,107,107,0.15)] text-[#FF6B6B]' : ''}
            ${status.type === 'success' ? 'bg-[rgba(56,217,169,0.15)] text-[#38D9A9]' : ''}
            ${status.type === 'info' ? 'bg-[rgba(155,89,182,0.15)] text-[#9B59B6]' : ''}
          `}>
            {status.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {status.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            {status.type === 'info' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="font-medium">{status.message}</span>
          </div>
        )}
      </GlassPanel>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}
