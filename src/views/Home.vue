<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { store, download, saveBook, isSaved, notify } from '../store'

const router = useRouter()

const books = ref([])
const categories = ref([])
const q = ref('')
const category = ref('')
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const loading = ref(false)
const error = ref('')

let timer
async function load() {
  loading.value = true
  error.value = ''
  try {
    const d = await api('/books', {
      params: { q: q.value.trim(), category: category.value, page: page.value, per_page: 24 },
    })
    books.value = d.data ?? []
    total.value = d.total ?? books.value.length
    lastPage.value = d.last_page ?? 1
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function go(n) {
  page.value = n
  load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(category, () => {
  page.value = 1
  load()
})
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})

onMounted(async () => {
  load()
  try {
    const c = await api('/categories')
    categories.value = Array.isArray(c) ? c : (c.data ?? [])
  } catch {
    /* the filter row simply stays hidden */
  }
})

function save(book) {
  if (!store.user) {
    notify('Log in to save books to your library.')
    router.push('/login')
    return
  }
  saveBook(book)
}

const hideCover = (e) => (e.target.style.visibility = 'hidden')
</script>

<template>
  <section class="hero">
    <h1>Free books, yours to keep.</h1>
    <p class="lede">
      Search public-domain classics and download them as EPUB.
      <template v-if="!store.user">Guests get 5 downloads. A free account gets 10.</template>
    </p>
    <label class="search">
      <span class="sr">Search by title or author</span>
      <input v-model="q" type="search" placeholder="Search by title or author" autocomplete="off" />
    </label>
  </section>

  <section class="catalog">
    <div v-if="categories.length" class="tabs" role="tablist" aria-label="Categories">
      <button :class="{ on: category === '' }" @click="category = ''">All</button>
      <button
        v-for="c in categories"
        :key="c.category"
        :class="{ on: category === c.category }"
        @click="category = c.category"
      >
        {{ c.category }} <span class="n">{{ c.total }}</span>
      </button>
    </div>

    <p v-if="error" class="notice" role="alert">{{ error }}</p>

    <p v-else-if="!loading" class="count">
      {{ total }} {{ total === 1 ? 'book' : 'books' }}<template v-if="q"> matching “{{ q }}”</template>
    </p>

    <div v-if="!loading && !error && !books.length" class="empty">
      <h2>No books found</h2>
      <p>Try a different title or author, or choose another category.</p>
    </div>

    <div class="grid" :aria-busy="loading">
      <article v-for="b in books" :key="b.id" class="book">
        <div class="cover" :title="b.title">
          <img :src="b.cover_url" :alt="`Cover of ${b.title}`" loading="lazy" referrerpolicy="no-referrer" @error="hideCover" />
        </div>
        <h3>{{ b.title }}</h3>
        <p class="author">{{ b.author }}</p>
        <p class="cat">{{ b.category }}</p>
        <div class="actions">
          <button class="btn solid small" @click="download(b)">Download</button>
          <button class="btn ghost small" :disabled="isSaved(b.id)" @click="save(b)">
            {{ isSaved(b.id) ? 'Saved' : 'Save' }}
          </button>
        </div>
      </article>
    </div>

    <nav v-if="lastPage > 1" class="pager" aria-label="Pages">
      <button class="btn ghost small" :disabled="page <= 1" @click="go(page - 1)">Previous</button>
      <span>Page {{ page }} of {{ lastPage }}</span>
      <button class="btn ghost small" :disabled="page >= lastPage" @click="go(page + 1)">Next</button>
    </nav>
  </section>
</template>