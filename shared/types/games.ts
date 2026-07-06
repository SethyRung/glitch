export interface Game {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string | null;
  discountPercent: number | null;
  imageUrl: string;
  category: string;
  stock: number;
  developer: string;
  publisher: string;
  releaseDate: string;
  tags: string[];
  metacriticScore: number | null;
  positiveReviews: number;
  negativeReviews: number;
  platforms: string[];
  videoUrl: string | null;
  screenshots: string[];
}

export type GameSummary = Pick<
  Game,
  | "id"
  | "name"
  | "developer"
  | "publisher"
  | "price"
  | "originalPrice"
  | "discountPercent"
  | "imageUrl"
  | "category"
  | "releaseDate"
  | "metacriticScore"
  | "platforms"
>;

/**
 * Body of the `data` field in a successful GET /api/games response. The
 * total + limit + offset live in the envelope's `meta` instead.
 */
export interface GamesListData {
  items: GameSummary[];
  categories: string[];
}
