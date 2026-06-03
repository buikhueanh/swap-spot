import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Community } from '@/types/database';

export default function OnboardScreen() {
  const [name, setName] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: communities = [] } = useQuery<Community[]>({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('communities').select('*');
      if (error) throw error;
      return data;
    },
  });

  async function handleSave() {
    if (!name.trim() || !selectedCommunity) {
      Alert.alert('Fill in all fields');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase.from('users').insert({
      id: user.id,
      name: name.trim(),
      community_id: selectedCommunity,
      verified: user.email?.split('@')[1]
        ? communities.find(c => c.id === selectedCommunity)?.email_domains.includes(user.email!.split('@')[1]) ?? false
        : false,
    });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900 mb-1">Set up your profile</Text>
      <Text className="text-gray-500 mb-8">Tell us your name and where you live.</Text>

      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Your name</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-gray-50"
        placeholder="Alex Kim"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Your community</Text>
      {communities.map(c => (
        <TouchableOpacity
          key={c.id}
          className={`border rounded-xl px-4 py-3 mb-2 ${selectedCommunity === c.id ? 'border-brand bg-brand-light' : 'border-gray-200 bg-gray-50'}`}
          onPress={() => setSelectedCommunity(c.id)}
        >
          <Text className={`font-semibold ${selectedCommunity === c.id ? 'text-brand' : 'text-gray-800'}`}>{c.name}</Text>
          <Text className="text-xs text-gray-400 capitalize">{c.type}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        className="bg-brand rounded-xl py-4 items-center mt-6"
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="white" />
          : <Text className="text-white font-bold text-base">Let's go</Text>
        }
      </TouchableOpacity>
    </View>
  );
}
