import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { truncateOutput } from '../utils/sanitize'

const HistoryDrawer = ({ isOpen, onClose, onSelect }) => {
  const [histories, setHistories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchHistory = useCallback(async (pageNum = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get(`/history?page=${pageNum}&limit=20`)
      if (pageNum === 1) {
        setHistories(response.data.generations)
      } else {
        setHistories((prev) => [...prev, ...response.data.generations])
      }
      setHasMore(response.data.pagination.page < response.data.pagination.pages)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch history')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchHistory(1)
    }
  }, [isOpen, fetchHistory])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this generation?')) return

    try {
      await api.delete(`/history/${id}`)
      setHistories((prev) => prev.filter((h) => h._id !== id))
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete generation')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-bg-overlay/50" onClick={onClose} />

      <div className="relative w-80 max-w-full bg-bg-surface border-r border-border h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-mono text-lg font-semibold text-text-primary">History</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary font-mono text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-3 mb-3">
              <p className="text-status-danger font-mono text-sm">{error}</p>
            </div>
          )}
          {histories.length === 0 && !isLoading && (
            <div className="text-text-muted font-mono text-sm text-center py-8">
              No generations yet
            </div>
          )}

          {histories.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                onSelect(item.output)
                onClose()
              }}
              className="group p-3 bg-bg-elevated border border-border rounded-lg cursor-pointer hover:border-accent transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-accent/10 text-accent rounded font-mono text-xs">
                  {item.language}
                </span>
                <button
                  onClick={(e) => handleDelete(e, item._id)}
                  className="opacity-0 group-hover:opacity-100 text-status-danger hover:text-status-danger/80 font-mono text-xs transition-opacity"
                >
                  Delete
                </button>
              </div>
              <p className="text-text-code font-mono text-xs mb-2 whitespace-pre-wrap">
                {truncateOutput(item.output, 80)}
              </p>
              <p className="text-text-muted font-mono text-xs">{formatDate(item.createdAt)}</p>
            </div>
          ))}

          {isLoading && (
            <div className="text-center py-4">
              <div className="text-text-muted font-mono text-sm">Loading...</div>
            </div>
          )}

          {hasMore && !isLoading && (
            <button
              onClick={() => fetchHistory(page + 1)}
              className="w-full py-2 text-accent font-mono text-sm hover:underline"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryDrawer
