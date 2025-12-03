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
      projects: {
        Row: {
          business_name: string
          client_name: string
          created_at: string
          hosting_provider: string | null
          id: string
          monthly_revenue: number | null
          notes: string | null
          progress: number
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          target_launch_date: string | null
          tasks_completed: number
          total_tasks: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          business_name: string
          client_name: string
          created_at?: string
          hosting_provider?: string | null
          id?: string
          monthly_revenue?: number | null
          notes?: string | null
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_launch_date?: string | null
          tasks_completed?: number
          total_tasks?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          business_name?: string
          client_name?: string
          created_at?: string
          hosting_provider?: string | null
          id?: string
          monthly_revenue?: number | null
          notes?: string | null
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_launch_date?: string | null
          tasks_completed?: number
          total_tasks?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      questionnaires: {
        Row: {
          accessibility_requirements: string | null
          acknowledgements_accepted: boolean | null
          additional_notes: string | null
          assumptions: string | null
          best_sellers: string | null
          brand_colors: string | null
          brand_fonts: string | null
          brand_guidelines: string | null
          brand_personality: string | null
          budget_range: string | null
          business_overview: string | null
          calls_to_action: string | null
          color_preferences: string | null
          company_name: string | null
          competitors: string | null
          compliance_needs: string | null
          content_ready: boolean | null
          content_sections: string | null
          core_values: string | null
          created_at: string
          critical_deadlines: string | null
          customer_pain_points: string | null
          customer_sources: string | null
          decision_makers: string | null
          design_elements: string | null
          design_style: string | null
          disliked_websites: string | null
          domain_status: string | null
          example_websites: string | null
          existing_logo: boolean | null
          existing_marketing: string | null
          expected_traffic: string | null
          future_addons: string | null
          geographic_reach: string | null
          google_analytics: boolean | null
          has_google_business: boolean | null
          hosting_preference: string | null
          id: string
          image_sources: string | null
          industry: string | null
          integrations_needed: string | null
          launch_date: string | null
          liked_websites: string | null
          limitations: string | null
          main_products_services: string | null
          maintenance_plan: string | null
          mission_statement: string | null
          needs_email: boolean | null
          open_to_stock: boolean | null
          pricing_display: string | null
          primary_goals: string[] | null
          priority: string | null
          privacy_policy_needed: boolean | null
          project_id: string
          required_features: string[] | null
          seasonal_offerings: string | null
          secondary_audience: string | null
          social_media_links: string | null
          tagline: string | null
          target_demographics: string | null
          target_keywords: string | null
          target_locations: string | null
          terms_needed: boolean | null
          timeline: string | null
          unique_selling_points: string | null
          updated_at: string
          vision_statement: string | null
          wants_ongoing_seo: boolean | null
          years_in_business: string | null
        }
        Insert: {
          accessibility_requirements?: string | null
          acknowledgements_accepted?: boolean | null
          additional_notes?: string | null
          assumptions?: string | null
          best_sellers?: string | null
          brand_colors?: string | null
          brand_fonts?: string | null
          brand_guidelines?: string | null
          brand_personality?: string | null
          budget_range?: string | null
          business_overview?: string | null
          calls_to_action?: string | null
          color_preferences?: string | null
          company_name?: string | null
          competitors?: string | null
          compliance_needs?: string | null
          content_ready?: boolean | null
          content_sections?: string | null
          core_values?: string | null
          created_at?: string
          critical_deadlines?: string | null
          customer_pain_points?: string | null
          customer_sources?: string | null
          decision_makers?: string | null
          design_elements?: string | null
          design_style?: string | null
          disliked_websites?: string | null
          domain_status?: string | null
          example_websites?: string | null
          existing_logo?: boolean | null
          existing_marketing?: string | null
          expected_traffic?: string | null
          future_addons?: string | null
          geographic_reach?: string | null
          google_analytics?: boolean | null
          has_google_business?: boolean | null
          hosting_preference?: string | null
          id?: string
          image_sources?: string | null
          industry?: string | null
          integrations_needed?: string | null
          launch_date?: string | null
          liked_websites?: string | null
          limitations?: string | null
          main_products_services?: string | null
          maintenance_plan?: string | null
          mission_statement?: string | null
          needs_email?: boolean | null
          open_to_stock?: boolean | null
          pricing_display?: string | null
          primary_goals?: string[] | null
          priority?: string | null
          privacy_policy_needed?: boolean | null
          project_id: string
          required_features?: string[] | null
          seasonal_offerings?: string | null
          secondary_audience?: string | null
          social_media_links?: string | null
          tagline?: string | null
          target_demographics?: string | null
          target_keywords?: string | null
          target_locations?: string | null
          terms_needed?: boolean | null
          timeline?: string | null
          unique_selling_points?: string | null
          updated_at?: string
          vision_statement?: string | null
          wants_ongoing_seo?: boolean | null
          years_in_business?: string | null
        }
        Update: {
          accessibility_requirements?: string | null
          acknowledgements_accepted?: boolean | null
          additional_notes?: string | null
          assumptions?: string | null
          best_sellers?: string | null
          brand_colors?: string | null
          brand_fonts?: string | null
          brand_guidelines?: string | null
          brand_personality?: string | null
          budget_range?: string | null
          business_overview?: string | null
          calls_to_action?: string | null
          color_preferences?: string | null
          company_name?: string | null
          competitors?: string | null
          compliance_needs?: string | null
          content_ready?: boolean | null
          content_sections?: string | null
          core_values?: string | null
          created_at?: string
          critical_deadlines?: string | null
          customer_pain_points?: string | null
          customer_sources?: string | null
          decision_makers?: string | null
          design_elements?: string | null
          design_style?: string | null
          disliked_websites?: string | null
          domain_status?: string | null
          example_websites?: string | null
          existing_logo?: boolean | null
          existing_marketing?: string | null
          expected_traffic?: string | null
          future_addons?: string | null
          geographic_reach?: string | null
          google_analytics?: boolean | null
          has_google_business?: boolean | null
          hosting_preference?: string | null
          id?: string
          image_sources?: string | null
          industry?: string | null
          integrations_needed?: string | null
          launch_date?: string | null
          liked_websites?: string | null
          limitations?: string | null
          main_products_services?: string | null
          maintenance_plan?: string | null
          mission_statement?: string | null
          needs_email?: boolean | null
          open_to_stock?: boolean | null
          pricing_display?: string | null
          primary_goals?: string[] | null
          priority?: string | null
          privacy_policy_needed?: boolean | null
          project_id?: string
          required_features?: string[] | null
          seasonal_offerings?: string | null
          secondary_audience?: string | null
          social_media_links?: string | null
          tagline?: string | null
          target_demographics?: string | null
          target_keywords?: string | null
          target_locations?: string | null
          terms_needed?: boolean | null
          timeline?: string | null
          unique_selling_points?: string | null
          updated_at?: string
          vision_statement?: string | null
          wants_ongoing_seo?: boolean | null
          years_in_business?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status:
        | "discovery"
        | "design"
        | "development"
        | "review"
        | "published"
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
      project_status: [
        "discovery",
        "design",
        "development",
        "review",
        "published",
      ],
    },
  },
} as const
