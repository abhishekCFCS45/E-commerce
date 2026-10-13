import React, { Profiler, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { FilterModal } from '../components/FilterModal';
import { ProductCard } from '../components/ProductCard';
import { ProductListHeader } from '../components/ProductListHeader';
import { addToCart } from '../store/slices/cartSlice';
import {
  fetchCategories,
  fetchProducts,
  resetFilters,
  setPriceFilter,
  setRatingFilter,
  setSearchQuery,
  setSelectedCategory,
  setSelectedProduct,
  setSortBy,
  toggleInStockOnly,
} from '../store/slices/productsSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Product, ProductFilters } from '../types';
import { filterAndSortProducts } from '../utils/calculations';
import { perfTracker } from '../utils/profiler';

interface ProductListScreenProps {
  onSelectProduct: (product: Product) => void;
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({
  onSelectProduct,
}) => {
  const dispatch = useAppDispatch();

  const {
    items,
    total,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    isOffline,
    categories,
    filters,
  } = useAppSelector(state => state.products);

  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const wishlistedIds = useMemo(
    () => new Set(wishlistItems.map(w => w.product.id)),
    [wishlistItems]
  );

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    dispatch(fetchProducts({ refresh: true }));
  }, [dispatch]);

  // Infinite scroll load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && items.length < total) {
      dispatch(fetchProducts({ loadMore: true }));
    }
  }, [dispatch, isLoading, isLoadingMore, items.length, total]);

  // Search input handler
  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchQuery(text));
      dispatch(fetchProducts());
    },
    [dispatch]
  );

  // Category select handler
  const handleCategorySelect = useCallback(
    (category: string | null) => {
      dispatch(setSelectedCategory(category));
      dispatch(fetchProducts());
    },
    [dispatch]
  );

  // Apply filters from modal
  const handleApplyFilters = useCallback(
    (applied: Partial<ProductFilters>) => {
      if (applied.sortBy !== undefined) dispatch(setSortBy(applied.sortBy));
      if (applied.minPrice !== undefined || applied.maxPrice !== undefined) {
        dispatch(
          setPriceFilter({
            min: applied.minPrice ?? null,
            max: applied.maxPrice ?? null,
          })
        );
      }
      if (applied.minRating !== undefined) {
        dispatch(setRatingFilter(applied.minRating));
      }
      if (
        applied.inStockOnly !== undefined &&
        applied.inStockOnly !== filters.inStockOnly
      ) {
        dispatch(toggleInStockOnly());
      }
    },
    [dispatch, filters.inStockOnly]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Card callbacks memoized with useCallback
  const handleCardPress = useCallback(
    (product: Product) => {
      dispatch(setSelectedProduct(product));
      onSelectProduct(product);
    },
    [dispatch, onSelectProduct]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      dispatch(addToCart({ product, quantity: 1 }));
    },
    [dispatch]
  );

  const handleToggleWishlist = useCallback(
    (product: Product) => {
      dispatch(toggleWishlist(product));
    },
    [dispatch]
  );

  // Filter and sort items locally for smooth client-side filtering responsiveness
  const displayedItems = useMemo(() => {
    return filterAndSortProducts(items, filters);
  }, [items, filters]);

  // Optimized FlatList renderItem
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        isWishlisted={wishlistedIds.has(item.id)}
        onPress={handleCardPress}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />
    ),
    [wishlistedIds, handleCardPress, handleAddToCart, handleToggleWishlist]
  );

  const keyExtractor = useCallback((item: Product) => `product-${item.id}`, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.footerLoaderText}>Loading more products...</Text>
      </View>
    );
  }, [isLoadingMore]);

  return (
    <Profiler id="ProductListScreen" onRender={perfTracker.onRender}>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              ⚡ Offline Mode: Serving cached products
            </Text>
          </View>
        )}

        <ProductListHeader
          categories={categories}
          filters={filters}
          totalCount={displayedItems.length}
          onSearchChange={handleSearchChange}
          onCategorySelect={handleCategorySelect}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
        />

        {isLoading && items.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching products...</Text>
          </View>
        ) : error && items.length === 0 ? (
          <ErrorView
            message={error}
            isOffline={isOffline}
            onRetry={() => dispatch(fetchProducts())}
          />
        ) : displayedItems.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Products Found"
            description="We couldn't find any products matching your selected search or filter criteria."
            buttonLabel="Reset Filters"
            onButtonPress={handleResetFilters}
          />
        ) : (
          <FlatList
            data={displayedItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#2563EB']}
                tintColor="#2563EB"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            // FlatList Performance Optimizations
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}

        <FilterModal
          visible={isFilterModalOpen}
          filters={filters}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </SafeAreaView>
    </Profiler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: '#64748B',
  },
});
