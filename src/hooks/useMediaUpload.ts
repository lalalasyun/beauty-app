import { useState, useCallback } from 'react'
import { compressImage } from '@/lib/image'
import * as api from '@/lib/api'
import type { RecordMedia } from '@/types'

interface UseMediaUploadReturn {
  uploading: boolean
  error: string | null
  uploadPhoto: (recordId: string, category: 'before' | 'after', file: File) => Promise<RecordMedia>
  uploadVideo: (recordId: string, category: 'before' | 'after', file: File) => Promise<RecordMedia>
}

export function useMediaUpload(): UseMediaUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPhoto = useCallback(
    async (recordId: string, category: 'before' | 'after', file: File): Promise<RecordMedia> => {
      setUploading(true)
      setError(null)
      try {
        const compressed = await compressImage(file)
        return await api.uploadMedia(recordId, 'photo', category, compressed)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'アップロードに失敗しました'
        setError(msg)
        throw e
      } finally {
        setUploading(false)
      }
    },
    []
  )

  const uploadVideo = useCallback(
    async (recordId: string, category: 'before' | 'after', file: File): Promise<RecordMedia> => {
      setUploading(true)
      setError(null)
      try {
        return await api.uploadMedia(recordId, 'video', category, file)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'アップロードに失敗しました'
        setError(msg)
        throw e
      } finally {
        setUploading(false)
      }
    },
    []
  )

  return { uploading, error, uploadPhoto, uploadVideo }
}
