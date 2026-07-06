export interface CartItem {
  gameId: string;
  name: string;
  price: string;
  originalPrice: string | null;
  imageUrl: string;
  qty: number;
}

function clampQty(qty: number): number {
  return Math.max(1, Math.min(99, Math.floor(qty)));
}

/**
 * Cart state shared across components (via `useState`) and persisted to
 * `localStorage` (via `useLocalStorage`). The cart is intentional SSR-empty:
 * on the first paint, items `[]` are rendered; on mount, the localStorage
 * value is hydrated once and `watch` keeps the two in sync afterwards.
 */
export function useCart() {
  const items = useState<CartItem[]>("cart:items", () => []);
  const persisted = useLocalStorage<CartItem[]>("glitch.cart.v1", []);

  onMounted(() => {
    if (persisted.value.length > 0 && items.value.length === 0) {
      items.value = persisted.value;
    }
  });
  watch(items, (next) => {
    persisted.value = [...next];
  });

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
