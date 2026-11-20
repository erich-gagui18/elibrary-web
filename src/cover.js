// Gutenberg covers can fail while the site is busy or under maintenance (HTTP 503).
// Retry a few times with a growing delay, then hide the image and leave the gray tile.
export function coverFailed(e) {
  const img = e.target
  const tries = Number(img.dataset.tries || 0)
  const src = img.dataset.src || img.getAttribute('src')
  img.dataset.src = src
  if (tries >= 3) {
    img.style.visibility = 'hidden'
    return
  }
  img.dataset.tries = String(tries + 1)
  img.removeAttribute('src')
  setTimeout(() => {
    if (img.isConnected) img.setAttribute('src', src)
  }, 800 * 2 ** tries)
}
