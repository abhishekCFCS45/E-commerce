import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductFilters, SortOption } from '../types';

interface FilterModalProps {
  visible: boolean;
  filters: ProductFilters;
  onClose: () => void;
  onApply: (filters: Partial<ProductFilters>) => void;
  onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [selectedSort, setSelectedSort] = useState<SortOption>(filters.sortBy);
  const [minPrice, setMinPrice] = useState(
    filters.minPrice !== null ? String(filters.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice !== null ? String(filters.maxPrice) : ''
  );
  const [minRating, setMinRating] = useState<number | null>(filters.minRating);
  const [inStockOnly, setInStockOnly] = useState(filters.inStockOnly);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Featured (Default)', value: 'default' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
    { label: 'Alphabetical (A - Z)', value: 'title_asc' },
  ];

  const ratingOptions = [
    { label: 'All', value: null },
    { label: '4★ & above', value: 4 },
    { label: '3★ & above', value: 3 },
    { label: '2★ & above', value: 2 },
  ];

  const handleApply = () => {
    onApply({
      sortBy: selectedSort,
      minPrice: minPrice.trim() ? parseFloat(minPrice) : null,
      maxPrice: maxPrice.trim() ? parseFloat(maxPrice) : null,
      minRating,
      inStockOnly,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedSort('default');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
    setInStockOnly(false);
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody}>
            {/* Sort Options */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.chipsContainer}>
              {sortOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    selectedSort === opt.value && styles.chipActive,
                  ]}
                  onPress={() => setSelectedSort(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedSort === opt.value && styles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <Text style={styles.sectionTitle}>Price Range ($)</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min Price"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.priceSeparator}>to</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max Price"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Rating Filter */}
            <Text style={styles.sectionTitle}>Customer Rating</Text>
            <View style={styles.chipsContainer}>
              {ratingOptions.map(r => (
                <TouchableOpacity
                  key={String(r.value)}
                  style={[
                    styles.chip,
                    minRating === r.value && styles.chipActive,
                  ]}
                  onPress={() => setMinRating(r.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      minRating === r.value && styles.chipTextActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stock Availability */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>In-Stock Items Only</Text>
              <Switch
                value={inStockOnly}
                onValueChange={setInStockOnly}
                trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    marginTop: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#64748B',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
