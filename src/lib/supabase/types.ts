export interface Database {
  public: {
    Tables: {
      medications: {
        Row: {
          code_cis: string;
          name: string;
          dci: string | null;
          dosage: string | null;
          forme: string | null;
          voie: string | null;
          labo: string | null;
          statut_amm: string | null;
          classe: string | null;
          code_atc: string | null;
          search_text: string | null;
          conservation: string | null;
          updated_at: string;
        };
        Insert: {
          code_cis: string;
          name: string;
          dci?: string | null;
          dosage?: string | null;
          forme?: string | null;
          voie?: string | null;
          labo?: string | null;
          statut_amm?: string | null;
          classe?: string | null;
          code_atc?: string | null;
          search_text?: string | null;
          conservation?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["medications"]["Insert"]>;
      };
      substances: {
        Row: {
          id: number;
          code_cis: string;
          dci: string;
          dosage: string | null;
          nature: string | null;
          updated_at: string;
        };
        Insert: {
          code_cis: string;
          dci: string;
          dosage?: string | null;
          nature?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["substances"]["Insert"]>;
      };
      presentations: {
        Row: {
          cip13: string;
          cip7: string | null;
          code_cis: string;
          libelle: string | null;
          prix: string | null;
          updated_at: string;
        };
        Insert: {
          cip13: string;
          cip7?: string | null;
          code_cis: string;
          libelle?: string | null;
          prix?: string | null;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["presentations"]["Insert"]
        >;
      };
      interactions: {
        Row: {
          id: number;
          substance1: string;
          substance2: string;
          level: string;
          description: string | null;
          cat: string | null;
          updated_at: string;
        };
        Insert: {
          substance1: string;
          substance2: string;
          level: string;
          description?: string | null;
          cat?: string | null;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["interactions"]["Insert"]
        >;
      };
      surdosage: {
        Row: {
          id: number;
          dci: string;
          dose_toxique: string | null;
          symptomes: string[] | null;
          cat: string[] | null;
          antidote: string | null;
          gravite: string | null;
          delai_action: string | null;
          orientation: string | null;
          updated_at: string;
        };
        Insert: {
          dci: string;
          dose_toxique?: string | null;
          symptomes?: string[] | null;
          cat?: string[] | null;
          antidote?: string | null;
          gravite?: string | null;
          delai_action?: string | null;
          orientation?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["surdosage"]["Insert"]>;
      };
      alerts: {
        Row: {
          id: number;
          code_cis: string;
          date_debut: string | null;
          date_fin: string | null;
          texte: string | null;
          lien: string | null;
          updated_at: string;
        };
        Insert: {
          code_cis: string;
          date_debut?: string | null;
          date_fin?: string | null;
          texte?: string | null;
          lien?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
      data_version: {
        Row: {
          id: number;
          version: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          version: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["data_version"]["Insert"]
        >;
      };
    };
  };
}
