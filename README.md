# Leon & the Black Lion Club: Yojimbo

A Telegram Mini App tap-to-earn RPG game featuring Leon, a fierce black lion samurai warrior. Progress through 9 visual stages from Fundoshi warrior to divine Cherub tier while mastering six core stats and engaging in turn-based combat.

## 🎮 Game Features

### Core Gameplay
- **Tap-to-Earn Mechanics**: Tap Leon to gain experience and level up
- **Six-Stat System**: Health, Stamina, Energy, Strength, Speed, and Luck
- **Progressive Leveling**: Start at level 1, infinite scaling with 1.5x EXP multiplier per level
- **Visual Evolution**: Leon's appearance changes across 11 distinct tiers based on level

### Leon's Evolution
1. **Levels 1-9**: Fundoshi (traditional Japanese warrior attire)
2. **Levels 10-70**: Seven samurai armor stages (Kosode & Hakama → Legendary Armor)
3. **Levels 80-89**: Sengoku Tosei-Gusoku with menpo faceplate and yari spear
4. **Levels 90-99**: Angel Tier with majestic wings
5. **Level 100+**: Cherub Tier with four divine faces (lion, eagle, ox, human)

### Combat System
- **Patrol Mode**: Random monster encounters based on Luck stat
- **Turn-Based Combat**: Speed-based initiative with Attack, Magic, Item, and Flee options
- **RPG Battle Interface**: Classic 2.5D layout with health bars and combat log
- **Monster Variety**: Six enemy types with level-scaling difficulty
- **Loot System**: Item drops based on Luck stat

### Stats & Progression
- **Health**: Max HP and regeneration (10 + invested points per hour)
- **Stamina**: Sustained actions (10 + invested points per minute)
- **Energy**: Tap/patrol fuel (10 + invested points per second)
- **Strength**: Combat damage (base 10 = 1-10 damage, scales linearly)
- **Speed**: Attack frequency and initiative (base 10 = 1 attack/sec)
- **Luck**: Critical chance, encounter rate, and drop quality

### Referral System
- **First 5 Friends**: +10 Ability Points each (permanent bonus)
- **6+ Friends**: Rejuvenation Potion (full HP/Stamina/Energy + 2x recovery)
- **Whitelist Tab**: Track referrals and copy referral link

### Navigation
Five tabs:
1. **Home/Main**: Tapping screen with Leon
2. **Patrol**: Monster encounters (locked until 1 AP spent)
3. **Abilities**: Stat allocation screen
4. **Earn**: Tasks and missions (placeholder)
5. **Whitelist**: Referral and friends system

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (mobile-first design)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Platform**: Telegram Mini App with WebApp API integration
- **State Management**: React Hooks + Supabase real-time sync

## 📦 Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd leon-yojimbo
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**:
```bash
npm run dev
```

5. **Build for production**:
```bash
npm run build
```

## 🗄️ Database Schema

The game uses Supabase with five main tables:

- `players`: Core player data (level, EXP, coins, ability points)
- `player_stats`: Six stats with current/max values and invested points
- `referrals`: Tracks referral relationships and bonuses
- `combat_encounters`: Logs battle outcomes and rewards
- `player_inventory`: Stores earned items

All tables have Row Level Security enabled for data protection.

## 🎯 Key Game Mechanics

### Leveling System
- **Starting Level**: 1
- **EXP Formula**: 10 × (1.5 ^ (level - 1))
- **Ability Points**: +10 per level (base) + referral bonus
- **EXP on Defeat**: Lose 10% of total EXP

### Stat Regeneration
- **Energy**: Every second (10 + invested points)
- **Stamina**: Every minute (10 + invested points)
- **Health**: Every hour (10 + invested points)

### Combat Calculations
- **Damage Range**: (Strength - 5) to Strength
- **Critical Hit**: 10% base + (Luck / 1000) chance for 2x max damage
- **Encounter Chance**: 10% base + (Luck invested × 1%)
- **Flee Chance**: 50% base ± (Speed difference × 5%)

### Patrol Lock Mechanism
Patrol tab remains locked until player spends at least 1 Ability Point in any stat.

## 📱 Telegram Integration

- **WebApp API**: Full Telegram WebApp initialization and theming
- **Haptic Feedback**: Light/medium/heavy impacts on taps and actions
- **Mobile Optimization**: Touch-friendly UI with proper viewport settings
- **Auto-expand**: App expands to full screen on load

## 🎨 Placeholder Assets

The following image paths are referenced but need actual assets:

### Leon Stages
- `/images/leon-level-1.png` through `/images/leon-level-70.png`
- `/images/leon-sengoku.png`
- `/images/leon-angel.png`
- `/images/leon-cherub.png`

### Monster Types
- `/images/monsters/feral-wolf.png`
- `/images/monsters/mountain-bandit.png`
- `/images/monsters/demon-ronin.png`
- `/images/monsters/shadow-assassin.png`
- `/images/monsters/cursed-samurai.png`
- `/images/monsters/oni-warlord.png`

## 🚀 Deployment

The app can be deployed to any static hosting service (Vercel, Netlify, etc.) or integrated directly into a Telegram Bot using Bot Father and the Mini App feature.

## 📄 License

This project is provided as-is for educational and development purposes.

---

**Note**: This is a complete full-stack game with database persistence, real-time stat regeneration, and Telegram integration. Replace placeholder images with actual artwork for production use.
