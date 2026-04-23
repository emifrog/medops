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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          code_cis: string
          date_debut: string | null
          date_fin: string | null
          id: number
          lien: string | null
          texte: string | null
          updated_at: string | null
        }
        Insert: {
          code_cis: string
          date_debut?: string | null
          date_fin?: string | null
          id?: never
          lien?: string | null
          texte?: string | null
          updated_at?: string | null
        }
        Update: {
          code_cis?: string
          date_debut?: string | null
          date_fin?: string | null
          id?: never
          lien?: string | null
          texte?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_code_cis_fkey"
            columns: ["code_cis"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["code_cis"]
          },
        ]
      }
      data_version: {
        Row: {
          id: number
          updated_at: string | null
          version: string
        }
        Insert: {
          id?: number
          updated_at?: string | null
          version: string
        }
        Update: {
          id?: number
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          cat: string | null
          description: string | null
          id: number
          level: string
          substance1: string
          substance2: string
          updated_at: string | null
        }
        Insert: {
          cat?: string | null
          description?: string | null
          id?: never
          level: string
          substance1: string
          substance2: string
          updated_at?: string | null
        }
        Update: {
          cat?: string | null
          description?: string | null
          id?: never
          level?: string
          substance1?: string
          substance2?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          classe: string | null
          code_atc: string | null
          code_cis: string
          conservation: string | null
          dci: string | null
          dosage: string | null
          forme: string | null
          labo: string | null
          name: string
          search_text: string | null
          statut_amm: string | null
          updated_at: string | null
          voie: string | null
        }
        Insert: {
          classe?: string | null
          code_atc?: string | null
          code_cis: string
          conservation?: string | null
          dci?: string | null
          dosage?: string | null
          forme?: string | null
          labo?: string | null
          name: string
          search_text?: string | null
          statut_amm?: string | null
          updated_at?: string | null
          voie?: string | null
        }
        Update: {
          classe?: string | null
          code_atc?: string | null
          code_cis?: string
          conservation?: string | null
          dci?: string | null
          dosage?: string | null
          forme?: string | null
          labo?: string | null
          name?: string
          search_text?: string | null
          statut_amm?: string | null
          updated_at?: string | null
          voie?: string | null
        }
        Relationships: []
      }
      presentations: {
        Row: {
          cip13: string
          cip7: string | null
          code_cis: string
          libelle: string | null
          prix: string | null
          updated_at: string | null
        }
        Insert: {
          cip13: string
          cip7?: string | null
          code_cis: string
          libelle?: string | null
          prix?: string | null
          updated_at?: string | null
        }
        Update: {
          cip13?: string
          cip7?: string | null
          code_cis?: string
          libelle?: string | null
          prix?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentations_code_cis_fkey"
            columns: ["code_cis"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["code_cis"]
          },
        ]
      }
      substances: {
        Row: {
          code_cis: string
          dci: string
          dosage: string | null
          id: number
          nature: string | null
          updated_at: string | null
        }
        Insert: {
          code_cis: string
          dci: string
          dosage?: string | null
          id?: never
          nature?: string | null
          updated_at?: string | null
        }
        Update: {
          code_cis?: string
          dci?: string
          dosage?: string | null
          id?: never
          nature?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substances_code_cis_fkey"
            columns: ["code_cis"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["code_cis"]
          },
        ]
      }
      surdosage: {
        Row: {
          antidote: string | null
          cat: string[] | null
          dci: string
          delai_action: string | null
          dose_toxique: string | null
          gravite: string | null
          id: number
          indication: string | null
          orientation: string | null
          symptomes: string[] | null
          updated_at: string | null
        }
        Insert: {
          antidote?: string | null
          cat?: string[] | null
          dci: string
          delai_action?: string | null
          dose_toxique?: string | null
          gravite?: string | null
          id?: never
          indication?: string | null
          orientation?: string | null
          symptomes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          antidote?: string | null
          cat?: string[] | null
          dci?: string
          delai_action?: string | null
          dose_toxique?: string | null
          gravite?: string | null
          id?: never
          indication?: string | null
          orientation?: string | null
          symptomes?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
