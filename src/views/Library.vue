<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { store, loadLibrary, download, toggleFavorite, removeBook } from '../store'

const onlyFavorites = ref(false)
const favorites = computed(() => store.library.filter((i) => i.is_favorite))
const items = computed(() => (onlyFavorites.value ? favorites.value : store.library))
const hideCover = (e) => (e.target.style.visibility = 'hidden')

onMounted(loadLibrary)
</script>

<template>
  <section class="hero">
    <h1>My Library</h1>
    <p class="lede">Your saved books and favorites, the same on the website and in the app.</p>
  </section>

  <section class="catalog">
    <div class="tabs" role="tablist" aria-label="Library filter">
      <button :class="{ on: !onlyFavorites }" @click="onlyFavorites = false">
        All <span class="n">{{ store.library.length }}</span>
      </button>
      <button :class="{ on: onlyFavorites }" @click="onlyFavorites = true">
        Favorites <span class="n">{{ favorites.length }}</span>
      </button>
    </div>

    <div v-if="!items.length" class="empty left">
      <template v-if="onlyFavorites">
        <h2>No favorites yet</h2>
        <p>Mark a saved book as a favorite and it will show up here.</p>
      </template>
      <template v-else>
        <h2>Nothing saved yet</h2>
        <p>Choose Save on any book and it will show up here.</p>
        <RouterLink to="/" class="btn solid">Browse books</RouterLink>
      </template>
    </div>

    <ul v-else class="shelf">
      <li v-for="i in items" :key="i.id" class="shelf-row">
        <div class="thumb">
          <img :src="i.book.cover_url" :alt="`Cover of ${i.book.title}`" loading="lazy" referrerpolicy="no-referrer" @error="hideCover" />
        </div>
        <div class="info">
          <h3>{{ i.book.title }}</h3>
          <p class="author">{{ i.book.author }}</p>
          <p class="cat">{{ i.book.category }}</p>
        </div>
        <div class="row-actions">
          <button class="btn solid small" @click="download(i.book)">Download</button>
          <button class="btn ghost small" :aria-pressed="i.is_favorite" @click="toggleFavorite(i.book_id)">
            {{ i.is_favorite ? 'Unfavorite' : 'Favorite' }}
          </button>
          <button class="btn ghost small" @click="removeBook(i.book_id)">Remove</button>
        </div>
      </li>
    </ul>
  </section>
</template>