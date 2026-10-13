export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail: string;
  images: string[];
}

export interface ProductsApiResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  totals: CartTotals;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  estimatedDelivery: string;
}

export type NotificationType = 'abandoned_cart' | 'order_confirmation' | 'info';
export type NotificationStatus = 'scheduled' | 'fired' | 'cancelled';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  scheduledAt: number;
  triggerAt: number;
  type: NotificationType;
  status: NotificationStatus;
  payload?: Record<string, any>;
}

export type SortOption =
  | 'default'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'title_asc';

export interface ProductFilters {
  searchQuery: string;
  selectedCategory: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sortBy: SortOption;
}
