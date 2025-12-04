export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      article_reactions: {
        Row: {
          article_slug: string
          created_at: string
          id: string
          reaction: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_slug: string
          created_at?: string
          id?: string
          reaction: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_slug?: string
          created_at?: string
          id?: string
          reaction?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_daily_updates: {
        Row: {
          athlete_id: string
          competition: string | null
          created_at: string
          date: string
          home_away: string | null
          id: string
          injury_details: string | null
          injury_status: string | null
          match_result: string | null
          minutes_played: number | null
          opponent: string | null
          played: boolean
          rating: number | null
          stats: Json | null
        }
        Insert: {
          athlete_id: string
          competition?: string | null
          created_at?: string
          date: string
          home_away?: string | null
          id?: string
          injury_details?: string | null
          injury_status?: string | null
          match_result?: string | null
          minutes_played?: number | null
          opponent?: string | null
          played?: boolean
          rating?: number | null
          stats?: Json | null
        }
        Update: {
          athlete_id?: string
          competition?: string | null
          created_at?: string
          date?: string
          home_away?: string | null
          id?: string
          injury_details?: string | null
          injury_status?: string | null
          match_result?: string | null
          minutes_played?: number | null
          opponent?: string | null
          played?: boolean
          rating?: number | null
          stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_daily_updates_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_live_matches: {
        Row: {
          athlete_id: string
          athlete_stats: Json | null
          away_score: number | null
          competition: string
          created_at: string
          current_minute: number | null
          home_away: string | null
          home_score: number | null
          id: string
          kickoff_time: string
          last_event: string | null
          match_status: string
          opponent: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          athlete_stats?: Json | null
          away_score?: number | null
          competition: string
          created_at?: string
          current_minute?: number | null
          home_away?: string | null
          home_score?: number | null
          id?: string
          kickoff_time: string
          last_event?: string | null
          match_status?: string
          opponent: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          athlete_stats?: Json | null
          away_score?: number | null
          competition?: string
          created_at?: string
          current_minute?: number | null
          home_away?: string | null
          home_score?: number | null
          id?: string
          kickoff_time?: string
          last_event?: string | null
          match_status?: string
          opponent?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_live_matches_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_profiles: {
        Row: {
          action_photo_url: string | null
          api_football_id: number | null
          balldontlie_id: number | null
          bio: string | null
          created_at: string
          fotmob_id: number | null
          id: string
          instagram: string | null
          jersey_number: number | null
          league: string
          name: string
          national_photo_url: string | null
          official_link: string | null
          photo_url: string | null
          position: string
          slug: string
          sport: string
          team: string
          team_logo_url: string | null
          updated_at: string
        }
        Insert: {
          action_photo_url?: string | null
          api_football_id?: number | null
          balldontlie_id?: number | null
          bio?: string | null
          created_at?: string
          fotmob_id?: number | null
          id?: string
          instagram?: string | null
          jersey_number?: number | null
          league: string
          name: string
          national_photo_url?: string | null
          official_link?: string | null
          photo_url?: string | null
          position: string
          slug: string
          sport: string
          team: string
          team_logo_url?: string | null
          updated_at?: string
        }
        Update: {
          action_photo_url?: string | null
          api_football_id?: number | null
          balldontlie_id?: number | null
          bio?: string | null
          created_at?: string
          fotmob_id?: number | null
          id?: string
          instagram?: string | null
          jersey_number?: number | null
          league?: string
          name?: string
          national_photo_url?: string | null
          official_link?: string | null
          photo_url?: string | null
          position?: string
          slug?: string
          sport?: string
          team?: string
          team_logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      athlete_season_stats: {
        Row: {
          athlete_id: string
          competition: string
          created_at: string
          games_played: number | null
          games_started: number | null
          id: string
          season: string
          stats: Json | null
          updated_at: string
        }
        Insert: {
          athlete_id: string
          competition: string
          created_at?: string
          games_played?: number | null
          games_started?: number | null
          id?: string
          season: string
          stats?: Json | null
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          competition?: string
          created_at?: string
          games_played?: number | null
          games_started?: number | null
          id?: string
          season?: string
          stats?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_season_stats_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_transfer_rumors: {
        Row: {
          athlete_id: string
          created_at: string
          headline: string
          id: string
          reliability: string | null
          rumor_date: string
          source: string | null
          source_url: string | null
          status: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          headline: string
          id?: string
          reliability?: string | null
          rumor_date?: string
          source?: string | null
          source_url?: string | null
          status?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          headline?: string
          id?: string
          reliability?: string | null
          rumor_date?: string
          source?: string | null
          source_url?: string | null
          status?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_transfer_rumors_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_upcoming_matches: {
        Row: {
          athlete_id: string
          competition: string
          created_at: string
          home_away: string | null
          id: string
          match_date: string
          opponent: string
        }
        Insert: {
          athlete_id: string
          competition: string
          created_at?: string
          home_away?: string | null
          id?: string
          match_date: string
          opponent: string
        }
        Update: {
          athlete_id?: string
          competition?: string
          created_at?: string
          home_away?: string | null
          id?: string
          match_date?: string
          opponent?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_upcoming_matches_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_topics: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string
          breaking_news: boolean | null
          category: string
          category_pin_order: number | null
          content: string
          created_at: string
          display_order: number | null
          excerpt: string
          extra_image_credit: string | null
          extra_image_url: string | null
          id: string
          image_url: string | null
          is_carousel_featured: boolean | null
          is_carousel_pinned: boolean | null
          is_mid_featured: boolean | null
          photo_credit: string | null
          published: boolean
          short_url: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          breaking_news?: boolean | null
          category: string
          category_pin_order?: number | null
          content: string
          created_at?: string
          display_order?: number | null
          excerpt: string
          extra_image_credit?: string | null
          extra_image_url?: string | null
          id?: string
          image_url?: string | null
          is_carousel_featured?: boolean | null
          is_carousel_pinned?: boolean | null
          is_mid_featured?: boolean | null
          photo_credit?: string | null
          published?: boolean
          short_url?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          breaking_news?: boolean | null
          category?: string
          category_pin_order?: number | null
          content?: string
          created_at?: string
          display_order?: number | null
          excerpt?: string
          extra_image_credit?: string | null
          extra_image_url?: string | null
          id?: string
          image_url?: string | null
          is_carousel_featured?: boolean | null
          is_carousel_pinned?: boolean | null
          is_mid_featured?: boolean | null
          photo_credit?: string | null
          published?: boolean
          short_url?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      share_analytics: {
        Row: {
          article_slug: string
          created_at: string
          id: string
          platform: string
          user_id: string | null
        }
        Insert: {
          article_slug: string
          created_at?: string
          id?: string
          platform: string
          user_id?: string | null
        }
        Update: {
          article_slug?: string
          created_at?: string
          id?: string
          platform?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
