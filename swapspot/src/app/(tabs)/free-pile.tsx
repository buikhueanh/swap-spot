import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/ListingCard';
import type { ListingWithSeller } from '@/types/database';

export default function FreePileScreen() {
  const { data: listings = [], isLoading } = useQuery<ListingWithSeller[]>({
    queryKey: ['listings', 'free'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, users(id, name, rep_score)')
        .eq('kind', 'free')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ListingWithSeller[];
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Free Pile</Text>
        <Text className="text-gray-400 text-sm">Free items from your neighbors</Text>
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
              <Text className="text-gray-400 text-base">Nothing free yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
