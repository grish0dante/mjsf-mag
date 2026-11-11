
<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <nav
    class="breadcrumbs"
    aria-label="Навігаційний шлях"
  >
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumbs__item"
      >
        <span
          v-if="index > 0"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>

        <RouterLink
          v-if="index < items.length - 1"
          class="breadcrumbs__link"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>

        <span
          v-else
          class="breadcrumbs__current"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
