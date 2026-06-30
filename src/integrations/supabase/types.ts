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
      certificates: {
        Row: {
          certificate_number: string
          course_id: string | null
          grade: string | null
          id: string
          issue_date: string
          qr_code: string | null
          student_id: string
        }
        Insert: {
          certificate_number: string
          course_id?: string | null
          grade?: string | null
          id?: string
          issue_date?: string
          qr_code?: string | null
          student_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string | null
          grade?: string | null
          id?: string
          issue_date?: string
          qr_code?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          billing_info: Json | null
          business_type: string | null
          company_name: string | null
          created_at: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          billing_info?: Json | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          billing_info?: Json | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          cover_image: string | null
          created_at: string
          department_id: string | null
          description: string | null
          duration: string | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          modules: Json | null
          program_name: string
          program_type: Database["public"]["Enums"]["program_type"]
          tuition_ngn: number
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          modules?: Json | null
          program_name: string
          program_type: Database["public"]["Enums"]["program_type"]
          tuition_ngn?: number
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          modules?: Json | null
          program_name?: string
          program_type?: Database["public"]["Enums"]["program_type"]
          tuition_ngn?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          hod_id: string | null
          id: string
          name: string
          pm_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          hod_id?: string | null
          id?: string
          name: string
          pm_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          hod_id?: string | null
          id?: string
          name?: string
          pm_id?: string | null
          slug?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          id: string
          payment_id: string | null
          progress: number | null
          status: string
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          payment_id?: string | null
          progress?: number | null
          status?: string
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          payment_id?: string | null
          progress?: number | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          bio: string | null
          department_id: string | null
          qualifications: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          department_id?: string | null
          qualifications?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          department_id?: string | null
          qualifications?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          task_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          task_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          gateway: string | null
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string | null
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          gateway?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          task_id?: string | null
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          gateway?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          task_id?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          paid_at: string | null
          status: string
          talent_id: string
          tasks_completed: Json | null
          total_amount: number
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          talent_id: string
          tasks_completed?: Json | null
          total_amount?: number
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          talent_id?: string
          tasks_completed?: Json | null
          total_amount?: number
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          notes: string | null
          pm_id: string | null
          status: string
          task_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          notes?: string | null
          pm_id?: string | null
          status?: string
          task_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          notes?: string | null
          pm_id?: string | null
          status?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          current_module: string | null
          enrollment_date: string | null
          grades: Json | null
          program_name: string | null
          program_type: Database["public"]["Enums"]["program_type"] | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          current_module?: string | null
          enrollment_date?: string | null
          grades?: Json | null
          program_name?: string | null
          program_type?: Database["public"]["Enums"]["program_type"] | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          current_module?: string | null
          enrollment_date?: string | null
          grades?: Json | null
          program_name?: string | null
          program_type?: Database["public"]["Enums"]["program_type"] | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: []
      }
      talents: {
        Row: {
          bank_details: Json | null
          created_at: string
          department_id: string | null
          performance_score: number | null
          skills: string[] | null
          status: string
          tier: number
          total_earnings: number | null
          user_id: string
        }
        Insert: {
          bank_details?: Json | null
          created_at?: string
          department_id?: string | null
          performance_score?: number | null
          skills?: string[] | null
          status?: string
          tier?: number
          total_earnings?: number | null
          user_id: string
        }
        Update: {
          bank_details?: Json | null
          created_at?: string
          department_id?: string | null
          performance_score?: number | null
          skills?: string[] | null
          status?: string
          tier?: number
          total_earnings?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_pm_id: string | null
          assigned_talent_id: string | null
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          client_id: string
          created_at: string
          deadline: string | null
          department_id: string | null
          description: string | null
          files: Json | null
          id: string
          open_to_negotiation: boolean | null
          service_category: Database["public"]["Enums"]["service_category"]
          status: Database["public"]["Enums"]["task_status"]
          tier: Database["public"]["Enums"]["task_tier"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_pm_id?: string | null
          assigned_talent_id?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_id: string
          created_at?: string
          deadline?: string | null
          department_id?: string | null
          description?: string | null
          files?: Json | null
          id?: string
          open_to_negotiation?: boolean | null
          service_category: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["task_status"]
          tier?: Database["public"]["Enums"]["task_tier"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_pm_id?: string | null
          assigned_talent_id?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          department_id?: string | null
          description?: string | null
          files?: Json | null
          id?: string
          open_to_negotiation?: boolean | null
          service_category?: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["task_status"]
          tier?: Database["public"]["Enums"]["task_tier"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role:
        | "client"
        | "talent"
        | "student"
        | "instructor"
        | "pm"
        | "hod"
        | "admin"
        | "super_admin"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      program_type: "certificate" | "diploma" | "professional"
      service_category:
        | "design"
        | "development"
        | "content"
        | "marketing"
        | "media"
        | "ai"
      task_status:
        | "pending"
        | "quoted"
        | "in_progress"
        | "in_review"
        | "revision"
        | "delivered"
        | "completed"
        | "cancelled"
      task_tier: "basic" | "professional" | "premium"
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
      app_role: [
        "client",
        "talent",
        "student",
        "instructor",
        "pm",
        "hod",
        "admin",
        "super_admin",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      program_type: ["certificate", "diploma", "professional"],
      service_category: [
        "design",
        "development",
        "content",
        "marketing",
        "media",
        "ai",
      ],
      task_status: [
        "pending",
        "quoted",
        "in_progress",
        "in_review",
        "revision",
        "delivered",
        "completed",
        "cancelled",
      ],
      task_tier: ["basic", "professional", "premium"],
    },
  },
} as const
