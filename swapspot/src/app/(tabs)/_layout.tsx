import { Tabs } from 'expo-router';
import { View } from 'react-native';

const BRAND = '#208AEF';

function TabIcon({ color, size, children }: { color: string; size: number; children: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <View style={{ backgroundColor: color === BRAND ? '#E6F4FE' : 'transparent', borderRadius: 8, padding: 4 }}>
        {/* placeholder glyph */}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#E5E7EB', height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="free-pile" options={{ title: 'Free Pile' }} />
      <Tabs.Screen name="moves" options={{ title: 'My Move' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
