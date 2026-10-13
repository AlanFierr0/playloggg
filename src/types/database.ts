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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      curated_list_items: {
        Row: {
          game_id: number
          list_id: number
          position: number
        }
        Insert: {
          game_id: number
          list_id: number
          position: number
        }
        Update: {
          game_id?: number
          list_id?: number
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "curated_list_items_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "curated_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_lists: {
        Row: {
          created_at: string
          description: string
          id: number
          is_public: boolean
          is_ranked: boolean
          name: string
          profile_id: number
          revision: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: never
          is_public?: boolean
          is_ranked?: boolean
          name: string
          profile_id: number
          revision?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: never
          is_public?: boolean
          is_ranked?: boolean
          name?: string
          profile_id?: number
          revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_lists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          artwork_image_ids: string[]
          cover_image_id: string | null
          cover_url: string
          genres: string[]
          id: number
          igdb_id: number | null
          igdb_metadata: Json
          igdb_synced_at: string | null
          igdb_url: string | null
          release_year: number | null
          released_on: string | null
          screenshot_image_ids: string[]
          search_keywords: string
          slug: string
          title: string
        }
        Insert: {
          artwork_image_ids?: string[]
          cover_image_id?: string | null
          cover_url: string
          genres?: string[]
          id?: never
          igdb_id?: number | null
          igdb_metadata?: Json
          igdb_synced_at?: string | null
          igdb_url?: string | null
          release_year?: number | null
          released_on?: string | null
          screenshot_image_ids?: string[]
          search_keywords?: string
          slug: string
          title: string
        }
        Update: {
          artwork_image_ids?: string[]
          cover_image_id?: string | null
          cover_url?: string
          genres?: string[]
          id?: never
          igdb_id?: number | null
          igdb_metadata?: Json
          igdb_synced_at?: string | null
          igdb_url?: string | null
          release_year?: number | null
          released_on?: string | null
          screenshot_image_ids?: string[]
          search_keywords?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      list_likes: {
        Row: {
          list_id: number
          profile_id: number
        }
        Insert: {
          list_id: number
          profile_id: number
        }
        Update: {
          list_id?: number
          profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_likes_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "curated_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_activity: {
        Row: {
          completion_changed: boolean
          game_id: number | null
          id: number
          kind: string
          occurred_at: string
          profile_id: number
          score: number | null
          score_changed: boolean
          status: string | null
          tier: string | null
        }
        Insert: {
          completion_changed?: boolean
          game_id?: number | null
          id?: never
          kind: string
          occurred_at?: string
          profile_id: number
          score?: number | null
          score_changed?: boolean
          status?: string | null
          tier?: string | null
        }
        Update: {
          completion_changed?: boolean
          game_id?: number | null
          id?: never
          kind?: string
          occurred_at?: string
          profile_id?: number
          score?: number | null
          score_changed?: boolean
          status?: string | null
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_activity_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_activity_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_blocks: {
        Row: {
          blocked_id: number
          blocker_id: number
        }
        Insert: {
          blocked_id: number
          blocker_id: number
        }
        Update: {
          blocked_id?: number
          blocker_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_favorites: {
        Row: {
          created_at: string
          featured_slot: number | null
          game_id: number
          profile_id: number
        }
        Insert: {
          created_at?: string
          featured_slot?: number | null
          game_id: number
          profile_id: number
        }
        Update: {
          created_at?: string
          featured_slot?: number | null
          game_id?: number
          profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_favorites_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_follows: {
        Row: {
          followed_id: number
          follower_id: number
        }
        Insert: {
          followed_id: number
          follower_id: number
        }
        Update: {
          followed_id?: number
          follower_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_rankings: {
        Row: {
          game_ids: number[]
          manual_positions: Json
          profile_id: number
          revision: number
        }
        Insert: {
          game_ids?: number[]
          manual_positions?: Json
          profile_id: number
          revision?: number
        }
        Update: {
          game_ids?: number[]
          manual_positions?: Json
          profile_id?: number
          revision?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_rankings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          handle: string
          id: number
          is_discoverable: boolean
          is_public: boolean
          location: string | null
          owner_user_id: string | null
          platform_preference: string | null
          tier_ranges: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          handle: string
          id?: never
          is_discoverable?: boolean
          is_public?: boolean
          location?: string | null
          owner_user_id?: string | null
          platform_preference?: string | null
          tier_ranges?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          handle?: string
          id?: never
          is_discoverable?: boolean
          is_public?: boolean
          location?: string | null
          owner_user_id?: string | null
          platform_preference?: string | null
          tier_ranges?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          completed_on: string | null
          created_at: string
          game_id: number
          hours_played: number | null
          platform: string | null
          profile_id: number
          review: string | null
          review_updated_at: string | null
          score: number | null
          status: string | null
          tags: string[]
          tier: string | null
          tier_manual: boolean
          updated_at: string
        }
        Insert: {
          completed_on?: string | null
          created_at?: string
          game_id: number
          hours_played?: number | null
          platform?: string | null
          profile_id: number
          review?: string | null
          review_updated_at?: string | null
          score?: number | null
          status?: string | null
          tags?: string[]
          tier?: string | null
          tier_manual?: boolean
          updated_at?: string
        }
        Update: {
          completed_on?: string | null
          created_at?: string
          game_id?: number
          hours_played?: number | null
          platform?: string | null
          profile_id?: number
          review?: string | null
          review_updated_at?: string | null
          score?: number | null
          status?: string | null
          tags?: string[]
          tier?: string | null
          tier_manual?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          game_id: number
          reviewer_profile_id: number
          value: number
          voter_profile_id: number
        }
        Insert: {
          game_id: number
          reviewer_profile_id: number
          value: number
          voter_profile_id: number
        }
        Update: {
          game_id?: number
          reviewer_profile_id?: number
          value?: number
          voter_profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_reviewer_profile_id_game_id_fkey"
            columns: ["reviewer_profile_id", "game_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["profile_id", "game_id"]
          },
          {
            foreignKeyName: "review_votes_voter_profile_id_fkey"
            columns: ["voter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      steam_accounts: {
        Row: {
          steam_id: string
          user_id: string
        }
        Insert: {
          steam_id: string
          user_id: string
        }
        Update: {
          steam_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_deletion_objects: {
        Args: { p_owner: string }
        Returns: {
          bucket_id: string
          object_name: string
        }[]
      }
      anonymous_game_scores: {
        Args: { p_ids?: number[] }
        Returns: {
          average: number
          deviation: number
          game_id: number
          sample_count: number
        }[]
      }
      catalog_page: {
        Args: { p_filters: Json; p_page: number; p_profile_id: number | null }
        Returns: Json
      }
      catalog_platform_family: { Args: { name: string }; Returns: string }
      clear_account_operation_limits: {
        Args: { p_owner: string }
        Returns: undefined
      }
      community_game_scores: {
        Args: { p_ids?: number[] }
        Returns: {
          average: number
          deviation: number
          game_id: number
          sample_count: number
        }[]
      }
      community_trending_games: {
        Args: never
        Returns: {
          game_id: number
          sample_count: number
        }[]
      }
      consume_operation_limit: {
        Args: {
          p_actor: string
          p_limit: number
          p_operation: string
          p_seconds: number
        }
        Returns: number
      }
      consume_operation_limit_batch: {
        Args: {
          p_actor: string
          p_count: number
          p_daily_limit: number
          p_minute_limit: number
          p_operation: string
        }
        Returns: {
          allowed_count: number
          retry_after: number
        }[]
      }
      delete_owned_profile: {
        Args: { p_handle: string; p_owner: string }
        Returns: Json
      }
      discover_games: {
        Args: { p_amount: number; p_seed: string }
        Returns: {
          artwork_image_ids: string[]
          cover_image_id: string | null
          cover_url: string
          genres: string[]
          id: number
          igdb_id: number | null
          igdb_metadata: Json
          igdb_synced_at: string | null
          igdb_url: string | null
          release_year: number | null
          released_on: string | null
          screenshot_image_ids: string[]
          search_keywords: string
          slug: string
          title: string
        }[]
        SetofOptions: {
          from: "*"
          to: "games"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      explore_games: {
        Args: {
          p_amount: number
          p_genres: string[]
          p_profile_id: number
          p_seed: string
        }
        Returns: {
          artwork_image_ids: string[]
          cover_image_id: string | null
          cover_url: string
          genres: string[]
          id: number
          igdb_id: number | null
          igdb_metadata: Json
          igdb_synced_at: string | null
          igdb_url: string | null
          release_year: number | null
          released_on: string | null
          screenshot_image_ids: string[]
          search_keywords: string
          slug: string
          title: string
        }[]
        SetofOptions: {
          from: "*"
          to: "games"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      home_reviews: {
        Args: { p_limit?: number }
        Returns: {
          display_name: string
          downvotes: number
          game_id: number
          handle: string
          profile_id: number
          review: string
          updated_at: string
          upvotes: number
          viewer_vote: number
        }[]
      }
      home_taste: { Args: never; Returns: Json }
      platform_game_scores: {
        Args: never
        Returns: {
          average: number
          sample_count: number
          slug: string
        }[]
      }
      public_list_like_counts: {
        Args: never
        Returns: {
          likes: number
          list_id: number
        }[]
      }
      review_helpfulness: {
        Args: { p_profile_id: number }
        Returns: {
          downvotes: number
          game_slug: string
          upvotes: number
          viewer_vote: number
        }[]
      }
      save_curated_list: {
        Args: {
          p_expected_revision: number
          p_game_ids: number[]
          p_list_id: number
          p_name: string
          p_profile_id: number
        }
        Returns: Json
      }
      save_curated_list_v2: {
        Args: {
          p_description: string
          p_expected_revision: number
          p_game_ids: number[]
          p_list_id: number
          p_name: string
          p_profile_id: number
          p_public: boolean
          p_ranked: boolean
        }
        Returns: Json
      }
      save_preference_ranking: {
        Args: { p_ids: number[]; p_revision: number }
        Returns: number
      }
      save_preference_ranking_v2: {
        Args: { p_ids: number[]; p_manual: Json; p_revision: number }
        Returns: number
      }
      reserve_review_translation: {Args:{p_characters:number};Returns:boolean}
      read_review_translation: {Args:{p_profile_id:number;p_game_id:number;p_hash:string;p_target:string};Returns:Json}
      store_review_translation: {Args:{p_profile_id:number;p_game_id:number;p_hash:string;p_target:string;p_original:string;p_translation:string;p_source_language:string};Returns:boolean}
      game_reviews: {
        Args: {p_game_id:number;p_offset?:number}
        Returns: {profile_id:number;handle:string;display_name:string;avatar_url:string|null;review:string;score:number|null;tier:string|null;updated_at:string;upvotes:number;downvotes:number;viewer_vote:number}[]
      }
      remove_rating: {
        Args: { p_game_id: number; p_expected_updated_at: string }
        Returns: boolean
      }
      save_rating: {
        Args: {
          p_expected_updated_at: string | null
          p_game_id: number
          p_values: Json
        }
        Returns: string
      }
      search_catalog: {
        Args: {
          p_hide_rated: boolean
          p_offset: number
          p_profile_id: number | null
          p_query: string
        }
        Returns: {
          artwork_image_ids: string[]
          cover_image_id: string | null
          cover_url: string
          genres: string[]
          id: number
          igdb_id: number | null
          igdb_metadata: Json
          igdb_synced_at: string | null
          igdb_url: string | null
          release_year: number | null
          released_on: string | null
          screenshot_image_ids: string[]
          search_keywords: string
          slug: string
          title: string
        }[]
        SetofOptions: {
          from: "*"
          to: "games"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_profile_favorite: {
        Args: {
          p_favorite: boolean
          p_featured_slot?: number
          p_game_id: number
        }
        Returns: undefined
      }
      valid_rating_tags: { Args: { value: string[] }; Returns: boolean }
      valid_tier_ranges: { Args: { ranges: Json }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
