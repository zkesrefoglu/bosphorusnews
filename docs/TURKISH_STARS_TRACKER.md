# Turkish Stars Tracker - Technical Documentation

## Overview

The Turkish Stars Tracker is a feature within the Bosphorus News Network sports section that tracks Turkish athletes playing abroad in top international leagues. It provides real-time performance data, injury status, transfer rumors, and upcoming match schedules.

---

## Athletes Tracked

| Athlete | Sport | Team | League |
|---------|-------|------|--------|
| Alperen Sengun | Basketball | Houston Rockets | NBA |
| Arda Guler | Football | Real Madrid | La Liga |
| Kenan Yildiz | Football | Juventus | Serie A |
| Ferdi Kadioglu | Football | Brighton | Premier League |
| Can Uzun | Football | Eintracht Frankfurt | Bundesliga |
| Berke Ozer | Football | Lille | Ligue 1 |

---

## File Structure

### Frontend Pages

#### `src/pages/TurkishStars.tsx`
**Purpose**: Main dashboard page displaying all tracked athletes.

**Features**:
- Displays athlete cards with profile photos and team logos
- Shows injury alerts and transfer rumors in alert sections
- Lists last match stats (PTS/REB/AST for basketball, G/A for football)
- Displays match results and upcoming fixtures
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Clickable cards linking to individual athlete profiles

**Key Components**:
- Header/Footer components for consistent site navigation
- Card components for athlete display
- Badge components for status indicators
- Date formatting using date-fns library

**Route**: `/section/sports/turkish-stars`

---

#### `src/pages/AthleteProfile.tsx`
**Purpose**: Individual athlete profile page with detailed statistics and history.

**Features**:
- Hero banner with action photo and gradient overlay
- Profile photo circle with team photo
- Tabbed navigation (Stats, Matches, Transfers, Injuries)
- Season statistics by competition
- Match history with detailed performance data
- Transfer rumors with reliability badges
- Injury history timeline

**Route**: `/section/sports/turkish-stars/:slug`

---

### Routing Configuration

#### `src/App.tsx`
Contains route definitions:
```tsx
<Route path="/section/sports/turkish-stars" element={<TurkishStars />} />
<Route path="/section/sports/turkish-stars/:slug" element={<AthleteProfile />} />
```

---

## Database Schema (Supabase/Lovable Cloud)

### Table: `athlete_profiles`
**Purpose**: Core athlete information and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Athlete's full name |
| slug | TEXT | URL-friendly identifier |
| sport | TEXT | "basketball" or "football" |
| team | TEXT | Current team name |
| league | TEXT | League name |
| position | TEXT | Playing position |
| jersey_number | INTEGER | Jersey number |
| photo_url | TEXT | Team headshot URL |
| national_photo_url | TEXT | National team photo URL |
| action_photo_url | TEXT | Action shot URL |
| team_logo_url | TEXT | Team logo URL |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

**RLS Policies**: Public read, admin-only write.

---

### Table: `athlete_daily_updates`
**Purpose**: Per-match performance tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| athlete_id | UUID | Foreign key to athlete_profiles |
| date | DATE | Match date |
| played | BOOLEAN | Whether athlete played |
| opponent | TEXT | Opposing team |
| competition | TEXT | Competition name |
| home_away | TEXT | "home" or "away" |
| match_result | TEXT | Score result |
| stats | JSONB | Sport-specific statistics |
| rating | DECIMAL | Match rating (if available) |
| minutes_played | INTEGER | Minutes on field/court |
| injury_status | TEXT | "healthy", "minor", "moderate", "major" |
| injury_details | TEXT | Injury description |

**Stats JSONB Structure**:
- Basketball: `{ "points": 20, "rebounds": 10, "assists": 5 }`
- Football: `{ "goals": 1, "assists": 0 }`

**RLS Policies**: Public read, admin-only write.

---

### Table: `athlete_transfer_rumors`
**Purpose**: Transfer news and speculation tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| athlete_id | UUID | Foreign key to athlete_profiles |
| rumor_date | DATE | Date of rumor |
| headline | TEXT | Rumor headline |
| summary | TEXT | Detailed summary |
| source | TEXT | News source name |
| source_url | TEXT | Link to original article |
| reliability | TEXT | "tier1", "tier2", "tier3", "tier4" |
| status | TEXT | "active", "confirmed", "denied" |

**Reliability Tiers**:
- Tier 1: Most reliable (green badge)
- Tier 2: Reliable (blue badge)
- Tier 3: Speculative (yellow badge)
- Tier 4: Unreliable (gray badge)

**RLS Policies**: Public read, admin-only write.

---

### Table: `athlete_upcoming_matches`
**Purpose**: Scheduled fixture tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| athlete_id | UUID | Foreign key to athlete_profiles |
| match_date | TIMESTAMP | Date and time of match |
| opponent | TEXT | Opposing team |
| competition | TEXT | Competition name |
| home_away | TEXT | "home" or "away" |

**RLS Policies**: Public read, admin-only write.

---

### Table: `athlete_season_stats`
**Purpose**: Aggregated season-level statistics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| athlete_id | UUID | Foreign key to athlete_profiles |
| season | TEXT | Season identifier (e.g., "2024-25") |
| competition | TEXT | Competition name |
| games_played | INTEGER | Total games |
| games_started | INTEGER | Games started |
| stats | JSONB | Aggregated statistics |

**Stats JSONB Structure**:
- Basketball: `{ "points_per_game": 18.5, "rebounds_per_game": 9.2, ... }`
- Football: `{ "goals": 5, "assists": 3, "clean_sheets": 2, ... }`

**RLS Policies**: Public read, admin-only write.

---

## Assets

### Athlete Images
Located in `public/athletes/`:

| File Pattern | Description |
|--------------|-------------|
| `{slug}-team.{ext}` | Team/club photo |
| `{slug}-national.{ext}` | National team photo |
| `{slug}-action.{ext}` | Action shot for banner |
| `{slug}-logo.jpg` | Team logo |

**Image Specifications**:
- Profile photos: Any aspect ratio (displayed in 200x200 containers)
- Action photos: 1920x350-400px landscape (athlete on right side)
- Team logos: Square format preferred

### Flag Image
- `public/images/turkish-flag.jpg` - Turkish flag for dashboard title

---

## UI/UX Features

### Dashboard Cards
- 200x200px profile photo on left
- 200x200px team logo on right (white background)
- Jersey number and sport emoji overlay
- Hover animations (scale-105, shadow)
- Color-coded injury status badges
- Last match stats display

### Profile Page
- Hero banner with action photo
- 50% gradient overlay (left side)
- Circular team photo with hover zoom
- Tabbed content navigation
- Responsive mobile-first design

### Color Coding
- **Injury Status**:
  - Healthy: Green
  - Minor: Yellow
  - Moderate: Orange
  - Major: Red

- **Transfer Reliability**:
  - Tier 1: Green (highly reliable)
  - Tier 2: Blue (reliable)
  - Tier 3: Yellow (speculative)
  - Tier 4: Gray (rumor)

---

## Data Flow

1. **Page Load**: Components fetch data from Supabase using `Promise.all` for efficiency
2. **Real-time**: Data refreshes on page navigation (no live subscriptions currently)
3. **Filtering**: Helper functions filter data by athlete ID, date ranges, etc.
4. **Formatting**: Stats formatted based on sport type (basketball vs football)

---

## Security

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Public Read**: Anyone can view athlete data
- **Admin Write**: Only users with admin role can insert/update/delete
- **Admin Check**: `has_role(auth.uid(), 'admin')` function validates permissions

---

## Future Enhancements

Potential features to consider:
- Live match tracking
- Push notifications for match starts
- Historical performance charts
- Comparison tool between athletes
- Social media feed integration
- Fantasy points tracking
