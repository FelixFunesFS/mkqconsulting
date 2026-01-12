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
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          project_id: string
          title: string
          user_id: string | null
          visible_to_client: boolean
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          title: string
          user_id?: string | null
          visible_to_client?: boolean
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          title?: string
          user_id?: string | null
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          auto_send_invitations: boolean
          client_activity_alerts: boolean
          created_at: string
          email_notifications: boolean
          id: string
          show_task_details: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_send_invitations?: boolean
          client_activity_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          show_task_details?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_send_invitations?: boolean
          client_activity_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          show_task_details?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_task_templates: {
        Row: {
          category: Database["public"]["Enums"]["client_task_category"]
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          priority: Database["public"]["Enums"]["task_priority"]
          template_set: string
          why_needed: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["client_task_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: Database["public"]["Enums"]["task_priority"]
          template_set: string
          why_needed?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["client_task_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          template_set?: string
          why_needed?: string | null
        }
        Relationships: []
      }
      client_tasks: {
        Row: {
          admin_notes: string | null
          category: Database["public"]["Enums"]["client_task_category"]
          client_notes: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          display_order: number | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          source: string
          status: Database["public"]["Enums"]["client_task_status"]
          title: string
          updated_at: string
          visible_to_client: boolean
          why_needed: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["client_task_category"]
          client_notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          source?: string
          status?: Database["public"]["Enums"]["client_task_status"]
          title: string
          updated_at?: string
          visible_to_client?: boolean
          why_needed?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["client_task_category"]
          client_notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          source?: string
          status?: Database["public"]["Enums"]["client_task_status"]
          title?: string
          updated_at?: string
          visible_to_client?: boolean
          why_needed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          task_id: string | null
          updated_at: string
          user_id: string
          visible_to_client: boolean
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          task_id?: string | null
          updated_at?: string
          user_id: string
          visible_to_client?: boolean
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
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
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          project_id: string
          updated_at: string
          uploaded_by: string
          visible_to_client: boolean
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          project_id: string
          updated_at?: string
          uploaded_by: string
          visible_to_client?: boolean
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_revenues: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          project_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["revenue_status"]
          type: Database["public"]["Enums"]["revenue_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          project_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["revenue_status"]
          type: Database["public"]["Enums"]["revenue_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          project_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["revenue_status"]
          type?: Database["public"]["Enums"]["revenue_type"]
        }
        Relationships: [
          {
            foreignKeyName: "project_revenues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          business_name: string
          client_id: string | null
          client_name: string
          created_at: string
          display_order: number | null
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
          client_id?: string | null
          client_name: string
          created_at?: string
          display_order?: number | null
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
          client_id?: string | null
          client_name?: string
          created_at?: string
          display_order?: number | null
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
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
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
      task_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          estimated_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          phase: string
          priority: Database["public"]["Enums"]["task_priority"] | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          phase?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          phase?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          phase: string
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          questionnaire_field: string | null
          source: Database["public"]["Enums"]["task_source"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          phase?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          questionnaire_field?: string | null
          source?: Database["public"]["Enums"]["task_source"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          phase?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          questionnaire_field?: string | null
          source?: Database["public"]["Enums"]["task_source"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      get_client_id_for_user: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "document_uploaded"
        | "document_deleted"
        | "task_created"
        | "task_completed"
        | "task_status_changed"
        | "questionnaire_updated"
        | "project_status_changed"
        | "note_added"
      app_role: "admin" | "client"
      client_task_category:
        | "access"
        | "approvals"
        | "content"
        | "assets"
        | "messaging"
        | "incentives"
        | "seo"
        | "other"
      client_task_status: "pending" | "completed" | "not_applicable"
      document_category:
        | "formation"
        | "tax"
        | "branding"
        | "contracts"
        | "compliance"
        | "client_uploads"
        | "other"
      project_status:
        | "discovery"
        | "design"
        | "development"
        | "review"
        | "published"
      revenue_status: "active" | "pending" | "paused" | "cancelled"
      revenue_type: "monthly" | "one_time"
      task_priority: "low" | "medium" | "high" | "critical"
      task_source: "ai_generated" | "manual" | "template"
      task_status: "pending" | "in_progress" | "completed" | "blocked"
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
      activity_type: [
        "document_uploaded",
        "document_deleted",
        "task_created",
        "task_completed",
        "task_status_changed",
        "questionnaire_updated",
        "project_status_changed",
        "note_added",
      ],
      app_role: ["admin", "client"],
      client_task_category: [
        "access",
        "approvals",
        "content",
        "assets",
        "messaging",
        "incentives",
        "seo",
        "other",
      ],
      client_task_status: ["pending", "completed", "not_applicable"],
      document_category: [
        "formation",
        "tax",
        "branding",
        "contracts",
        "compliance",
        "client_uploads",
        "other",
      ],
      project_status: [
        "discovery",
        "design",
        "development",
        "review",
        "published",
      ],
      revenue_status: ["active", "pending", "paused", "cancelled"],
      revenue_type: ["monthly", "one_time"],
      task_priority: ["low", "medium", "high", "critical"],
      task_source: ["ai_generated", "manual", "template"],
      task_status: ["pending", "in_progress", "completed", "blocked"],
    },
  },
} as const
