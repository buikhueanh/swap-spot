/**
 * SwapSpot seed script
 * Creates 2 communities, 6 users, and 12 listings for demo purposes.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (never in the app bundle).
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

// Load .env manually (tsx doesn't auto-load it)
import { readFileSync } from 'fs';
import { join } from 'path';

function loadEnv() {
  try {
    const env = readFileSync(join(__dirname, '../.env'), 'utf-8');
    for (const line of env.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    }
  } catch {
    // .env not found, rely on process.env
  }
}
loadEnv();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_PASSWORD = 'swapspot-dev-2026';

async function seed() {
  console.log('🌱 Seeding SwapSpot...\n');

  // ── 0. Wipe existing seed data (idempotent re-runs) ──────────────────────────
  console.log('Clearing existing data...');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('moves').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('communities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  ✓ cleared\n');

  // ── 1. Communities ───────────────────────────────────────────────────────────
  console.log('Creating communities...');
  const { data: communities, error: commErr } = await supabase
    .from('communities')
    .insert([
      { name: 'Lincoln Tower', type: 'dorm', email_domains: ['stateu.edu'] },
      { name: 'Riverside Apartments', type: 'apartment', email_domains: ['cityuni.edu'] },
    ])
    .select();

  if (commErr) { console.error('communities:', commErr.message); process.exit(1); }
  const [lincoln, riverside] = communities!;
  console.log(`  ✓ ${lincoln.name} (${lincoln.id})`);
  console.log(`  ✓ ${riverside.name} (${riverside.id})\n`);

  // ── 2. Auth users + profiles ─────────────────────────────────────────────────
  const userData = [
    { email: 'alex@stateu.edu',   name: 'Alex Kim',    community_id: lincoln.id,   verified: true },
    { email: 'sam@stateu.edu',    name: 'Sam Rivera',  community_id: lincoln.id,   verified: true },
    { email: 'jordan@stateu.edu', name: 'Jordan Lee',  community_id: lincoln.id,   verified: true },
    { email: 'morgan@cityuni.edu',name: 'Morgan Chen', community_id: riverside.id, verified: true },
    { email: 'casey@cityuni.edu', name: 'Casey Patel', community_id: riverside.id, verified: true },
    { email: 'riley@cityuni.edu', name: 'Riley Nguyen',community_id: riverside.id, verified: true },
  ];

  console.log('Creating auth users + profiles...');
  const userIds: Record<string, string> = {};

  // Fetch all existing auth users once
  const { data: existingAuth } = await supabase.auth.admin.listUsers({ perPage: 100 });
  const existingByEmail = new Map((existingAuth?.users ?? []).map(u => [u.email!, u.id]));

  for (const u of userData) {
    let authId = existingByEmail.get(u.email);

    if (authId) {
      console.log(`  ~ ${u.email} (reusing existing auth user)`);
    } else {
      const { data: created, error: authErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: SEED_PASSWORD,
        email_confirm: true,
      });
      if (authErr) { console.error(`  ✗ ${u.email}: ${authErr.message}`); continue; }
      authId = created.user.id;
      console.log(`  ✓ ${u.email} (${authId})`);
    }

    userIds[u.email] = authId;

    // Insert profile (we deleted existing profiles above)
    const { error: profileErr } = await supabase.from('users').insert({
      id: authId,
      name: u.name,
      community_id: u.community_id,
      verified: u.verified,
      rep_score: Math.floor(Math.random() * 40),
    });
    if (profileErr) console.error(`  ✗ profile for ${u.email}: ${profileErr.message}`);
  }
  console.log();

  // ── 3. Moves ─────────────────────────────────────────────────────────────────
  console.log('Creating moves...');
  const today = new Date();
  const moveOut = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  };

  const moveData = [
    { email: 'alex@stateu.edu',   move_date: moveOut(12), direction: 'out' as const, status: 'active' as const },
    { email: 'sam@stateu.edu',    move_date: moveOut(5),  direction: 'out' as const, status: 'active' as const },
    { email: 'jordan@stateu.edu', move_date: moveOut(20), direction: 'in'  as const, status: 'planning' as const },
    { email: 'morgan@cityuni.edu',move_date: moveOut(8),  direction: 'out' as const, status: 'active' as const },
    { email: 'casey@cityuni.edu', move_date: moveOut(3),  direction: 'out' as const, status: 'active' as const },
    { email: 'riley@cityuni.edu', move_date: moveOut(15), direction: 'in'  as const, status: 'planning' as const },
  ];

  const moveIds: Record<string, string> = {};
  for (const m of moveData) {
    const userId = userIds[m.email];
    if (!userId) continue;
    const { data: mv } = await supabase.from('moves').insert({
      user_id: userId,
      move_date: m.move_date,
      direction: m.direction,
      status: m.status,
    }).select().single();
    if (mv) moveIds[m.email] = mv.id;
  }
  console.log(`  ✓ ${Object.keys(moveIds).length} moves created\n`);

  // ── 4. Listings ──────────────────────────────────────────────────────────────
  console.log('Creating listings...');

  const availableUntil = (daysFromNow: number) => moveOut(daysFromNow);

  // Direct image URLs — no redirects, reliable for React Native
  // Using picsum.photos seed-based: consistent per listing, real photos
  const pic = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

  const listings = [
    // Lincoln Tower — For Sale
    { email: 'alex@stateu.edu', community_id: lincoln.id, title: 'IKEA MALM Queen Bed Frame', description: 'White, barely used. All hardware included. You disassemble.', price_cents: 8000, kind: 'sale' as const, category: 'Furniture', available_until: availableUntil(11), images: [pic('bed-malm')] },
    { email: 'alex@stateu.edu', community_id: lincoln.id, title: 'Desktop Monitor 27" Dell', description: '1440p, 75Hz. Minor scratch on base. Works perfectly.', price_cents: 12000, kind: 'sale' as const, category: 'Electronics', available_until: availableUntil(11), images: [pic('monitor-desk')] },
    { email: 'sam@stateu.edu',  community_id: lincoln.id, title: 'Mini Fridge — 3.2 cu ft', description: 'Runs cold. No ice maker. Great for dorm rooms.', price_cents: 5500, kind: 'sale' as const, category: 'Appliances', available_until: availableUntil(4), images: [pic('mini-fridge')] },
    { email: 'sam@stateu.edu',  community_id: lincoln.id, title: 'Standing Desk (adjustable)', description: 'Flexispot E2. Width 55". Minor ding on corner.', price_cents: 15000, kind: 'sale' as const, category: 'Furniture', available_until: availableUntil(4), images: [pic('standing-desk')] },
    // Lincoln Tower — Free
    { email: 'alex@stateu.edu', community_id: lincoln.id, title: 'Box of Kitchen Misc', description: 'Plates, cups, one pan. Take the whole box.', price_cents: 0, kind: 'free' as const, category: 'Kitchen', available_until: availableUntil(12), images: [pic('kitchen-box')] },
    { email: 'sam@stateu.edu',  community_id: lincoln.id, title: 'Textbooks (various)', description: 'Calc 2, Orgo, Stats. Free — just take them.', price_cents: 0, kind: 'free' as const, category: 'Books', available_until: availableUntil(5), images: [pic('textbooks-stack')] },
    // Riverside Apartments — For Sale
    { email: 'morgan@cityuni.edu', community_id: riverside.id, title: 'Couch — Grey 3-seater', description: 'IKEA SÖDERHAMN. Great condition. Needs 3 people to move.', price_cents: 20000, kind: 'sale' as const, category: 'Furniture', available_until: availableUntil(7), images: [pic('grey-sofa')] },
    { email: 'morgan@cityuni.edu', community_id: riverside.id, title: 'Dyson V8 Cordless Vacuum', description: 'Works great. Comes with all attachments.', price_cents: 9000, kind: 'sale' as const, category: 'Appliances', available_until: availableUntil(7), images: [pic('vacuum-dyson')] },
    { email: 'casey@cityuni.edu',  community_id: riverside.id, title: 'Road Bike (Trek FX 2)', description: '2022, size M. Needs a tune-up. Lock included.', price_cents: 35000, kind: 'sale' as const, category: 'Sports', available_until: availableUntil(2), images: [pic('road-bike')] },
    { email: 'casey@cityuni.edu',  community_id: riverside.id, title: 'Coffee Table (wood)', description: 'Simple wood coffee table, 40x20". Small scratch.', price_cents: 2500, kind: 'sale' as const, category: 'Furniture', available_until: availableUntil(2), images: [pic('coffee-table')] },
    // Riverside Apartments — Free
    { email: 'morgan@cityuni.edu', community_id: riverside.id, title: 'Bag of Cleaning Supplies', description: 'Windex, sponges, mop head, trash bags. All yours.', price_cents: 0, kind: 'free' as const, category: 'Household', available_until: availableUntil(8), images: [pic('cleaning-supplies')] },
    { email: 'casey@cityuni.edu',  community_id: riverside.id, title: 'Monstera Plant (medium)', description: 'Healthy, needs a pot upgrade. Take it before I move!', price_cents: 0, kind: 'free' as const, category: 'Plants', available_until: availableUntil(3), images: [pic('monstera-plant')] },
  ];

  let count = 0;
  for (const l of listings) {
    const userId = userIds[l.email];
    const moveId = moveIds[l.email];
    if (!userId) continue;
    const { error } = await supabase.from('listings').insert({
      user_id: userId,
      community_id: l.community_id,
      move_id: moveId ?? null,
      title: l.title,
      description: l.description,
      price_cents: l.price_cents,
      kind: l.kind,
      status: 'available',
      category: l.category,
      available_until: l.available_until,
      images: l.images,
    });
    if (error) console.error(`  ✗ "${l.title}": ${error.message}`);
    else { console.log(`  ✓ ${l.kind === 'free' ? '[FREE]' : `[$${l.price_cents / 100}]`} ${l.title}`); count++; }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   2 communities | ${Object.keys(userIds).length} users | ${count} listings`);
  console.log(`\nDemo credentials (password: ${SEED_PASSWORD}):`);
  for (const u of userData) {
    console.log(`   ${u.email}`);
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
