export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CommunityType = 'dorm' | 'apartment' | 'campus';
export type MoveDirection = 'out' | 'in';
export type MoveStatus = 'planning' | 'active' | 'done';
export type ListingKind = 'sale' | 'free';
export type ListingStatus = 'available' | 'pending' | 'gone';

export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          name: string;
          type: CommunityType;
          geofence: unknown | null;
          email_domains: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: CommunityType;
          geofence?: unknown | null;
          email_domains?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['communities']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          name: string;
          community_id: string | null;
          verified: boolean;
          rep_score: number;
          socials: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          community_id?: string | null;
          verified?: boolean;
          rep_score?: number;
          socials?: Json | null;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['users']['Insert'], 'id'>>;
      };
      moves: {
        Row: {
          id: string;
          user_id: string;
          move_date: string;
          direction: MoveDirection;
          status: MoveStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          move_date: string;
          direction: MoveDirection;
          status?: MoveStatus;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['moves']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          community_id: string;
          move_id: string | null;
          title: string;
          description: string | null;
          price_cents: number;
          kind: ListingKind;
          status: ListingStatus;
          category: string | null;
          images: string[];
          available_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_id: string;
          move_id?: string | null;
          title: string;
          description?: string | null;
          price_cents?: number;
          kind: ListingKind;
          status?: ListingStatus;
          category?: string | null;
          images?: string[];
          available_until?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
    Functions: {
      get_my_community_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
  };
}

export type Community = Database['public']['Tables']['communities']['Row'];
export type UserProfile = Database['public']['Tables']['users']['Row'];
export type Move = Database['public']['Tables']['moves']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export type ListingWithSeller = Listing & {
  users: Pick<UserProfile, 'id' | 'name' | 'rep_score'>;
};
