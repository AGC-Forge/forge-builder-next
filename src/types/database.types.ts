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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json
          resource: string | null
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          resource?: string | null
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          resource?: string | null
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          app_type: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_type: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_type?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_products: {
        Row: {
          created_at: string
          id: string
          landing_page_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          landing_page_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          landing_page_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_products_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          blocks: Json
          click_count: number
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          lp_type: string | null
          seo: Json
          slug: string
          theme_config: Json
          theme_type: string
          title: string
          tracking: Json
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          blocks?: Json
          click_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lp_type?: string | null
          seo?: Json
          slug: string
          theme_config?: Json
          theme_type?: string
          title: string
          tracking?: Json
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          blocks?: Json
          click_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lp_type?: string | null
          seo?: Json
          slug?: string
          theme_config?: Json
          theme_type?: string
          title?: string
          tracking?: Json
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          metadata: Json
          payment_ref: string | null
          plan_type: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          payment_ref?: string | null
          plan_type?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          payment_ref?: string | null
          plan_type?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          landing_page_id: string | null
          metadata: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_proof_url: string | null
          payment_status: string
          shipping_address: Json
          shipping_cost: number
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          items?: Json
          landing_page_id?: string | null
          metadata?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          landing_page_id?: string | null
          metadata?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_analytics: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_type: string
          id: string
          landing_page_id: string
          referrer: string | null
          user_agent: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string
          id?: string
          landing_page_id: string
          referrer?: string | null
          user_agent?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string
          id?: string
          landing_page_id?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_analytics_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_clicks: {
        Row: {
          click_type: string
          created_at: string
          id: string
          landing_page_id: string | null
          product_id: string
          visitor_fingerprint: string | null
        }
        Insert: {
          click_type?: string
          created_at?: string
          id?: string
          landing_page_id?: string | null
          product_id: string
          visitor_fingerprint?: string | null
        }
        Update: {
          click_type?: string
          created_at?: string
          id?: string
          landing_page_id?: string | null
          product_id?: string
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_clicks_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_url: string | null
          badges: Json
          category: string | null
          created_at: string
          currency: string
          description: string | null
          discount_label: string | null
          features: Json
          id: string
          images: Json
          input_mode: string
          is_active: boolean
          marketplace_url: string | null
          original_price: number | null
          price: number | null
          product_rating: number | null
          review_count: number
          shop_name: string | null
          sold_count: number
          specifications: Json
          stock_count: number | null
          subcategory: string | null
          subtitle: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_url?: string | null
          badges?: Json
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          discount_label?: string | null
          features?: Json
          id?: string
          images?: Json
          input_mode?: string
          is_active?: boolean
          marketplace_url?: string | null
          original_price?: number | null
          price?: number | null
          product_rating?: number | null
          review_count?: number
          shop_name?: string | null
          sold_count?: number
          specifications?: Json
          stock_count?: number | null
          subcategory?: string | null
          subtitle?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_url?: string | null
          badges?: Json
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          discount_label?: string | null
          features?: Json
          id?: string
          images?: Json
          input_mode?: string
          is_active?: boolean
          marketplace_url?: string | null
          original_price?: number | null
          price?: number | null
          product_rating?: number | null
          review_count?: number
          shop_name?: string | null
          sold_count?: number
          specifications?: Json
          stock_count?: number | null
          subcategory?: string | null
          subtitle?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_domain: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          max_landing_pages: number
          max_products: number
          plan_expires_at: string | null
          plan_type: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_domain?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          max_landing_pages?: number
          max_products?: number
          plan_expires_at?: string | null
          plan_type?: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_domain?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          max_landing_pages?: number
          max_products?: number
          plan_expires_at?: string | null
          plan_type?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          blocks: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          lp_type: string
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          lp_type?: string
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          lp_type?: string
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          label: string | null
          last_used_at: string | null
          model_id: string | null
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          last_used_at?: string | null
          model_id?: string | null
          provider?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          last_used_at?: string | null
          model_id?: string | null
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      web_settings: {
        Row: {
          created_at: string
          description: string | null
          group_name: string
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          group_name?: string
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
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
    Enums: {},
  },
} as const
