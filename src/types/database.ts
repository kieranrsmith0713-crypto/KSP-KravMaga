/**
 * Types describing your Supabase database schema.
 *
 * This is a hand-written starting point matching db/schema.sql. Once your
 * schema settles, you can auto-generate this file with the Supabase CLI:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      krav_classes: {
        Row: {
          id: string
          user_id: string
          class_date: string
          duration_minutes: number
          class_type: string
          intensity: number | null
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          class_date?: string
          duration_minutes?: number
          class_type?: string
          intensity?: number | null
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          class_date?: string
          duration_minutes?: number
          class_type?: string
          intensity?: number | null
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      krav_techniques: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          level: string
          proficiency: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string
          level?: string
          proficiency?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          level?: string
          proficiency?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      krav_gradings: {
        Row: {
          id: string
          user_id: string
          grading_date: string
          level: string
          passed: boolean | null
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grading_date: string
          level: string
          passed?: boolean | null
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grading_date?: string
          level?: string
          passed?: boolean | null
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      user_app_access: {
        Row: {
          user_id: string
          app_id: string
        }
        Insert: {
          user_id: string
          app_id: string
        }
        Update: {
          user_id?: string
          app_id?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

/** Convenience row types for use in components. */
export type KravClass = Database['public']['Tables']['krav_classes']['Row']
export type KravClassInsert = Database['public']['Tables']['krav_classes']['Insert']

export type Technique = Database['public']['Tables']['krav_techniques']['Row']
export type TechniqueInsert = Database['public']['Tables']['krav_techniques']['Insert']
export type TechniqueUpdate = Database['public']['Tables']['krav_techniques']['Update']

export type Grading = Database['public']['Tables']['krav_gradings']['Row']
export type GradingInsert = Database['public']['Tables']['krav_gradings']['Insert']
export type GradingUpdate = Database['public']['Tables']['krav_gradings']['Update']
