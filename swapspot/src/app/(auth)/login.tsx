import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';

const DEV_USERS = [
  { label: 'Alex (Lincoln Tower)', email: 'alex@stateu.edu' },
  { label: 'Morgan (Riverside)', email: 'morgan@cityuni.edu' },
];
const DEV_PASSWORD = 'swapspot-dev-2026';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleSubmit(overrideEmail?: string, overridePassword?: string) {
    const e = overrideEmail ?? email;
    const p = overridePassword ?? password;
    if (!e || !p) return;
    setLoading(true);
    const { error } = mode === 'login' || overrideEmail
      ? await supabase.auth.signInWithPassword({ email: e, password: p })
      : await supabase.auth.signUp({ email: e, password: p });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-4xl font-bold text-brand mb-1">SwapSpot</Text>
        <Text className="text-base text-gray-500 mb-8">Moving out? We'll handle the stuff.</Text>

        {/* Dev shortcuts */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <Text className="text-yellow-700 text-xs font-bold mb-2">DEV — tap to sign in instantly</Text>
          <View className="flex-row gap-2">
            {DEV_USERS.map(u => (
              <TouchableOpacity
                key={u.email}
                className="flex-1 bg-yellow-100 rounded-lg py-2 items-center"
                onPress={() => handleSubmit(u.email, DEV_PASSWORD)}
                disabled={loading}
              >
                <Text className="text-yellow-800 text-xs font-semibold text-center">{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Email</Text>
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4 bg-gray-50"
          placeholder="you@university.edu"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Password</Text>
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-gray-50"
          placeholder="••••••••"
          secureTextEntry
          autoComplete="off"
          textContentType="none"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-brand rounded-xl py-4 items-center mb-4"
          onPress={() => handleSubmit()}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-bold text-base">{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(m => m === 'login' ? 'signup' : 'login')}>
          <Text className="text-center text-gray-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text className="text-brand font-semibold">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
