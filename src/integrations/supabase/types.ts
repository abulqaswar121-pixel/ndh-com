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
          pdf_url: string | null
          qr_code: string | null
          student_id: string
          verification_token: string | null
        }
        Insert: {
          certificate_number: string
          course_id?: string | null
          grade?: string | null
          id?: string
          issue_date?: string
          pdf_url?: string | null
          qr_code?: string | null
          student_id: string
          verification_token?: string | null
        }
        Update: {
          certificate_number?: string
          course_id?: string | null
          grade?: string | null
          id?: string
          issue_date?: string
          pdf_url?: string | null
          qr_code?: string | null
          student_id?: string
          verification_token?: string | null
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
          certification_text: string | null
          cover_image: string | null
          created_at: string
          curriculum_approved_at: string | null
          curriculum_approved_by: string | null
          curriculum_status: Database["public"]["Enums"]["curriculum_status"]
          department_id: string | null
          description: string | null
          duration: string | null
          duration_months: number | null
          entry_requirements: string | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          learning_outcomes: Json | null
          modules: Json | null
          overview: string | null
          program_name: string
          program_type: Database["public"]["Enums"]["program_type"]
          rating: number | null
          schedule_text: string | null
          slug: string | null
          students_count: number | null
          tuition_ngn: number
          updated_at: string
          what_youll_learn: Json | null
        }
        Insert: {
          certification_text?: string | null
          cover_image?: string | null
          created_at?: string
          curriculum_approved_at?: string | null
          curriculum_approved_by?: string | null
          curriculum_status?: Database["public"]["Enums"]["curriculum_status"]
          department_id?: string | null
          description?: string | null
          duration?: string | null
          duration_months?: number | null
          entry_requirements?: string | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          learning_outcomes?: Json | null
          modules?: Json | null
          overview?: string | null
          program_name: string
          program_type: Database["public"]["Enums"]["program_type"]
          rating?: number | null
          schedule_text?: string | null
          slug?: string | null
          students_count?: number | null
          tuition_ngn?: number
          updated_at?: string
          what_youll_learn?: Json | null
        }
        Update: {
          certification_text?: string | null
          cover_image?: string | null
          created_at?: string
          curriculum_approved_at?: string | null
          curriculum_approved_by?: string | null
          curriculum_status?: Database["public"]["Enums"]["curriculum_status"]
          department_id?: string | null
          description?: string | null
          duration?: string | null
          duration_months?: number | null
          entry_requirements?: string | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          learning_outcomes?: Json | null
          modules?: Json | null
          overview?: string | null
          program_name?: string
          program_type?: Database["public"]["Enums"]["program_type"]
          rating?: number | null
          schedule_text?: string | null
          slug?: string | null
          students_count?: number | null
          tuition_ngn?: number
          updated_at?: string
          what_youll_learn?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_curriculum_approved_by_fkey"
            columns: ["curriculum_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_change_requests: {
        Row: {
          change_summary: string
          course_id: string
          created_at: string
          diff: Json
          id: string
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          change_summary: string
          course_id: string
          created_at?: string
          diff?: Json
          id?: string
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          change_summary?: string
          course_id?: string
          created_at?: string
          diff?: Json
          id?: string
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_change_requests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_change_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      department_reports: {
        Row: {
          created_at: string
          department_id: string
          generated_by: string | null
          id: string
          metrics: Json
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string
          department_id: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string
          department_id?: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_reports_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          education_background: Json | null
          id: string
          motivation_essay: string | null
          payment_id: string | null
          payment_status: string
          personal_info: Json | null
          progress: number | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          education_background?: Json | null
          id?: string
          motivation_essay?: string | null
          payment_id?: string | null
          payment_status?: string
          personal_info?: Json | null
          progress?: number | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          education_background?: Json | null
          id?: string
          motivation_essay?: string | null
          payment_id?: string | null
          payment_status?: string
          personal_info?: Json | null
          progress?: number | null
          status?: string
          student_id?: string
          updated_at?: string
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
      graduate_recommendations: {
        Row: {
          admin_notes: string | null
          course_id: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          department_id: string | null
          id: string
          justification: string
          recommended_by: string
          recommended_tier: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          course_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          department_id?: string | null
          id?: string
          justification: string
          recommended_by: string
          recommended_tier?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          course_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          department_id?: string | null
          id?: string
          justification?: string
          recommended_by?: string
          recommended_tier?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "graduate_recommendations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduate_recommendations_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduate_recommendations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduate_recommendations_recommended_by_fkey"
            columns: ["recommended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduate_recommendations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          notes: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_text: string | null
          content_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean
          module_id: string
          position: number
          resources: Json | null
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at: string
        }
        Insert: {
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean
          module_id: string
          position?: number
          resources?: Json | null
          title: string
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
        }
        Update: {
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean
          module_id?: string
          position?: number
          resources?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
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
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          task_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          task_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
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
          enrollment_id: string | null
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
          enrollment_id?: string | null
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
          enrollment_id?: string | null
          gateway?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          task_id?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
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
      pm_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          department_id: string
          email: string
          expires_at: string
          full_name: string
          id: string
          invited_by: string | null
          phone: string | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          department_id: string
          email: string
          expires_at?: string
          full_name: string
          id?: string
          invited_by?: string | null
          phone?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          department_id?: string
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invited_by?: string | null
          phone?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string | null
          department_id: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          welcome_sent: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          department_id?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          welcome_sent?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          department_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          welcome_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          delivery_days: number | null
          expires_at: string | null
          id: string
          notes: string | null
          pm_id: string | null
          responded_at: string | null
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          delivery_days?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          pm_id?: string | null
          responded_at?: string | null
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          delivery_days?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          pm_id?: string | null
          responded_at?: string | null
          status?: string
          task_id?: string
          updated_at?: string
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
      reviews: {
        Row: {
          client_id: string
          communication_rating: number
          created_at: string
          id: string
          overall_rating: number
          pm_id: string | null
          quality_rating: number
          speed_rating: number
          task_id: string
          would_hire_again: boolean | null
          written_review: string | null
        }
        Insert: {
          client_id: string
          communication_rating: number
          created_at?: string
          id?: string
          overall_rating: number
          pm_id?: string | null
          quality_rating: number
          speed_rating: number
          task_id: string
          would_hire_again?: boolean | null
          written_review?: string | null
        }
        Update: {
          client_id?: string
          communication_rating?: number
          created_at?: string
          id?: string
          overall_rating?: number
          pm_id?: string | null
          quality_rating?: number
          speed_rating?: number
          task_id?: string
          would_hire_again?: boolean | null
          written_review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_task_id_fkey"
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      talent_invitations: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          created_at: string
          department_id: string | null
          email: string
          expires_at: string
          full_name: string
          id: string
          invited_by: string | null
          skills: string[]
          tier: number
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          expires_at?: string
          full_name: string
          id?: string
          invited_by?: string | null
          skills?: string[]
          tier?: number
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invited_by?: string | null
          skills?: string[]
          tier?: number
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_reviews: {
        Row: {
          approved: boolean
          communication_rating: number
          created_at: string
          id: string
          notes: string | null
          pm_id: string
          quality_rating: number
          talent_id: string
          task_id: string
          timeliness_rating: number
        }
        Insert: {
          approved?: boolean
          communication_rating: number
          created_at?: string
          id?: string
          notes?: string | null
          pm_id: string
          quality_rating: number
          talent_id: string
          task_id: string
          timeliness_rating: number
        }
        Update: {
          approved?: boolean
          communication_rating?: number
          created_at?: string
          id?: string
          notes?: string | null
          pm_id?: string
          quality_rating?: number
          talent_id?: string
          task_id?: string
          timeliness_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "talent_reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          approval_rate: number
          availability: string
          bank_details: Json | null
          created_at: string
          department_id: string | null
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          max_active_tasks: number
          performance_score: number | null
          phone: string | null
          skills: string[] | null
          status: string
          tasks_completed: number
          tier: number
          total_earnings: number | null
          user_id: string
        }
        Insert: {
          approval_rate?: number
          availability?: string
          bank_details?: Json | null
          created_at?: string
          department_id?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          max_active_tasks?: number
          performance_score?: number | null
          phone?: string | null
          skills?: string[] | null
          status?: string
          tasks_completed?: number
          tier?: number
          total_earnings?: number | null
          user_id: string
        }
        Update: {
          approval_rate?: number
          availability?: string
          bank_details?: Json | null
          created_at?: string
          department_id?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          max_active_tasks?: number
          performance_score?: number | null
          phone?: string | null
          skills?: string[] | null
          status?: string
          tasks_completed?: number
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
      task_events: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          payload: Json
          task_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          task_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          task_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
          completed_at: string | null
          created_at: string
          deadline: string | null
          deliverables: Json | null
          delivered_at: string | null
          delivered_by: string | null
          department_id: string | null
          description: string | null
          files: Json | null
          first_response_at: string | null
          first_response_due_at: string | null
          id: string
          open_to_negotiation: boolean | null
          quoted_amount: number | null
          quoted_currency: string | null
          reviewed: boolean | null
          revision_count: number
          revision_notes: string | null
          service_category: Database["public"]["Enums"]["service_category"]
          status: Database["public"]["Enums"]["task_status"]
          talent_assigned_at: string | null
          talent_pay_rate: number | null
          talent_response: string | null
          talent_response_deadline: string | null
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
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          deliverables?: Json | null
          delivered_at?: string | null
          delivered_by?: string | null
          department_id?: string | null
          description?: string | null
          files?: Json | null
          first_response_at?: string | null
          first_response_due_at?: string | null
          id?: string
          open_to_negotiation?: boolean | null
          quoted_amount?: number | null
          quoted_currency?: string | null
          reviewed?: boolean | null
          revision_count?: number
          revision_notes?: string | null
          service_category: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["task_status"]
          talent_assigned_at?: string | null
          talent_pay_rate?: number | null
          talent_response?: string | null
          talent_response_deadline?: string | null
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
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          deliverables?: Json | null
          delivered_at?: string | null
          delivered_by?: string | null
          department_id?: string | null
          description?: string | null
          files?: Json | null
          first_response_at?: string | null
          first_response_due_at?: string | null
          id?: string
          open_to_negotiation?: boolean | null
          quoted_amount?: number | null
          quoted_currency?: string | null
          reviewed?: boolean | null
          revision_count?: number
          revision_notes?: string | null
          service_category?: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["task_status"]
          talent_assigned_at?: string | null
          talent_pay_rate?: number | null
          talent_response?: string | null
          talent_response_deadline?: string | null
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_lesson_content: {
        Args: { _lesson_id: string }
        Returns: {
          content_text: string | null
          content_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean
          module_id: string
          position: number
          resources: Json | null
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "lessons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_talent_task: {
        Args: { _task_id: string }
        Returns: {
          assigned_pm_id: string | null
          assigned_talent_id: string | null
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          client_id: string
          completed_at: string | null
          created_at: string
          deadline: string | null
          deliverables: Json | null
          delivered_at: string | null
          delivered_by: string | null
          department_id: string | null
          description: string | null
          files: Json | null
          first_response_at: string | null
          first_response_due_at: string | null
          id: string
          open_to_negotiation: boolean | null
          quoted_amount: number | null
          quoted_currency: string | null
          reviewed: boolean | null
          revision_count: number
          revision_notes: string | null
          service_category: Database["public"]["Enums"]["service_category"]
          status: Database["public"]["Enums"]["task_status"]
          talent_assigned_at: string | null
          talent_pay_rate: number | null
          talent_response: string | null
          talent_response_deadline: string | null
          tier: Database["public"]["Enums"]["task_tier"]
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_talent_tasks: {
        Args: never
        Returns: {
          assigned_pm_id: string
          assigned_talent_id: string
          completed_at: string
          created_at: string
          deadline: string
          deliverables: Json
          delivered_at: string
          description: string
          files: Json
          id: string
          revision_count: number
          revision_notes: string
          service_category: Database["public"]["Enums"]["service_category"]
          status: Database["public"]["Enums"]["task_status"]
          talent_assigned_at: string
          talent_pay_rate: number
          talent_response: string
          talent_response_deadline: string
          tier: Database["public"]["Enums"]["task_tier"]
          title: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hod_of: { Args: { _dept: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      my_department: { Args: never; Returns: string }
      next_certificate_number: { Args: never; Returns: string }
      pick_pm_for_department: { Args: { _dept_id: string }; Returns: string }
      pm_department: { Args: { _uid: string }; Returns: string }
      primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      talent_respond_to_task: {
        Args: { _accept: boolean; _task_id: string }
        Returns: undefined
      }
      talent_submit_work: {
        Args: { _deliverables: Json; _notes: string; _task_id: string }
        Returns: undefined
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
      curriculum_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "needs_revision"
      lesson_type: "video" | "pdf" | "text" | "quiz"
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
        | "submitted_qa"
        | "revision_required"
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
      curriculum_status: [
        "draft",
        "pending_approval",
        "approved",
        "needs_revision",
      ],
      lesson_type: ["video", "pdf", "text", "quiz"],
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
        "submitted_qa",
        "revision_required",
      ],
      task_tier: ["basic", "professional", "premium"],
    },
  },
} as const
