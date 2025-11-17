# News Platform Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features & Functionalities](#features--functionalities)
4. [Database Architecture](#database-architecture)
5. [AI Integration](#ai-integration)
6. [Security Implementation](#security-implementation)
7. [User Roles & Authentication](#user-roles--authentication)
8. [Admin Panel](#admin-panel)
9. [Frontend Architecture](#frontend-architecture)
10. [API & Edge Functions](#api--edge-functions)
11. [Deployment & Configuration](#deployment--configuration)

---

## Project Overview

A modern, full-stack news platform built with React and TypeScript, featuring dynamic content management, AI-powered headline generation, and a comprehensive admin panel. The platform supports multiple news categories, daily topic highlights (Agenda), and real-time content publishing.

### Key Highlights
- **Real-time Publishing**: Articles appear instantly on category pages after publishing
- **AI-Powered**: Automated headline generation using Google Gemini 2.5 Flash
- **Role-Based Access**: Secure admin panel with proper authorization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Proper meta tags, semantic HTML, and clean URLs

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM v6
- **State Management**: React hooks (useState, useEffect)
- **Form Validation**: Zod schema validation
- **Notifications**: Sonner toast notifications

### Backend (Lovable Cloud/Supabase)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with email/password
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage (configured but not actively used)

### AI Integration
- **Provider**: Lovable AI Gateway
- **Model**: Google Gemini 2.5 Flash
- **Use Case**: Automated headline/excerpt generation from article content

---

## Features & Functionalities

### Public-Facing Features

#### 1. Homepage (`/`)
- **Daily Topic/Agenda**: Featured article displayed prominently at the top
- **Latest News Feed**: Chronological list of all published articles (excluding Agenda)
- **Dynamic Content**: Real-time updates from the database
- **Responsive Layout**: Optimized for all screen sizes

#### 2. Category Pages (`/section/:category`)
- **Filtered Content**: Shows only articles from the selected category
- **Available Categories**:
  - World
  - Business
  - Sports
  - Technology
  - Xtra (additional content)
  - Agenda (daily topics)
- **Real-time Updates**: Fetches directly from database

#### 3. Article Pages (`/article/:slug`)
- **Full Article View**: Complete article content with metadata
- **Image Display**: Optional featured image displayed at top of article (if `image_url` is provided)
- **Author Attribution**: Display author and publication date
- **SEO Optimized**: Proper meta tags and structured data

#### 4. Newsletter Subscription
- **Email Collection**: Store subscriber emails in database
- **Validation**: Email format validation with Zod
- **Toast Notifications**: User feedback on subscription status

### Admin Features

#### 1. Authentication (`/auth`)
- **Email/Password Login**: Secure authentication via Supabase Auth
- **Role Verification**: Checks for admin role before granting access
- **Session Management**: Persistent sessions with auto-refresh
- **Redirect Logic**: Non-admins redirected to homepage

#### 2. Article Management

##### Add Single Article
- **Form Fields**:
  - Title (max 200 characters)
  - Category/Section selection
  - Excerpt (max 500 characters)
  - Content (max 50,000 characters)
  - Image URL (optional, validated URL format)
  - Author name
- **Validation**: Client-side Zod validation with error messages
- **Auto-slug Generation**: Creates URL-friendly slugs from titles
- **Immediate Publishing**: Articles go live instantly

##### Bulk Article Upload
- **File Support**: 
  - Microsoft Word (.docx)
  - Plain text (.txt)
- **Document Parsing**: Extracts structured news items from formatted documents
- **AI Processing**: Generates headlines for each item using Lovable AI
- **Batch Insert**: Efficiently inserts multiple articles at once
- **Progress Tracking**: Shows real-time conversion progress

##### Manage Articles Tab
- **Article List**: View all articles with metadata
- **Status Filtering**: Filter by "All", "Published", or "Unpublished"
- **Quick Actions**:
  - **Edit**: Modify existing articles inline
  - **Delete**: Remove articles with confirmation dialog
  - **Publish/Unpublish Toggle**: Show/hide articles without deletion
- **Visual Indicators**:
  - Eye icon for published articles
  - EyeOff icon for unpublished articles
  - Switch component for quick status changes
- **Real-time Updates**: Changes reflect immediately on public pages

#### 3. Daily Topic (Agenda) Management
- **Dedicated Form**: Separate form for Agenda articles
- **Fields**:
  - Title
  - Excerpt
  - Content
  - Author
- **Auto-categorization**: Automatically tagged as "Agenda" category
- **Featured Display**: Appears as highlighted section on homepage

---

## Database Architecture

### Tables

#### 1. `news_articles`
Primary table for all news content.

**Columns:**
- `id` (uuid, PK): Auto-generated unique identifier
- `title` (text, NOT NULL): Article headline
- `slug` (text, NOT NULL): URL-friendly identifier
- `category` (text, NOT NULL): Article section (World, Business, etc.)
- `excerpt` (text, NOT NULL): Short summary/teaser
- `content` (text, NOT NULL): Full article body
- `author` (text, NOT NULL): Article author name
- `image_url` (text, NULLABLE): Optional article image
- `published` (boolean, DEFAULT false): Publication status
- `created_at` (timestamp, DEFAULT now()): Creation timestamp
- `updated_at` (timestamp, DEFAULT now()): Last modification timestamp

**Indexes:**
- Primary key on `id`
- Index on `category` for efficient filtering
- Index on `created_at` for chronological sorting
- Unique constraint on `slug` to prevent duplicates

**RLS Policies:**
- `Anyone can view published articles`: SELECT where `published = true`
- `Admins can view all articles`: SELECT where user has admin role
- `Admins can insert articles`: INSERT with admin role check
- `Admins can update articles`: UPDATE with admin role check
- `Admins can delete articles`: DELETE with admin role check

#### 2. `daily_topics`
Separate table for Agenda/Daily Topic articles (legacy).

**Columns:**
- `id` (uuid, PK)
- `title` (text, NOT NULL)
- `slug` (text, NOT NULL)
- `excerpt` (text, NOT NULL)
- `content` (text, NOT NULL)
- `author` (text, NOT NULL)
- `published` (boolean, DEFAULT false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**RLS Policies:**
- Similar to `news_articles`
- Public SELECT for published topics
- Admin-only INSERT, UPDATE, DELETE

**Note**: Currently, Agenda articles are stored in `news_articles` with category "Agenda", so this table is not actively used but maintained for legacy data.

#### 3. `newsletter_subscriptions`
Stores email addresses of newsletter subscribers.

**Columns:**
- `id` (uuid, PK)
- `email` (text, NOT NULL, UNIQUE)
- `created_at` (timestamp, DEFAULT now())

**RLS Policies:**
- `Anyone can subscribe`: INSERT allowed for all users
- No SELECT, UPDATE, or DELETE policies (admin-only access via backend)

#### 4. `profiles`
User profile information linked to authentication.

**Columns:**
- `id` (uuid, PK): References `auth.users(id)`
- `email` (text, NULLABLE)
- `created_at` (timestamp, DEFAULT now())
- `updated_at` (timestamp, DEFAULT now())

**RLS Policies:**
- `Users can view own profile`: SELECT where `auth.uid() = id`

**Trigger:**
- `handle_new_user`: Automatically creates profile entry on user signup

#### 5. `user_roles`
Role-based access control table.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL): References user
- `role` (app_role enum, NOT NULL): 'admin' or 'user'
- `created_at` (timestamp, DEFAULT now())

**Constraints:**
- Unique constraint on `(user_id, role)` to prevent duplicates

**RLS Policies:**
- `Admins can view all roles`: SELECT with admin role check

**Security:**
- Roles stored separately from users/profiles table to prevent privilege escalation
- Uses SECURITY DEFINER function for role checks to avoid RLS recursion

### Database Functions

#### 1. `has_role(_user_id uuid, _role app_role)`
Security definer function to check if a user has a specific role.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Purpose**: Prevents RLS policy recursion by executing with elevated privileges.

#### 2. `update_updated_at_column()`
Trigger function to automatically update `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
```

**Applied To**:
- `news_articles` table
- `daily_topics` table
- `profiles` table

#### 3. `handle_new_user()`
Trigger function to create profile and assign default role on signup.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$function$
```

**Trigger**: Fires on INSERT to `auth.users` table.

### Enums

#### `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

Defines available user roles for the system.

---

## AI Integration

### Overview
The platform uses **Lovable AI Gateway** to access Google's Gemini 2.5 Flash model for automated content generation. The API key is pre-configured in the Lovable Cloud environment.

### Implementation

#### Edge Function: `generate-headline`
**Location**: `supabase/functions/generate-headline/index.ts`

**Purpose**: Generates catchy, concise headlines from article content.

**Request Format**:
```typescript
{
  content: string  // Article content to generate headline from
}
```

**Response Format**:
```typescript
{
  headline: string  // Generated headline (max 70 characters)
}
```

**Error Handling**:
- 429 Rate Limit: Returns error message to retry later
- 402 Payment Required: Indicates need to add credits
- 500 Server Error: Generic failure with error details

**System Prompt**:
> "You are an expert news headline writer. Create short, punchy, and catchy headlines that grab attention. Headlines should be under 70 characters, use active voice, and capture the essence of the story. Focus on what matters most to readers."

**Model Configuration**:
```typescript
{
  model: "google/gemini-2.5-flash",
  temperature: 0.7,
  max_tokens: 100
}
```

### Usage in Application

#### Bulk Article Upload (NewsConverter Component)
1. Parse Word/text documents to extract news items
2. For each news item:
   - Send content to `generate-headline` edge function
   - Receive AI-generated headline as excerpt
   - Display progress indicator (e.g., "Processing 5/20...")
3. Insert all articles with generated excerpts into database
4. Fallback: If AI generation fails, use truncated content (first 70 chars)

**Rate Limiting Considerations**:
- Sequential processing to avoid overwhelming the API
- Progress tracking shows real-time status
- Graceful degradation with fallback excerpts

### Benefits
- **Time Saving**: Automates manual headline writing for bulk uploads
- **Consistency**: Maintains professional tone across all articles
- **Quality**: Leverages advanced AI for engaging headlines
- **User Experience**: Reduces admin workload significantly

---

## Security Implementation

### Authentication Flow

1. **User Signup/Login**:
   - Email and password stored securely in Supabase Auth
   - Passwords hashed with bcrypt
   - Email verification can be enabled (currently auto-confirmed for development)

2. **Session Management**:
   - JWT tokens stored in localStorage
   - Auto-refresh tokens prevent session expiration
   - Persistent sessions across page reloads

3. **Admin Verification**:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   
   const { data, error } = await supabase
     .from("user_roles")
     .select("role")
     .eq("user_id", session.user.id)
     .eq("role", "admin")
     .maybeSingle();
   
   if (!data) {
     navigate("/"); // Redirect non-admins
   }
   ```

### Row-Level Security (RLS)

#### Principle: Defense in Depth
Even if client-side code is bypassed, database policies prevent unauthorized access.

#### Key Policies

**Public Content Access**:
```sql
CREATE POLICY "Anyone can view published articles"
ON news_articles FOR SELECT
USING (published = true);
```

**Admin-Only Operations**:
```sql
CREATE POLICY "Admins can insert articles"
ON news_articles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update articles"
ON news_articles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete articles"
ON news_articles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
```

**User Profile Privacy**:
```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

### Security Best Practices Implemented

1. **No Client-Side Role Storage**:
   - Roles NEVER stored in localStorage or sessionStorage
   - Always verified server-side via database query
   - Prevents privilege escalation attacks

2. **Separate Roles Table**:
   - Roles stored in dedicated `user_roles` table
   - Not embedded in `profiles` or `auth.users`
   - Reduces attack surface

3. **Security Definer Functions**:
   - `has_role()` function prevents RLS recursion
   - Executes with elevated privileges securely
   - Maintains proper access control

4. **Input Validation**:
   - Zod schemas validate all form inputs
   - Character limits prevent database overflow
   - URL validation for image fields
   - Trim whitespace to prevent empty submissions

5. **CORS Configuration**:
   - Edge functions include proper CORS headers
   - Prevents unauthorized cross-origin requests
   - OPTIONS preflight requests handled

6. **SQL Injection Prevention**:
   - Never use raw SQL from edge functions
   - Always use Supabase client methods
   - Parameterized queries built-in

### Potential Security Enhancements

1. **Email Verification**: Enable email confirmation before account activation
2. **Rate Limiting**: Add API rate limits for public endpoints
3. **Content Moderation**: Implement profanity filters or content review
4. **Audit Logging**: Track admin actions for compliance
5. **2FA**: Add two-factor authentication for admin accounts
6. **IP Whitelisting**: Restrict admin access to specific IP ranges
7. **HTTPS Only**: Enforce HTTPS in production (handled by Lovable deployment)

---

## User Roles & Authentication

### Role Types

#### 1. Admin (`'admin'`)
**Permissions**:
- Full CRUD access to `news_articles`
- Full CRUD access to `daily_topics`
- View all articles (published and unpublished)
- Access to admin panel (`/admin`)
- Bulk article upload
- Manage article publication status

**How to Create an Admin**:
Manually insert into `user_roles` table after user signup:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

#### 2. User (`'user'`)
**Permissions**:
- View published articles only
- Subscribe to newsletter
- No admin panel access
- Default role assigned on signup

**Auto-Assignment**:
The `handle_new_user()` trigger automatically assigns 'user' role to new signups.

### Authentication Pages

#### `/auth`
- **Login Form**:
  - Email input
  - Password input
  - "Sign In" button
- **Signup Form**:
  - Email input
  - Password input
  - "Sign Up" button
- **Error Handling**:
  - Invalid credentials
  - Duplicate email
  - Network errors
- **Redirect Logic**:
  - Admins → `/admin`
  - Regular users → `/`

### Session Persistence

**Configuration** (`src/integrations/supabase/client.ts`):
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

**Behavior**:
- Sessions persist across browser restarts
- Tokens automatically refresh before expiration
- User remains logged in until explicit logout

---

## Admin Panel

### URL: `/admin`

### Access Control
- Requires authentication
- Requires 'admin' role in `user_roles` table
- Non-admins redirected to homepage with error toast

### Layout

#### Header
- "Admin Panel" title
- Logout button (redirects to `/auth`)

#### Tabs Navigation
1. **Add Single News Article**
2. **Bulk Upload (Word/Text)**
3. **Add Daily Topic (Agenda)**
4. **Manage Articles**
5. **Manage Daily Topics** (if implemented)

### Tab 1: Add Single News Article

**Form Fields**:
- **Title**: Text input (required, max 200 chars)
- **Section**: Dropdown select
  - World
  - Business
  - Sports
  - Technology
  - Xtra
  - Agenda
- **Excerpt**: Textarea (required, max 500 chars)
- **Content**: Large textarea (required, max 50,000 chars)
- **Image URL**: Text input (optional, must be valid URL)
- **Author**: Text input (required)

**Validation**:
```typescript
const newsArticleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  category: z.string().min(1, "Section is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(500),
  content: z.string().trim().min(1, "Content is required").max(50000),
  image_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
});
```

**Workflow**:
1. Fill out form
2. Click "Publish Article"
3. Validation runs
4. If valid:
   - Auto-generate slug from title (lowercase, hyphens)
   - Insert into `news_articles` table with `published = true`
   - Show success toast
   - Clear form
5. If invalid:
   - Display error messages
   - Highlight problem fields

### Tab 2: Bulk Upload

**Component**: `NewsConverter`

**Supported Files**:
- Microsoft Word (.docx)
- Plain text (.txt)

**Document Format Expected**:
```
-- Category Name {Category}
Article content here with source attribution -- SOURCE {Category}

-- Another Category {Category}
Second article content -- SOURCE {Category}
```

**Workflow**:
1. Select format: JSON or CSV
2. Choose file to upload
3. Click "Convert"
4. **Parsing Phase**:
   - Extract articles from document
   - Identify category from `{Category}` tags
   - Extract source from `-- SOURCE` attribution
   - Clean and format content
5. **AI Processing Phase**:
   - For each article, call `generate-headline` edge function
   - Generate catchy excerpt/headline (stored as article excerpt)
   - Use excerpt as the article title
   - Show progress: "Processing 5/20..."
6. **Output**:
   - Display formatted JSON with structure:
     ```json
     {
       "title": "AI-generated headline",  // Used as the article title
       "excerpt": "AI-generated headline",  // Same as title
       "category": "Business",
       "content": "Full article text...",
       "author": "News Team"
     }
     ```
   - Download button to save locally
7. **Direct Upload**:
   - Click "Upload to Database" button
   - Articles automatically published (`published: true`)
   - Slugs auto-generated from excerpt/title
   - Batch insert all articles
   - Success toast notification

**Recent Fixes**:
- Fixed title/excerpt field mapping (now correctly uses AI-generated excerpt as title)
- Articles now publish automatically by default
- Proper slug generation from excerpt instead of undefined title
- Improved error handling for undefined fields

**Error Handling**:
- Invalid file format
- Parsing errors
- AI generation failures (falls back to truncated content)
- Rate limiting (shows user-friendly message)
- Missing field validation before upload

### Tab 3: Add Daily Topic (Agenda)

**Form Fields**:
- **Title**: Text input (required)
- **Excerpt**: Textarea (required)
- **Content**: Large textarea (required)
- **Image URL**: URL input (optional) - Add image to display on the topic page
- **Author**: Text input (required)

**Workflow**:
1. Fill out form
2. Optionally add image URL
3. Click "Publish Topic"
4. Insert into `news_articles` with:
   - `category = "Agenda"`
   - `published = true`
   - `image_url` (if provided)
   - Auto-generated slug
5. Appears as featured topic on homepage
6. Image displays on detailed topic page if provided
7. Success toast and form clear

### Tab 4: Manage Articles

**Features**:

#### Filter Bar
- **All Articles**: Show everything
- **Published**: Only live articles
- **Unpublished**: Hidden articles

#### Article Cards
Each card displays:
- **Eye Icon**: Published status indicator
  - Eye (open) = Published
  - EyeOff (closed) = Unpublished
- **Title**: Article headline
- **Metadata**: Category, Author, Date
- **Status Badge**: "Published" or "Unpublished"
- **Actions**:
  - **Publish/Unpublish Toggle**: Switch component
    - Instantly updates `published` field
    - Changes reflect on public pages immediately
  - **Edit Button** (Pencil icon):
    - Loads article data into form
    - Switch to edit mode
    - Update existing article
  - **Delete Button** (Trash icon):
    - Opens confirmation dialog
    - Permanently removes article
    - Cannot be undone

#### Edit Mode
When editing:
1. Edit form appears above article list
2. Form pre-filled with current article data
3. **Update Article** button replaces "Publish"
4. **Cancel** button clears edit mode
5. On update:
   - Validates input
   - Updates database
   - Refreshes article list
   - Clears form
   - Shows success toast

#### Delete Confirmation
- **AlertDialog** modal appears
- Displays warning message
- **Cancel** button to abort
- **Delete** button to confirm
- Toast notification on success/failure

#### Loading States
- Skeleton loaders while fetching
- "No articles found" message if empty
- Error handling with toast notifications

---

## Frontend Architecture

### Project Structure

```
src/
├── assets/              # Static images and media
│   ├── logo.png
│   ├── daily-topic-bg.jpg
│   └── ...
├── components/          # Reusable React components
│   ├── ui/              # Shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── DailyTopic.tsx   # Featured topic card
│   ├── Footer.tsx       # Site footer
│   ├── Header.tsx       # Site header with navigation
│   ├── NavLink.tsx      # Navigation link component
│   ├── NewsConverter.tsx # Bulk upload converter
│   └── NewsFeedItem.tsx # News list item card
├── data/                # Static data and utilities
│   └── newsData.ts      # Legacy data (now uses DB)
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx   # Mobile detection hook
│   └── use-toast.ts     # Toast notification hook
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
│       ├── client.ts    # Supabase client instance
│       └── types.ts     # Database type definitions (auto-generated)
├── lib/                 # Utility functions
│   └── utils.ts         # Common utilities (cn, etc.)
├── pages/               # Route components
│   ├── Admin.tsx        # Admin panel page
│   ├── Article.tsx      # Single article view
│   ├── Auth.tsx         # Login/signup page
│   ├── Index.tsx        # Homepage
│   ├── NotFound.tsx     # 404 error page
│   └── Section.tsx      # Category page
├── App.tsx              # Main app component with routing
├── index.css            # Global styles and Tailwind config
└── main.tsx             # App entry point
```

### Routing

**Configuration** (`App.tsx`):
```typescript
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/section/:section" element={<Section />} />
  <Route path="/article/:slug" element={<Article />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Key Components

#### Header Component
- Logo and site title
- Navigation menu:
  - Home
  - World
  - Business
  - Sports
  - Technology
  - Xtra
  - Agenda
- Responsive design with mobile menu
- Active link highlighting

#### Footer Component
- Newsletter subscription form
- Copyright information
- Social media links (if implemented)
- Sitemap links

#### DailyTopic Component
- Featured background image
- Large title display
- Excerpt preview
- Read more link to full article
- Author and date metadata

#### NewsFeedItem Component
- Compact list item format
- Section/category badge
- Article title (clickable)
- Short excerpt
- Author and date
- Hover effects for better UX

#### NewsConverter Component
- File upload interface
- Format selector (JSON/CSV)
- Document parsing logic
- AI integration for headline generation
- Progress tracking
- Download functionality

### Styling System

#### Tailwind Configuration (`tailwind.config.ts`)
- Custom color palette using CSS variables
- Typography scale
- Spacing system
- Responsive breakpoints
- Dark mode support (if enabled)

#### Global Styles (`index.css`)
- CSS custom properties for theming
- Base styles for HTML elements
- Tailwind directives
- Component-specific styles

#### Design Tokens
Colors defined with HSL values for easy manipulation:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}
```

### State Management

**Local State** (per component):
- Form inputs
- Loading states
- Error messages
- UI toggles

**Shared State** (via props):
- User authentication status
- Admin role verification
- Article data

**No Global State Library**: 
- React Context not needed (simple app)
- Prop drilling acceptable given small component tree
- Supabase handles server state

### Data Fetching Patterns

**Pattern 1: Initial Load** (useEffect):
```typescript
useEffect(() => {
  fetchArticles();
}, []);
```

**Pattern 2: User Action** (event handlers):
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  const { data, error } = await supabase.from("news_articles").insert(...);
};
```

**Pattern 3: Real-time Updates** (Supabase Realtime, not implemented):
```typescript
const channel = supabase
  .channel('articles')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'news_articles' }, 
    (payload) => updateArticles(payload)
  )
  .subscribe();
```

---

## API & Edge Functions

### Edge Functions Overview

**Platform**: Deno-based serverless functions
**Location**: `supabase/functions/`
**Deployment**: Automatic via Lovable Cloud
**Configuration**: `supabase/config.toml`

### Function: `generate-headline`

**File**: `supabase/functions/generate-headline/index.ts`

**Purpose**: Generate catchy news headlines using AI.

**Request**:
```typescript
POST /functions/v1/generate-headline
Content-Type: application/json

{
  "content": "Full article text here..."
}
```

**Response** (Success):
```typescript
HTTP 200 OK
{
  "headline": "AI-Generated Catchy Headline Here"
}
```

**Response** (Error):
```typescript
HTTP 400 Bad Request
{
  "error": "Content is required"
}

HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded. Please try again later."
}

HTTP 402 Payment Required
{
  "error": "Payment required. Please add credits to your workspace."
}

HTTP 500 Internal Server Error
{
  "error": "Failed to generate headline"
}
```

**CORS Headers**:
```typescript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**AI Configuration**:
- **Model**: `google/gemini-2.5-flash`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 100
- **System Prompt**: Expert news headline writer instructions

**Error Handling**:
1. Validates input (content required)
2. Checks for API key availability
3. Handles AI gateway errors gracefully
4. Returns specific error codes for client handling

**Logging**:
```typescript
console.log("Generating headline for content:", content.substring(0, 100));
console.log("Generated headline:", headline);
console.error("AI gateway error:", response.status, errorText);
```

**Security**:
- No authentication required (public function)
- `verify_jwt = false` in config.toml
- Rate limiting handled by Lovable AI Gateway
- Input validation prevents malicious content

### Function: `send-newsletter-confirmation`

**File**: `supabase/functions/send-newsletter-confirmation/index.ts`

**Purpose**: Send welcome email to new newsletter subscribers.

**Request**:
```typescript
POST /functions/v1/send-newsletter-confirmation
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (Success):
```typescript
HTTP 200 OK
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

**Response** (Error):
```typescript
HTTP 400 Bad Request
{
  "error": "Email is required"
}

HTTP 500 Internal Server Error
{
  "error": "Failed to send email"
}
```

**Email Configuration**:
- **From**: `Bosphorus News <newsletter@send.newsletter>`
- **Subject**: "Welcome to Bosphorus News - Your Daily News Source"
- **Service**: Resend API

**Features**:
- HTML email template with branding
- Lists newsletter benefits
- Call-to-action button to website
- Footer with unsubscribe option

**Environment Variables**:
- `RESEND_API_KEY`: Resend service API key (stored in secrets)

**Security**:
- No authentication required (public function)
- Email validation on input
- Rate limiting via Resend

### Function: `send-daily-newsletter`

**File**: `supabase/functions/send-daily-newsletter/index.ts`

**Purpose**: Send daily newsletter digest to all subscribers with articles from the last 24 hours.

**Request**:
```typescript
POST /functions/v1/send-daily-newsletter
Content-Type: application/json
Authorization: Bearer <JWT>

{}  // No body required
```

**Response** (Success):
```typescript
HTTP 200 OK
{
  "success": true,
  "message": "Newsletter sent successfully",
  "stats": {
    "totalSubscribers": 150,
    "articlesIncluded": 12,
    "successfulSends": 148,
    "failedSends": 2
  }
}
```

**Functionality**:
1. Fetches all newsletter subscribers from database
2. Retrieves published articles from last 24 hours
3. Groups articles by category
4. Generates HTML newsletter with categorized sections
5. Sends emails in batches of 50 to avoid rate limits
6. Includes 1-second delay between batches

**Email Configuration**:
- **From**: `Bosphorus News <newsletter@send.newsletter>`
- **Subject**: `📰 Bosphorus News Daily Digest - [Date]`
- **Batch Size**: 50 emails per batch
- **Rate Limiting**: 1 second delay between batches

**Security**:
- Requires authentication (JWT token)
- Uses service role key for database access
- Admin-only access recommended

### Function: `send-weekly-newsletter`

**File**: `supabase/functions/send-weekly-newsletter/index.ts`

**Purpose**: Send weekly newsletter digest with articles from the last 7 days.

**Request**:
```typescript
POST /functions/v1/send-weekly-newsletter
Content-Type: application/json
Authorization: Bearer <JWT>

{}  // No body required
```

**Response**: Same format as `send-daily-newsletter`

**Functionality**:
- Fetches articles from last 7 days
- Groups by category
- Sends in batches of 50
- Same structure as daily newsletter with weekly date range

**Email Configuration**:
- **From**: `Bosphorus News <newsletter@send.newsletter>`
- **Subject**: `📰 Bosphorus News Weekly Digest - [End Date]`

**Scheduling**:
To run automatically via cron job:
```sql
-- Example: Send daily newsletter every day at 8 AM
select cron.schedule(
  'daily-newsletter',
  '0 8 * * *',
  $$
  select net.http_post(
    url:='https://mxmarjrkwrqnhhipckzj.supabase.co/functions/v1/send-daily-newsletter',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Resend Domain Setup**:
1. Add and verify your domain in Resend dashboard
2. Configure DNS records (DKIM, SPF, DMARC)
3. Update edge function `from` addresses to use verified domain
4. Current configuration: `newsletter@send.newsletter`

### Calling Edge Functions

**From Frontend**:
```typescript
const { data, error } = await supabase.functions.invoke('generate-headline', {
  body: { content: articleContent }
});

if (error) {
  console.error('Error:', error);
  // Handle error
}

const headline = data.headline;
```

**Environment Variables** (Auto-configured):
- `LOVABLE_API_KEY`: Pre-provisioned by Lovable Cloud
- `SUPABASE_URL`: Project URL
- `SUPABASE_ANON_KEY`: Public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin API key

### Function Configuration

**File**: `supabase/config.toml`

```toml
[functions.generate-headline]
verify_jwt = false  # Public access, no authentication required
```

**Deployment**:
- Automatic deployment on code changes
- No manual deploy steps required
- Instant propagation to production

---

## Deployment & Configuration

### Lovable Cloud Deployment

**Platform**: Lovable (lovable.dev)
**Frontend Hosting**: Automated via Lovable
**Backend**: Supabase (via Lovable Cloud integration)
**Domain**: `[project-name].lovable.app` (custom domains available)

### Environment Variables

**Automatically Configured**:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Public API key
- `VITE_SUPABASE_PROJECT_ID`: Project identifier

**Secrets** (Backend Only):
- `LOVABLE_API_KEY`: Lovable AI Gateway key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin access key
- `SUPABASE_DB_URL`: Direct database connection string
- `RESEND_API_KEY`: Resend email service API key (for newsletter functions)

**File**: `.env` (Auto-generated, do not edit manually)

### Build Configuration

**Vite Config** (`vite.config.ts`):
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**TypeScript Config**:
- Strict mode enabled
- Path aliases configured
- ES2020 target

### Supabase Configuration

**File**: `supabase/config.toml`

```toml
project_id = "mxmarjrkwrqnhhipckzj"

[api]
enabled = true
port = 54321
max_rows = 1000

[db]
port = 54322

[auth]
enabled = true
site_url = "http://localhost:3000"
email_confirm = false  # Auto-confirm for development

[functions.generate-headline]
verify_jwt = false  # Public access for AI headline generation

[functions.send-newsletter-confirmation]
verify_jwt = false  # Public access for welcome emails

[functions.send-daily-newsletter]
# verify_jwt = true (default) - Requires authentication

[functions.send-weekly-newsletter]
# verify_jwt = true (default) - Requires authentication
```

### Deployment Workflow

1. **Code Changes**: Make updates in Lovable editor or via GitHub sync
2. **Automatic Build**: Vite builds production bundle
3. **Edge Functions Deploy**: Deno functions deployed to Supabase
4. **Frontend Deploy**: Static files uploaded to Lovable CDN
5. **Live Update**: Changes appear instantly (no cache invalidation needed)

### Custom Domain Setup

1. Go to Project Settings in Lovable
2. Navigate to "Domains" section
3. Add custom domain (e.g., `news.yourdomain.com`)
4. Configure DNS records (CNAME or A record)
5. SSL certificate auto-provisioned
6. Domain goes live after DNS propagation

### Production Checklist

- [ ] Enable email verification (`email_confirm = true`)
- [ ] Update CORS origins to production domain
- [ ] Add rate limiting to public endpoints
- [ ] Enable database backups
- [ ] Configure monitoring/alerting
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Optimize images and assets
- [ ] Enable caching headers
- [ ] Test all user flows end-to-end
- [ ] Create admin user(s) manually in database

### Monitoring & Logging

**Supabase Dashboard** (via Lovable Cloud UI):
- **Database**: View tables, RLS policies, functions
- **Auth**: Monitor user signups, sessions
- **Edge Functions**: View logs, invocations, errors
- **Storage**: Manage files and buckets (if used)

**Logging Strategy**:
- Edge functions log to Supabase logs
- Frontend errors caught and displayed via toast notifications
- Database errors logged to console
- Authentication errors shown to users

### Performance Optimization

**Implemented**:
- Lazy loading routes (React.lazy, if needed)
- Optimized images (compressed, WebP format)
- Minimal bundle size (tree-shaking via Vite)
- Database indexes on frequently queried columns
- Efficient SQL queries (no N+1 problems)

**Future Enhancements**:
- CDN for static assets
- Server-side rendering (SSR) for SEO
- Image optimization service
- Redis caching layer
- Database connection pooling

---

## Future Enhancements

### Planned Features

1. **Article Comments**:
   - User comments on articles
   - Moderation system
   - Threaded discussions

2. **Search Functionality**:
   - Full-text search across articles
   - Filter by category, date, author
   - Search suggestions

3. **User Profiles**:
   - Public profile pages
   - Author bio pages
   - Article archive per author

4. **Social Sharing**:
   - Share buttons (Twitter, Facebook, LinkedIn)
   - Open Graph meta tags
   - Social media preview cards

5. **Article Scheduling**:
   - Schedule articles for future publication
   - Draft mode
   - Automatic publishing at set time

6. **Rich Text Editor**:
   - WYSIWYG editor for article content
   - Image embedding
   - Formatting toolbar (bold, italic, lists, etc.)

7. **Analytics Dashboard**:
   - Article view counts
   - Popular articles
   - Traffic sources
   - User engagement metrics

8. **Email Notifications**:
   - Newsletter email sending
   - New article alerts
   - Admin notifications

9. **Multi-Language Support**:
   - Internationalization (i18n)
   - Language switcher
   - Translated content

10. **Mobile App**:
    - React Native version
    - Push notifications
    - Offline reading

### Technical Debt

1. Consolidate `daily_topics` and `news_articles` tables (already partially done)
2. Add comprehensive error boundaries
3. Implement automated testing (Jest, Playwright)
4. Add TypeScript strict mode to all files
5. Improve accessibility (ARIA labels, keyboard navigation)
6. Add database migrations versioning
7. Implement proper logging infrastructure
8. Add performance monitoring (Web Vitals)

---

## Support & Maintenance

### Common Issues

**Issue**: Admin can't log in
**Solution**: Verify user has 'admin' role in `user_roles` table

**Issue**: Articles not appearing on category pages
**Solution**: Check `published` field is `true` and `category` matches section

**Issue**: AI headline generation failing
**Solution**: Check Lovable AI Gateway credits and rate limits

**Issue**: Database permission errors
**Solution**: Review RLS policies and ensure user is authenticated

### Database Maintenance

**Backup Strategy**:
- Automatic daily backups via Supabase
- Point-in-time recovery available
- Manual backups before major changes

**Cleanup Tasks**:
- Regularly review and remove unused articles
- Monitor database size and optimize if needed
- Update indexes as query patterns change

### Contact

- **Lovable Documentation**: https://docs.lovable.dev
- **Supabase Documentation**: https://supabase.com/docs
- **Project Repository**: (Add GitHub URL if synced)
- **Support Email**: (Add support contact)

---

## Changelog

### Version 1.1 - November 2025

#### Daily Topic Image Support
- **Image URL Field**: Added optional image URL field to Daily Topic (Agenda) form
  - Admin can now add images to Daily Topic/Agenda articles
  - Images display on article detail page when provided
  - Stored in `image_url` field of `news_articles` table
- **Article Display**: Updated Article page to render featured images
  - Images display above article content with proper styling
  - Responsive image sizing and overflow handling

#### Newsletter System Enhancements
- **Email Domain Configuration**: Updated all newsletter edge functions to use verified domain `newsletter@send.newsletter`
  - `send-newsletter-confirmation`: Welcome email sender updated
  - `send-daily-newsletter`: Daily digest sender updated
  - `send-weekly-newsletter`: Weekly digest sender updated
- **DNS Records**: Configured DKIM, SPF, and DMARC records for email authentication
- **Documentation**: Added comprehensive edge function documentation for newsletter system

#### NewsConverter Component Fixes
- **Fixed Title Mapping**: Resolved issue where `article.title` was undefined during upload
  - Now correctly maps AI-generated excerpt to the title field
  - Slug generation now uses excerpt instead of undefined title
- **Auto-Publish**: Articles now automatically publish by default (`published: true`)
- **Error Handling**: Added validation for undefined fields before upload
- **Upload Flow**: Direct database upload button now works correctly without errors

#### Configuration Updates
- **Edge Functions**: Added configuration for newsletter functions in `config.toml`
  - `send-newsletter-confirmation`: Public access (verify_jwt = false)
  - `send-daily-newsletter`: Authenticated access (default)
  - `send-weekly-newsletter`: Authenticated access (default)
- **Secrets**: Documented `RESEND_API_KEY` in environment variables section

#### Documentation Improvements
- Comprehensive edge function documentation
- Newsletter scheduling examples with cron jobs
- Resend domain setup instructions
- Updated workflow diagrams for NewsConverter
- Added error handling documentation
- Daily Topic image functionality documentation

---

## Conclusion

This news platform demonstrates a modern, secure, and scalable approach to content management with AI-powered features. The combination of React, TypeScript, Supabase, and Lovable AI creates a powerful yet maintainable system suitable for production use.

The architecture prioritizes security through RLS policies, proper role-based access control, and server-side validation. The admin panel provides a comprehensive interface for content management, while the public-facing site offers a clean, responsive reading experience.

Future enhancements will focus on user engagement features, advanced analytics, and expanding AI capabilities to further automate content workflows.

---

**Document Version**: 1.1  
**Last Updated**: 2025-11-17  
**Maintained By**: Project Team
