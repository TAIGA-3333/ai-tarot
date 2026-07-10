'use client'

const KEY = 'tsukuyomi_client_session_id'

export function getClientSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  const existing = localStorage.getItem(KEY)
  if (existing) return existing

  const id = crypto.randomUUID()
  localStorage.setItem(KEY, id)
  return id
}
