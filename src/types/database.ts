
export type AppRole = "buyer" | "supplier" | "admin";

export interface Organization {
  id: string;
  name: string;
  country: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  tax_id: string | null;
  logo_url: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  full_name: string;
  position: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Request {
  id: string;
  organization_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: "open" | "matching" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  request_id: string;
  supplier_org_id: string;
  supplier_profile_id: string | null;
  message: string | null;
  price_estimate: number | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface Message {
  id: string;
  request_id: string;
  sender_profile_id: string;
  content: string;
  created_at: string;
}
