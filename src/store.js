import { reactive } from 'vue'
import { api, session, saveSession } from './api'

export const store = reactive({ user: null, status: null, library: [], toast: '' })

let toastTimer
export function notify(message) {
  store.toast = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (store.toast = ''), 4500)
}

// ---------- Guest + download counter ----------

async function startGuest() {
  const d = await api('/guest/start', { method: 'POST' }) // { token, limit }
  saveSession(null, d.token)
}

export async function refreshStatus() {
  try {
    store.status = await api('/downloads/status') // { limit, used, remaining }
  } catch (e) {
    // Stale guest token (401): start a fresh guest session once and retry.
    if (!session.token && e.status === 401) {
      await startGuest()
      store.status = await api('/downloads/status')
    } else {
      throw e
    }
  }
}

// ---------- My Library ----------

export const isSaved = (bookId) => store.library.some((i) => i.book_id === bookId)

export async function loadLibrary() {
  if (!store.user) {
    store.library = []
    return
  }
  try {
    store.library = await api('/library') // [{ id, book_id, is_favorite, book: {...} }]
  } catch (e) {
    notify(e.message)
  }
}

export async function saveBook(book) {
  try {
    const item = await api('/library', { method: 'POST', body: { book_id: book.id } })
    if (!isSaved(item.book_id)) store.library.unshift(item)
    notify(`Saved “${book.title}”`)
  } catch (e) {
    notify(e.message)
  }
}

export async function toggleFavorite(bookId) {
  try {
    const item = await api(`/library/${bookId}/favorite`, { method: 'PATCH' })
    const i = store.library.findIndex((x) => x.book_id === bookId)
    if (i >= 0) store.library[i] = item
  } catch (e) {
    notify(e.message)
  }
}

export async function removeBook(bookId) {
  try {
    await api(`/library/${bookId}`, { method: 'DELETE' })
    store.library = store.library.filter((i) => i.book_id !== bookId)
    notify('Removed from My Library')
  } catch (e) {
    notify(e.message)
  }
}

// ---------- Session ----------

export async function init() {
  try {
    if (session.token) {
      try {
        store.user = (await api('/me')).user
      } catch (e) {
        if (e.status === 401) saveSession(null, session.guest)
        else throw e
      }
    }
    if (!session.token && !session.guest) await startGuest()
    await Promise.all([refreshStatus(), loadLibrary()])
  } catch (e) {
    notify(e.message)
  }
}

async function applyAuth(d) {
  saveSession(d.token, session.guest) // { message, user, token }
  store.user = d.user
  await Promise.all([refreshStatus(), loadLibrary()])
}

export async function login({ email, password }) {
  await applyAuth(await api('/login', { method: 'POST', body: { email, password } }))
}

export async function register({ name, email, password, password_confirmation }) {
  await applyAuth(
    await api('/register', { method: 'POST', body: { name, email, password, password_confirmation } })
  )
}

export async function logout() {
  try {
    await api('/logout', { method: 'POST' })
  } catch {
    /* token already invalid: still clear it locally */
  }
  saveSession(null, session.guest)
  store.user = null
  store.library = []
  await refreshStatus().catch(() => {})
}

// ---------- Downloads (limits are enforced by the API, never here) ----------

export async function download(book) {
  try {
    const d = await api(`/books/${book.id}/download`) // { download_url, limit, used, remaining }
    const a = document.createElement('a')
    a.href = d.download_url
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()

    store.status = { limit: d.limit, used: d.used, remaining: d.remaining }
    notify(`Downloading “${book.title}”`)
  } catch (e) {
    if (e.status === 429) {
      store.status = { limit: e.data.limit, used: e.data.used, remaining: 0 }
    }
    notify(e.message) // the API's own message, e.g. "Guest download limit reached (5). Register to get more."
  }
}
