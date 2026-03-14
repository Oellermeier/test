import { API_URL } from './api'

// Backend-storageUrl ist relativ (/uploads/...) — für die Viewer-Site muss API_URL vorangestellt werden.
export function mediaUrl(storageUrl: string): string {
  if (storageUrl.startsWith('http')) return storageUrl
  return `${API_URL}${storageUrl}`
}
