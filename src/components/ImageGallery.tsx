import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ImageGalleryProps {
  images: string[];
  thumbnail: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  thumbnail,
}) => {
  const allImages = images && images.length > 0 ? images : [thumbnail];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeUri = allImages[selectedIndex] || thumbnail;

  return (
    <View style={styles.container}>
      {/* Main Image */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: activeUri }}
          style={styles.mainImage}
          resizeMode="contain"
        />
        {allImages.length > 1 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {selectedIndex + 1} / {allImages.length}
            </Text>
          </View>
        )}
      </View>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        >
          {allImages.map((uri, index) => {
            const isSelected = index === selectedIndex;
            return (
              <TouchableOpacity
                key={`${uri}-${index}`}
                style={[
                  styles.thumbnailWrapper,
                  isSelected && styles.thumbnailWrapperSelected,
                ]}
                onPress={() => setSelectedIndex(index)}
              >
                <Image source={{ uri }} style={styles.thumbnail} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
  },
  mainImageContainer: {
    position: 'relative',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  counterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  thumbnailList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  thumbnailWrapperSelected: {
    borderColor: '#2563EB',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
