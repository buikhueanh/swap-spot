import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text className="text-2xl font-bold text-gray-900 pt-2 mb-6">Profile</Text>

      <View className="bg-gray-50 rounded-2xl p-4 mb-4">
        <View className="w-14 h-14 rounded-full bg-brand items-center justify-center mb-3">
          <Text className="text-white font-bold text-xl">{profile?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">{profile?.name ?? '—'}</Text>
        <View className="flex-row items-center gap-2 mt-1">
          {profile?.verified && (
            <View className="bg-green-100 rounded-full px-2 py-0.5">
              <Text className="text-green-700 text-xs font-semibold">✓ Verified</Text>
            </View>
          )}
          <View className="bg-brand-light rounded-full px-2 py-0.5">
            <Text className="text-brand text-xs font-semibold">⭐ {profile?.rep_score ?? 0} rep</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="border border-red-200 rounded-xl py-3 items-center mt-auto mb-4"
        onPress={signOut}
      >
        <Text className="text-red-500 font-semibold">Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
