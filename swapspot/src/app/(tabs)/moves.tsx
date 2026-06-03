import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Demo data: Alex Kim, moving out of Lincoln Tower in 12 days
const DEMO_MOVE = {
  name: 'Alex Kim',
  community: 'Lincoln Tower',
  direction: 'out' as const,
  moveDate: (() => { const d = new Date(); d.setDate(d.getDate() + 12); return d; })(),
  totalDays: 18, // days in the "planning window"
};

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function formatMoveDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface ChecklistItem {
  daysOut: number;
  emoji: string;
  title: string;
  subtitle: string;
  done: boolean;
}

function getChecklist(daysLeft: number): ChecklistItem[] {
  return [
    {
      daysOut: 12,
      emoji: '📷',
      title: 'Photograph everything',
      subtitle: 'Walk room by room. Photo of each item = 10-second listing later.',
      done: daysLeft <= 12,
    },
    {
      daysOut: 10,
      emoji: '🏷️',
      title: 'Post items on SwapSpot',
      subtitle: 'Your photos are ready. List furniture, electronics, and anything over $20.',
      done: daysLeft <= 10,
    },
    {
      daysOut: 7,
      emoji: '🎁',
      title: 'Add to the Free Pile',
      subtitle: "Textbooks, kitchen stuff, anything you can't sell. Someone in the building will take it.",
      done: daysLeft <= 7,
    },
    {
      daysOut: 5,
      emoji: '📦',
      title: 'Start packing non-essentials',
      subtitle: 'Books, decor, off-season clothes. Keep SwapSpot items accessible for pickups.',
      done: daysLeft <= 5,
    },
    {
      daysOut: 3,
      emoji: '💬',
      title: 'Confirm all pickups',
      subtitle: 'Check your SwapSpot messages. Lock in times for every pending hand-off.',
      done: daysLeft <= 3,
    },
    {
      daysOut: 1,
      emoji: '🧹',
      title: 'Final sweep',
      subtitle: 'Last chance to add anything to the Free Pile. Leave the building better than you found it.',
      done: daysLeft <= 1,
    },
    {
      daysOut: 0,
      emoji: '🚚',
      title: "Move day — you've got this!",
      subtitle: 'All SwapSpot items should be claimed. Hand off anything remaining at the door.',
      done: daysLeft <= 0,
    },
  ];
}

export default function MovesScreen() {
  const daysLeft = daysUntil(DEMO_MOVE.moveDate);
  const progress = Math.max(0, Math.min(1, (DEMO_MOVE.totalDays - daysLeft) / DEMO_MOVE.totalDays));
  const checklist = getChecklist(daysLeft);
  const nextStep = checklist.find(c => !c.done);
  const doneCount = checklist.filter(c => c.done).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <LinearGradient
          colors={['#208AEF', '#1565C0']}
          style={{ margin: 16, borderRadius: 24, padding: 24, overflow: 'hidden' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Moving out of
              </Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 }}>
                {DEMO_MOVE.community}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                {formatMoveDate(DEMO_MOVE.moveDate)}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>🔔 Active</Text>
            </View>
          </View>

          {/* Big countdown */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 72, fontWeight: '900', lineHeight: 76 }}>{daysLeft}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600', marginTop: 2 }}>
              days until move out
            </Text>
          </View>

          {/* Progress bar */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' }}>
                {doneCount} of {checklist.length} steps done
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' }}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 }}>
              <View style={{ height: 6, width: `${progress * 100}%`, backgroundColor: '#fff', borderRadius: 3 }} />
            </View>
          </View>
        </LinearGradient>

        {/* Next action highlight */}
        {nextStep && (
          <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFF7ED', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: '#f97316' }}>
            <Text style={{ color: '#9a3412', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
              Up next · {nextStep.daysOut}d out
            </Text>
            <Text style={{ color: '#1f2937', fontSize: 15, fontWeight: '700' }}>{nextStep.emoji} {nextStep.title}</Text>
            <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4, lineHeight: 18 }}>{nextStep.subtitle}</Text>
          </View>
        )}

        {/* Checklist */}
        <Text style={{ marginHorizontal: 16, marginBottom: 12, fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Move-out checklist
        </Text>

        <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
          {checklist.map((item, i) => {
            const isNext = item === nextStep;
            const isPast = item.done;
            return (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 0 }}>
                {/* Timeline line */}
                <View style={{ alignItems: 'center', width: 32, marginRight: 12 }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: isPast ? '#208AEF' : isNext ? '#FFF7ED' : '#F3F4F6',
                    borderWidth: isNext ? 2 : 0,
                    borderColor: '#f97316',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: isPast ? 13 : 14 }}>{isPast ? '✓' : item.emoji}</Text>
                  </View>
                  {i < checklist.length - 1 && (
                    <View style={{ width: 2, flex: 1, minHeight: 24, backgroundColor: isPast ? '#208AEF' : '#E5E7EB', marginVertical: 2 }} />
                  )}
                </View>

                {/* Content */}
                <View style={{ flex: 1, paddingBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={{
                      fontSize: 14, fontWeight: '700',
                      color: isPast ? '#9CA3AF' : isNext ? '#111827' : '#374151',
                      textDecorationLine: isPast ? 'line-through' : 'none',
                    }}>
                      {item.title}
                    </Text>
                    <View style={{ backgroundColor: isPast ? '#DBEAFE' : '#F3F4F6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: isPast ? '#1d4ed8' : '#9CA3AF' }}>
                        {item.daysOut === 0 ? 'Move day' : `${item.daysOut}d out`}
                      </Text>
                    </View>
                  </View>
                  {!isPast && (
                    <Text style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 17 }}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 32, gap: 12 }}>
          {[
            { label: 'Items listed', value: '4', color: '#208AEF' },
            { label: 'Free pile', value: '2', color: '#16a34a' },
            { label: 'Pending chats', value: '1', color: '#f97316' },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600', textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
