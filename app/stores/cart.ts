import { defineStore } from "pinia";
import type { Game } from "#shared/types";

export interface CartItem {
  gameId: string;
  name: string;
  price: string;
  imageUrl: string | null;
  quantity: number;
}

export const useCartStore = defineStore("cart", () => {
  const items = useLocalStorage<CartItem[]>("glitch-cart", []);

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2),
  );

  function add(game: Game) {
    const existing = items.value.find((i) => i.gameId === game.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({
        gameId: game.id,
        name: game.name,
        price: game.price,
        imageUrl: game.imageUrl,
        quantity: 1,
      });
    }
  }

  function remove(gameId: string) {
    items.value = items.value.filter((i) => i.gameId !== gameId);
  }

  function updateQuantity(gameId: string, quantity: number) {
    const item = items.value.find((i) => i.gameId === gameId);
    if (item) {
      if (quantity <= 0) {
        remove(gameId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    count,
    total,
    add,
    remove,
    updateQuantity,
    clear,
  };
});
