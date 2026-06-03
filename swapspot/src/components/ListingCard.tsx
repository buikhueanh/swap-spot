import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';
import type { ListingWithSeller } from '@/types/database';

interface Props {
  listing: ListingWithSeller;
  onPress?: () => void;
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function daysUntil(dateStr: string | null): { label: string; urgent: boolean } | null {
  if (!dateStr) return null;
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: 'Pickup passed', urgent: false };
  if (days === 0) return { label: 'Pickup today!', urgent: true };
  if (days === 1) return { label: '1 day left', urgent: true };
  return { label: `${days}d left`, urgent: days <= 3 };
}

const CATEGORY_EMOJI: Record<string, string> = {
  Furniture: '🛋️', Electronics: '💻', Appliances: '🧊',
  Kitchen: '🍳', Books: '📚', Sports: '🚴', Household: '🧹',
  Plants: '🌿',
};

export function ListingCard({ listing, onPress }: Props) {
  const deadline = daysUntil(listing.available_until);
  const emoji = CATEGORY_EMOJI[listing.category ?? ''] ?? '📦';
  const isFree = listing.kind === 'free';

  return (
    <TouchableOpacity
      style={{ marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Image */}
      {listing.images.length > 0 ? (
        <Image
          source={{ uri: listing.images[0] }}
          style={{ width: '100%', height: 180, backgroundColor: '#F3F4F6' }}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={{ width: '100%', height: 180, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 48 }}>{emoji}</Text>
        </View>
      )}

      {/* Free badge overlay */}
      {isFree && (
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#16a34a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>FREE</Text>
        </View>
      )}

      {/* Deadline badge overlay */}
      {deadline && (
        <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: deadline.urgent ? '#ea580c' : 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{deadline.label}</Text>
        </View>
      )}

      {/* Info */}
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 }} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: isFree ? '#16a34a' : '#208AEF' }}>
            {formatPrice(listing.price_cents)}
          </Text>
        </View>

        {listing.description ? (
          <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>
            {listing.description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {listing.category ? (
              <View style={{ backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '600' }}>{emoji} {listing.category}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#208AEF', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{listing.users?.name?.[0]?.toUpperCase()}</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '500' }}>{listing.users?.name}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
