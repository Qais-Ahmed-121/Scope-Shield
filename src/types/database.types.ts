export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          subscription_tier: 'free' | 'pro'
          stripe_customer_id: string | null
          total_value_protected: number
        }
        Insert: {
          id: string
          created_at?: string
          subscription_tier?: 'free' | 'pro'
          stripe_customer_id?: string | null
          total_value_protected?: number
        }
        Update: {
          id?: string
          created_at?: string
          subscription_tier?: 'free' | 'pro'
          stripe_customer_id?: string | null
          total_value_protected?: number
        }
      }
      contracts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          content_text: string | null
          risk_score: number | null
          status: 'pending' | 'analyzed' | 'failed'
          file_url: string | null
          total_value: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          content_text?: string | null
          risk_score?: number | null
          status?: 'pending' | 'analyzed' | 'failed'
          file_url?: string | null
          total_value?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          content_text?: string | null
          risk_score?: number | null
          status?: 'pending' | 'analyzed' | 'failed'
          file_url?: string | null
          total_value?: number
        }
      }
      extracted_tasks: {
        Row: {
          id: string
          created_at: string
          contract_id: string
          title: string
          description: string | null
          due_date: string | null
          status: 'pending' | 'completed'
          is_payment_milestone: boolean
          amount: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          contract_id: string
          title: string
          description?: string | null
          due_date?: string | null
          status?: 'pending' | 'completed'
          is_payment_milestone?: boolean
          amount?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          contract_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          status?: 'pending' | 'completed'
          is_payment_milestone?: boolean
          amount?: number | null
        }
      }
      risk_alerts: {
        Row: {
          id: string
          created_at: string
          contract_id: string
          risk_type: 'red_flag' | 'warning' | 'info'
          clause_text: string
          explanation: string
          suggestion: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          contract_id: string
          risk_type: 'red_flag' | 'warning' | 'info'
          clause_text: string
          explanation: string
          suggestion?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          contract_id?: string
          risk_type?: 'red_flag' | 'warning' | 'info'
          clause_text?: string
          explanation?: string
          suggestion?: string | null
        }
      }
    }
  }
}
