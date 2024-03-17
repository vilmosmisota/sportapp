export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      divisions: {
        Row: {
          created_at: string;
          division: string | null;
          gender: string | null;
          id: number;
          tenant_id: number | null;
        };
        Insert: {
          created_at?: string;
          division?: string | null;
          gender?: string | null;
          id?: number;
          tenant_id?: number | null;
        };
        Update: {
          created_at?: string;
          division?: string | null;
          gender?: string | null;
          id?: number;
          tenant_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_leagues_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      fixtures: {
        Row: {
          description: string | null;
          division_id: number | null;
          end_date: string | null;
          id: number;
          name: string | null;
          start_date: string | null;
          type: string | null;
        };
        Insert: {
          description?: string | null;
          division_id?: number | null;
          end_date?: string | null;
          id?: number;
          name?: string | null;
          start_date?: string | null;
          type?: string | null;
        };
        Update: {
          description?: string | null;
          division_id?: number | null;
          end_date?: string | null;
          id?: number;
          name?: string | null;
          start_date?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_fixtures_division_id_fkey";
            columns: ["division_id"];
            isOneToOne: false;
            referencedRelation: "divisions";
            referencedColumns: ["id"];
          }
        ];
      };
      games: {
        Row: {
          away_team_confirmation: boolean | null;
          away_team_id: number | null;
          away_team_score: string | null;
          date: string | null;
          fixture_id: number | null;
          home_team_confirmation: boolean | null;
          home_team_id: number | null;
          home_team_score: string | null;
          id: number;
          start_time: string | null;
          winner_id: number | null;
        };
        Insert: {
          away_team_confirmation?: boolean | null;
          away_team_id?: number | null;
          away_team_score?: string | null;
          date?: string | null;
          fixture_id?: number | null;
          home_team_confirmation?: boolean | null;
          home_team_id?: number | null;
          home_team_score?: string | null;
          id?: number;
          start_time?: string | null;
          winner_id?: number | null;
        };
        Update: {
          away_team_confirmation?: boolean | null;
          away_team_id?: number | null;
          away_team_score?: string | null;
          date?: string | null;
          fixture_id?: number | null;
          home_team_confirmation?: boolean | null;
          home_team_id?: number | null;
          home_team_score?: string | null;
          id?: number;
          start_time?: string | null;
          winner_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_games_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_games_fixture_id_fkey";
            columns: ["fixture_id"];
            isOneToOne: false;
            referencedRelation: "fixtures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_games_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_games_winner_id_fkey";
            columns: ["winner_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      organizations: {
        Row: {
          contact_email: string | null;
          contact_phone: string | null;
          description: string | null;
          id: number;
          location: string | null;
          name: string | null;
          sport: string | null;
          tenant_id: number | null;
        };
        Insert: {
          contact_email?: string | null;
          contact_phone?: string | null;
          description?: string | null;
          id?: number;
          location?: string | null;
          name?: string | null;
          sport?: string | null;
          tenant_id?: number | null;
        };
        Update: {
          contact_email?: string | null;
          contact_phone?: string | null;
          description?: string | null;
          id?: number;
          location?: string | null;
          name?: string | null;
          sport?: string | null;
          tenant_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_organizations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          age: string | null;
          gender: string | null;
          id: number;
          name: string | null;
          organization_id: number | null;
          skill: string | null;
        };
        Insert: {
          age?: string | null;
          gender?: string | null;
          id?: number;
          name?: string | null;
          organization_id?: number | null;
          skill?: string | null;
        };
        Update: {
          age?: string | null;
          gender?: string | null;
          id?: number;
          name?: string | null;
          organization_id?: number | null;
          skill?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_teams_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          description: string | null;
          domain: string | null;
          email: string | null;
          id: number;
          location: string | null;
          logo: string | null;
          name: string | null;
          phone_number: string | null;
          sport: string | null;
          tenancy: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          domain?: string | null;
          email?: string | null;
          id?: number;
          location?: string | null;
          logo?: string | null;
          name?: string | null;
          phone_number?: string | null;
          sport?: string | null;
          tenancy?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          domain?: string | null;
          email?: string | null;
          id?: number;
          location?: string | null;
          logo?: string | null;
          name?: string | null;
          phone_number?: string | null;
          sport?: string | null;
          tenancy?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          email: string | null;
          email_confirmed: boolean | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
        };
        Insert: {
          email?: string | null;
          email_confirmed?: boolean | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
        };
        Update: {
          email?: string | null;
          email_confirmed?: boolean | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_coach: {
        Args: {
          userid: string;
        };
        Returns: boolean;
      };
      is_management: {
        Args: {
          userid: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;
