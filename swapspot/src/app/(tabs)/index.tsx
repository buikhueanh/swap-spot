import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/ListingCard';
import type { ListingWithSeller } from '@/types/database';

// Demo: query all available sale listings (no RLS since not authenticated)
// Replace with community-scoped query in Phase 1 once auth is live
export default function FeedScreen() {
  const { data: listings = [], isLoading } = useQuery<ListingWithSeller[]>({
    queryKey: ['listings', 'sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, users(id, name, rep_score)')
        .eq('kind', 'sale')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ListingWithSeller[];
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-brand">SwapSpot</Text>
          <Text className="text-xs text-gray-400">Lincoln Tower · For Sale</Text>
        </View>
        <View className="bg-brand-light rounded-full px-3 py-1">
          <Text className="text-brand text-xs font-semibold">{listings.length} listings</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#208AEF" />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => <ListingCard listing={item} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-400 text-base">No listings yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
