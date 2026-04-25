<script lang="ts" setup>
const cart = useCartStore();
</script>

<template>
  <USlideover title="Your Cart" side="right">
    <slot></slot>

    <template #body>
      <div
        v-if="cart.items.length === 0"
        class="flex flex-col items-center justify-center h-full gap-4 text-muted"
      >
        <UIcon name="i-lucide-shopping-cart" class="size-12" />
        <p>Your cart is empty</p>
        <UButton label="Browse store" to="/" />
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in cart.items" :key="item.gameId" class="flex gap-3 items-center">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="w-16 h-10 object-cover rounded"
          />
          <div v-else class="w-16 h-10 bg-muted rounded flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-muted" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ item.name }}</p>
            <p class="text-sm text-muted">${{ item.price }}</p>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-minus"
              size="xs"
              @click="cart.updateQuantity(item.gameId, item.quantity - 1)"
            />
            <span class="text-sm w-4 text-center">{{ item.quantity }}</span>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-plus"
              size="xs"
              @click="cart.updateQuantity(item.gameId, item.quantity + 1)"
            />
          </div>

          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="xs"
            @click="cart.remove(item.gameId)"
          />
        </div>
      </div>
    </template>

    <template v-if="cart.items.length > 0" #footer>
      <div class="space-y-3">
        <div class="flex justify-between font-semibold">
          <span>Total</span>
          <span>${{ cart.total }}</span>
        </div>
        <UButton label="Checkout" block />
      </div>
    </template>
  </USlideover>
</template>
