import { useState, useCallback } from 'react'
import { compressImage } from '@/lib/image'
import * as api from '@/lib/api'

interface UseImageUploadReturn {
  uploading: boolean
  error: string | null
  upload: (recordId: string, type: 'before' | 'after', file: File) => Promise<string>
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (recordId: string, type: 'before' | 'after', file: File): Promise<string> => {
      setUploading(true)
      setError(null)
      try {
        const compressed = await compressImage(file)
        const result = await api.uploadImage(recordId, type, compressed)
        return result.key
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed'
        setError(msg)
        throw e
      } finally {
        setUploading(false)
      }
    },
    []
  )

  return { uploading, error, upload }
}
