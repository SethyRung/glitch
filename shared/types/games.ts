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
 * Shape returned by GET /api/games for list views (catalog grid). Cards on
 * the home page can render straight off this without the description body.
 */
export interface GamesListResponse {
  items: GameSummary[];
  total: number;
  categories: string[];
}
