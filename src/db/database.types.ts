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
      address: {
        Row: {
          city: string | null;
          countryCode: string | null;
          id: number;
          mapLink: string | null;
          postalCode: string | null;
          state: string | null;
          streetAddress: string | null;
        };
        Insert: {
          city?: string | null;
          countryCode?: string | null;
          id?: number;
          mapLink?: string | null;
          postalCode?: string | null;
          state?: string | null;
          streetAddress?: string | null;
        };
        Update: {
          city?: string | null;
          countryCode?: string | null;
          id?: number;
          mapLink?: string | null;
          postalCode?: string | null;
          state?: string | null;
          streetAddress?: string | null;
        };
        Relationships: [];
      };
      attendanceSessionAggregates: {
        Row: {
          id: number;
          teamId: number;
          tenantId: number;
          seasonId: number;
          totalSessions: number;
          totalOnTime: number;
          totalLate: number;
          totalAbsent: number;
          averageAttendanceRate: number;
          sessions: Json;
          aggregatedAt: string | null;
        };
        Insert: {
          id?: number;
          teamId: number;
          tenantId: number;
          seasonId: number;
          totalSessions: number;
          totalOnTime: number;
          totalLate: number;
          totalAbsent: number;
          averageAttendanceRate: number;
          sessions: Json;
          aggregatedAt?: string | null;
        };
        Update: {
          id?: number;
          teamId?: number;
          tenantId?: number;
          seasonId?: number;
          totalSessions?: number;
          totalOnTime?: number;
          totalLate?: number;
          totalAbsent?: number;
          averageAttendanceRate?: number;
          sessions?: Json;
          aggregatedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendanceSessionAggregates_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendanceSessionAggregates_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendanceSessionAggregates_seasonId_fkey";
            columns: ["seasonId"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          }
        ];
      };
      attendanceRecordAggregates: {
        Row: {
          id: number;
          playerId: number;
          teamId: number;
          tenantId: number;
          seasonId: number;
          totalOnTime: number;
          totalLate: number;
          totalAbsent: number;
          attendanceRate: number;
          records: Json;
          aggregatedAt: string | null;
        };
        Insert: {
          id?: number;
          playerId: number;
          teamId: number;
          tenantId: number;
          seasonId: number;
          totalOnTime: number;
          totalLate: number;
          totalAbsent: number;
          attendanceRate: number;
          records: Json;
          aggregatedAt?: string | null;
        };
        Update: {
          id?: number;
          playerId?: number;
          teamId?: number;
          tenantId?: number;
          seasonId?: number;
          totalOnTime?: number;
          totalLate?: number;
          totalAbsent?: number;
          attendanceRate?: number;
          records?: Json;
          aggregatedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendanceRecordAggregates_playerId_fkey";
            columns: ["playerId"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendanceRecordAggregates_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendanceRecordAggregates_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      clubs: {
        Row: {
          contactEmail: string | null;
          contactPhone: string | null;
          description: string | null;
          id: number;
          location: string | null;
          name: string | null;
          shortName: string | null;
          sport: string | null;
          tenantId: number | null;
        };
        Insert: {
          contactEmail?: string | null;
          contactPhone?: string | null;
          description?: string | null;
          id?: number;
          location?: string | null;
          name?: string | null;
          shortName?: string | null;
          sport?: string | null;
          tenantId?: number | null;
        };
        Update: {
          contactEmail?: string | null;
          contactPhone?: string | null;
          description?: string | null;
          id?: number;
          location?: string | null;
          name?: string | null;
          shortName?: string | null;
          sport?: string | null;
          tenantId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      divisions: {
        Row: {
          age: string | null;
          createdAt: string;
          endDate: string | null;
          gender: string | null;
          id: number;
          level: string | null;
          name: string | null;
          startDate: string | null;
          tenantId: number | null;
        };
        Insert: {
          age?: string | null;
          createdAt?: string;
          endDate?: string | null;
          gender?: string | null;
          id?: number;
          level?: string | null;
          name?: string | null;
          startDate?: string | null;
          tenantId?: number | null;
        };
        Update: {
          age?: string | null;
          createdAt?: string;
          endDate?: string | null;
          gender?: string | null;
          id?: number;
          level?: string | null;
          name?: string | null;
          startDate?: string | null;
          tenantId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "divisions_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      games: {
        Row: {
          addressId: number | null;
          awayTeamConfirmation: boolean | null;
          awayTeamId: number | null;
          awayTeamScore: string | null;
          date: string | null;
          divisionId: number | null;
          homeTeamConfirmation: boolean | null;
          homeTeamId: number | null;
          homeTeamScore: string | null;
          id: number;
          startTime: string | null;
        };
        Insert: {
          addressId?: number | null;
          awayTeamConfirmation?: boolean | null;
          awayTeamId?: number | null;
          awayTeamScore?: string | null;
          date?: string | null;
          divisionId?: number | null;
          homeTeamConfirmation?: boolean | null;
          homeTeamId?: number | null;
          homeTeamScore?: string | null;
          id?: number;
          startTime?: string | null;
        };
        Update: {
          addressId?: number | null;
          awayTeamConfirmation?: boolean | null;
          awayTeamId?: number | null;
          awayTeamScore?: string | null;
          date?: string | null;
          divisionId?: number | null;
          homeTeamConfirmation?: boolean | null;
          homeTeamId?: number | null;
          homeTeamScore?: string | null;
          id?: number;
          startTime?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "games_addressId_fkey";
            columns: ["addressId"];
            isOneToOne: false;
            referencedRelation: "address";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_awayTeamId_fkey";
            columns: ["awayTeamId"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_divisionId_fkey";
            columns: ["divisionId"];
            isOneToOne: false;
            referencedRelation: "divisions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_homeTeamId_fkey";
            columns: ["homeTeamId"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      roles: {
        Row: {
          id: number;
          name: string | null;
          permissions: Json | null;
          tenantId: number | null;
        };
        Insert: {
          id?: number;
          name?: string | null;
          permissions?: Json | null;
          tenantId?: number | null;
        };
        Update: {
          id?: number;
          name?: string | null;
          permissions?: Json | null;
          tenantId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "roles_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      season: {
        Row: {
          endDate: string | null;
          id: number;
          startDate: string | null;
          tenantId: number | null;
        };
        Insert: {
          endDate?: string | null;
          id?: number;
          startDate?: string | null;
          tenantId?: number | null;
        };
        Update: {
          endDate?: string | null;
          id?: number;
          startDate?: string | null;
          tenantId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "season_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          age: string | null;
          clubId: number | null;
          gender: string | null;
          id: number;
          name: string | null;
          skill: string | null;
          tenantId: number | null;
        };
        Insert: {
          age?: string | null;
          clubId?: number | null;
          gender?: string | null;
          id?: number;
          name?: string | null;
          skill?: string | null;
          tenantId?: number | null;
        };
        Update: {
          age?: string | null;
          clubId?: number | null;
          gender?: string | null;
          id?: number;
          name?: string | null;
          skill?: string | null;
          tenantId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_clubId_fkey";
            columns: ["clubId"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teams_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      teamStatistics: {
        Row: {
          divisionId: number | null;
          draws: number | null;
          goalDifference: number | null;
          goalsAgainst: number | null;
          goalsFor: number | null;
          id: number;
          losses: number | null;
          points: number | null;
          streak: string | null;
          teamId: number | null;
          tenantId: number | null;
          wins: number | null;
        };
        Insert: {
          divisionId?: number | null;
          draws?: number | null;
          goalDifference?: number | null;
          goalsAgainst?: number | null;
          goalsFor?: number | null;
          id?: number;
          losses?: number | null;
          points?: number | null;
          streak?: string | null;
          teamId?: number | null;
          tenantId?: number | null;
          wins?: number | null;
        };
        Update: {
          divisionId?: number | null;
          draws?: number | null;
          goalDifference?: number | null;
          goalsAgainst?: number | null;
          goalsFor?: number | null;
          id?: number;
          losses?: number | null;
          points?: number | null;
          streak?: string | null;
          teamId?: number | null;
          tenantId?: number | null;
          wins?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "teamStatistics_divisionId_fkey";
            columns: ["divisionId"];
            isOneToOne: false;
            referencedRelation: "divisions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teamStatistics_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teamStatistics_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      tenants: {
        Row: {
          createdAt: string;
          description: string | null;
          domain: string | null;
          email: string | null;
          id: number;
          location: string | null;
          logo: string | null;
          name: string | null;
          phoneNumber: string | null;
          sport: string | null;
          type: string | null;
        };
        Insert: {
          createdAt?: string;
          description?: string | null;
          domain?: string | null;
          email?: string | null;
          id?: number;
          location?: string | null;
          logo?: string | null;
          name?: string | null;
          phoneNumber?: string | null;
          sport?: string | null;
          type?: string | null;
        };
        Update: {
          createdAt?: string;
          description?: string | null;
          domain?: string | null;
          email?: string | null;
          id?: number;
          location?: string | null;
          logo?: string | null;
          name?: string | null;
          phoneNumber?: string | null;
          sport?: string | null;
          type?: string | null;
        };
        Relationships: [];
      };
      userEntities: {
        Row: {
          id: number;
          createdAt: string;
          adminRole: string | null;
          tenantId: number | null;
          clubId: number | null;
          divisionId: number | null;
          teamId: number | null;
          userId: string | null;
          domainRole: string | null;
        };
        Insert: {
          id?: number;
          createdAt?: string;
          adminRole?: string | null;
          tenantId?: number | null;
          clubId?: number | null;
          divisionId?: number | null;
          teamId?: number | null;
          userId?: string | null;
          domainRole?: string | null;
        };
        Update: {
          id?: number;
          createdAt?: string;
          adminRole?: string | null;
          tenantId?: number | null;
          clubId?: number | null;
          divisionId?: number | null;
          teamId?: number | null;
          userId?: string | null;
          domainRole?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "userEntities_clubId_fkey";
            columns: ["clubId"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "userEntities_divisionId_fkey";
            columns: ["divisionId"];
            isOneToOne: false;
            referencedRelation: "divisions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "userEntities_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "userEntities_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "userEntities_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          email: string | null;
          firstName: string | null;
          id: string;
          lastName: string | null;
        };
        Insert: {
          email?: string | null;
          firstName?: string | null;
          id: string;
          lastName?: string | null;
        };
        Update: {
          email?: string | null;
          firstName?: string | null;
          id?: string;
          lastName?: string | null;
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
      get_featured_game_results: {
        Args: {
          domain_param: string;
        };
        Returns: {
          id: number;
          date: string;
          start_time: string;
          home_team_id: number;
          away_team_id: number;
          home_team_score: string;
          away_team_score: string;
          home_team_confirmation: boolean;
          away_team_confirmation: boolean;
          division_id: number;
          division_name: string;
          home_team_name: string;
          away_team_name: string;
          home_team_organization_name: string;
          away_team_organization_name: string;
          home_team_organization_short_name: string;
          away_team_organization_short_name: string;
          division_age: string;
          division_level: string;
          division_gender: string;
        }[];
      };
      batch_create_trainings: {
        Args: {
          p_trainings: Json;
          p_tenant_id: number;
          p_season_id: number;
        };
        Returns: {
          id: number;
          date: string;
          startTime: string;
          endTime: string;
          location: Json;
          teamId: number | null;
          tenantId: number;
        }[];
      };
      update_training_pattern: {
        Args: {
          p_tenant_id: number;
          p_pattern_id: string;
          p_updates: {
            startTime?: string;
            endTime?: string;
            location?: Json;
            seasonId?: number;
            fromDate?: string;
            originalStartTime: string;
            originalEndTime: string;
          };
        };
        Returns: void;
      };
      get_featured_upcoming_games: {
        Args: {
          domain_param: string;
          division_id_param: number;
        };
        Returns: {
          id: number;
          date: string;
          start_time: string;
          home_team_id: number;
          away_team_id: number;
          home_team_name: string;
          away_team_name: string;
          home_team_organization_name: string;
          away_team_organization_name: string;
          home_team_organization_short_name: string;
          away_team_organization_short_name: string;
          address_id: number;
          street_address: string;
          city: string;
          state: string;
          postal_code: string;
          country_code: string;
          map_link: string;
        }[];
      };
      get_grouped_trainings: {
        Args: {
          p_tenant_id: number;
          p_season_id?: number | null;
        };
        Returns: {
          dayOfWeek: number;
          startTime: string;
          endTime: string;
          location: Json;
          teamId: number | null;
          teamName: string | null;
          trainingCount: number;
          firstDate: string;
          lastDate: string;
        }[];
      };
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
      delete_training_pattern: {
        Args: {
          p_tenant_id: number;
          p_pattern_id: string;
          p_params: {
            seasonId: number;
            fromDate?: string;
            originalStartTime: string;
            originalEndTime: string;
          };
        };
        Returns: void;
      };
      get_team_player_attendance_stats: {
        Args: {
          teamId: number;
          tenantId: number;
        };
        Returns: {
          playerId: number;
          firstName: string;
          lastName: string;
          totalAttendance: number;
          totalLate: number;
          totalAbsent: number;
          totalSessions: number;
          attendancePercentage: number;
        }[];
      };
      get_team_attendance_stats: {
        Args: {
          teamId: number;
          tenantId: number;
          seasonId?: number | null;
        };
        Returns: {
          totalSessions: number;
          averageAttendanceRate: number;
          averagePlayersPerSession: number;
          dayOfWeekStats: {
            dayOfWeek: string;
            attendanceRate: number;
            averagePlayersPresent: number;
          }[];
          lateArrivalRate: number;
          mostConsecutiveFullAttendance: number;
          recentTrend: {
            date: string;
            attendanceRate: number;
            playersPresent: number;
            totalPlayers: number;
          }[];
        };
      };
      update_absent_records: {
        Args: {
          session_id: number;
        };
        Returns: void;
      };
      aggregate_attendance_on_session_close: {
        Args: {
          session_id: number;
          tenant_id: number;
          not_checked_in_player_ids: number[];
        };
        Returns: void;
      };
      aggregate_and_cleanup_attendance: {
        Args: {
          session_id: number;
          tenant_id: number;
          not_checked_in_player_ids: number[];
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

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
