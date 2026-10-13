import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductFilters } from '../types';
import { useDebounce } from '../utils/debounce';

interface ProductListHeaderProps {
  categories: string[];
  filters: ProductFilters;
  totalCount: number;
  onSearchChange: (text: string) => void;
  onCategorySelect: (category: string | null) => void;
  onOpenFilterModal: () => void;
}

export const ProductListHeader: React.FC<ProductListHeaderProps> = ({
  categories,
  filters,
  totalCount,
  onSearchChange,
  onCategorySelect,
  onOpenFilterModal,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const activeFilterCount = [
    filters.minPrice !== null || filters.maxPrice !== null,
    filters.minRating !== null,
    filters.inStockOnly,
    filters.sortBy !== 'default',
  ].filter(Boolean).length;

  const categoryData = ['all', ...categories];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, tags..."
            value={localSearch}
            onChangeText={setLocalSearch}
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
          />
          {localSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => setLocalSearch('')}
              style={styles.clearBtn}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            activeFilterCount > 0 && styles.filterBtnActive,
          ]}
          onPress={onOpenFilterModal}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Chips */}
      <FlatList
        data={categoryData}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isSelected =
            item === 'all'
              ? filters.selectedCategory === null
              : filters.selectedCategory?.toLowerCase() === item.toLowerCase();

          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              onPress={() => onCategorySelect(item === 'all' ? null : item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {item === 'all'
                  ? 'All'
                  : item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Result stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {totalCount} product{totalCount === 1 ? '' : 's'} found
        </Text>
        {filters.sortBy !== 'default' && (
          <Text style={styles.sortStatusText}>
            Sorted: {filters.sortBy.replace('_', ' ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 6,
  },
  clearText: {
    color: '#64748B',
    fontSize: 14,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  filterIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sortStatusText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
