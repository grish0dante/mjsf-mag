
<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="product-overview">
    <p class="product-page__eyebrow">
      PRODUCT / OVERVIEW
    </p>

    <h2 class="product-overview__heading">
      Про товар
    </h2>

    <p class="product-overview__description">
      {{ product.description }}
    </p>

    <h3 class="product-overview__subheading">
      Характеристики
    </h3>

    <dl class="product-overview__specs">
      <div>
        <dt>Категорія</dt>
        <dd>{{ product.category }}</dd>
      </div>

      <div>
        <dt>Бренд</dt>
        <dd>{{ product.brand || 'Не вказано' }}</dd>
      </div>

      <div>
        <dt>Артикул</dt>
        <dd>{{ product.sku || 'Не вказано' }}</dd>
      </div>

      <div>
        <dt>Вага</dt>
        <dd>{{ product.weight ?? 'Не вказано' }}</dd>
      </div>

      <div>
        <dt>Гарантія</dt>
        <dd>{{ product.warrantyInformation || 'Не вказано' }}</dd>
      </div>

      <div>
        <dt>Доставка</dt>
        <dd>{{ product.shippingInformation || 'Не вказано' }}</dd>
      </div>

      <div>
        <dt>Повернення</dt>
        <dd>{{ product.returnPolicy || 'Не вказано' }}</dd>
      </div>

      <div>
        <dt>Мінімальне замовлення</dt>
        <dd>{{ product.minimumOrderQuantity ?? 1 }}</dd>
      </div>
    </dl>
  </section>
</template>
