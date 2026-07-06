export interface CartItem {
  gameId: string;
  name: string;
  price: string;
  originalPrice: string | null;
  imageUrl: string;
  qty: number;
}

const STORAGE_KEY = "glitch.cart.v1";

function clampQty(qty: number): number {
  return Math.max(1, Math.min(99, Math.floor(qty)));
}

function loadFromStorage(): CartItem[] {
  if (!import.meta.client) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const items = ref<CartItem[]>([]);

  if (import.meta.client) {
    onMounted(() => {
      items.value = loadFromStorage();
    });

    watch(
      items,
      (val) => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
        } catch {
          return;
        }
      },
      { deep: true },
    );
  }

  function add(payload: Omit<CartItem, "qty">, qty: number = 1) {
    const existing = items.value.find((item) => item.gameId === payload.gameId);
    if (existing) {
      existing.qty = clampQty(existing.qty + qty);
      items.value = [...items.value];
    } else {
      items.value = [...items.value, { ...payload, qty: clampQty(qty) }];
    }
  }

  function setQty(gameId: string, qty: number) {
    items.value = items.value.map((item) =>
      item.gameId === gameId ? { ...item, qty: clampQty(qty) } : item,
    );
  }

  function increment(gameId: string) {
    const item = items.value.find((i) => i.gameId === gameId);
    if (!item) return;
    item.qty = clampQty(item.qty + 1);
    items.value = [...items.value];
  }

  function decrement(gameId: string) {
    const item = items.value.find((i) => i.gameId === gameId);
    if (!item) return;
    if (item.qty <= 1) {
      remove(gameId);
      return;
    }
    item.qty -= 1;
    items.value = [...items.value];
  }

  function remove(gameId: string) {
    items.value = items.value.filter((i) => i.gameId !== gameId);
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    add,
    setQty,
    increment,
    decrement,
    remove,
    clear,
  };
}
