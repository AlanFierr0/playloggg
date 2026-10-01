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
          id: number
          name: string
          profile_id: number
          revision: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          profile_id: number
          revision?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
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
          created_at: string
          genres: string[]
          id: number
          igdb_id: number | null
          igdb_metadata: Json
          igdb_synced_at: string | null
          igdb_url: string | null
          is_sample: boolean
          release_year: number | null
          released_on: string | null
          screenshot_image_ids: string[]
          search_keywords: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          artwork_image_ids?: string[]
          cover_image_id?: string | null
          cover_url: string
          created_at?: string
          genres?: string[]
          id?: never
          igdb_id?: number | null
          igdb_metadata?: Json
          igdb_synced_at?: string | null
          igdb_url?: string | null
          is_sample?: boolean
          release_year?: number | null
          released_on?: string | null
          screenshot_image_ids?: string[]
          search_keywords?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          artwork_image_ids?: string[]
          cover_image_id?: string | null
          cover_url?: string
          created_at?: string
          genres?: string[]
          id?: never
          igdb_id?: number | null
          igdb_metadata?: Json
          igdb_synced_at?: string | null
          igdb_url?: string | null
          is_sample?: boolean
          release_year?: number | null
          released_on?: string | null
          screenshot_image_ids?: string[]
          search_keywords?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          handle: string
          id: number
          is_public: boolean
          is_sample: boolean
          location: string | null
          owner_user_id: string | null
          platform_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          handle: string
          id?: never
          is_public?: boolean
          is_sample?: boolean
          location?: string | null
          owner_user_id?: string | null
          platform_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          handle?: string
          id?: never
          is_public?: boolean
          is_sample?: boolean
          location?: string | null
          owner_user_id?: string | null
          platform_preference?: string | null
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
          score: number | null
          status: string | null
          tags: string[]
          tier: string | null
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
          score?: number | null
          status?: string | null
          tags?: string[]
          tier?: string | null
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
          score?: number | null
          status?: string | null
          tags?: string[]
          tier?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      set_profile_favorite: {
        Args: {
          p_favorite: boolean
          p_featured_slot?: number
          p_game_id: number
        }
        Returns: undefined
      }
      valid_rating_tags: { Args: { value: string[] }; Returns: boolean }
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
