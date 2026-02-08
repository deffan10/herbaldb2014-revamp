// User & Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  institution?: string;
  whatsapp?: string;
  avatar_url?: string;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: 'admin' | 'verifier' | 'contributor';
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  token_type?: string;
  requires_approval?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  institution?: string;
  role_requested: 'contributor' | 'verifier';
  verification_document?: File;
  motivation?: string;
}

// Species Types
export interface Species {
  id: number;
  species_code: string;
  scientific_name: string;
  variety?: string;
  family?: string;
  discoverer?: string;
  description?: string;
  description_en?: string;
  photo?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  created_by: number;
  verified_by?: number;
  reference_id?: number;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  local_names?: LocalName[];
  aliases?: SpeciesAlias[];
  virtues?: Virtue[];
  compounds?: Compound[];
  reference?: Reference;
  creator?: User;
  verifier?: User;
  // Count fields from withCount
  compounds_count?: number;
  local_names_count?: number;
  virtues_count?: number;
}

export interface LocalName {
  id: number;
  species_id: number;
  name: string;
  language: string;
  region?: string;
  status: string;
  created_by: number;
}

export interface SpeciesAlias {
  id: number;
  species_id: number;
  alias_name: string;
  reference_id?: number;
  reference?: Reference;
}

export interface Virtue {
  id: number;
  species_id: number;
  plant_part_id?: number;
  virtue_type?: string; // Changed from usage_type
  description: string;
  description_en?: string;
  description_latin?: string;
  medical_term?: string;
  reference_id?: number;
  status: string;
  plant_part?: PlantPart;
  plantPart?: PlantPart; // Alias for API response compatibility
  reference?: Reference;
}

// Compound Types
export interface Compound {
  id: number;
  name: string;
  knapsack_id?: string;
  metabolite_id?: string;
  pubchem_id?: string;
  cas_number?: string;
  molecular_formula?: string;
  molecular_weight?: number;
  smiles?: string;
  inchi?: string;
  inchi_key?: string;
  compound_group_id?: number;
  mol_file_path?: string;
  mol2_file_path?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  verification_notes?: string;
  created_by: number;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
  group?: CompoundGroup;
  compound_group?: CompoundGroup; // Alias for API response compatibility
  species?: Species[];
  creator?: User;
  verifier?: User;
  // Count fields from withCount
  species_count?: number;
}

export interface CompoundGroup {
  id: number;
  code?: string;
  name: string;
  name_en?: string;
}

// Supporting Types
export interface PlantPart {
  id: number;
  code?: string;
  name: string;
  name_en?: string;
}

export interface Reference {
  id: number;
  source_name: string;
  authors?: string;
  year?: number;
  type?: string;
  url?: string;
}

// Article Types
export interface Article {
  id: number;
  title: string;
  slug: string;
  body_html: string;
  featured_image_path: string;
  featured_image_url?: string;
  published_at?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface ArticleAd {
  id: number;
  title?: string | null;
  image_path: string;
  image_url?: string;
  target_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArticlePayload {
  title: string;
  body_html: string;
  featured_image_path: string;
  published_at?: string | null;
}

// Contribution Types
export interface Contribution {
  id: number;
  user_id: number;
  contributable_type: string;
  contributable_id: number;
  action: 'create' | 'update' | 'delete';
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id?: number;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  user?: User;
  reviewer?: User;
}

// API Response Types
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
  // Optional meta wrapper (some APIs return this format)
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Institution Type (for registration)
export interface Institution {
  id: string;
  name: string;
  country: string;
  type: string;
}

// Search Types
export interface SearchParams {
  search?: string;
  family?: string;
  status?: string;
  compound_group_id?: number;
  page?: number;
  per_page?: number;
}

// Form Types
export interface SpeciesFormData {
  species_code: string;
  scientific_name: string;
  variety?: string;
  family?: string;
  discoverer?: string;
  description?: string;
  description_en?: string;
  reference_id?: number;
  local_names?: { name: string; language: string; region?: string }[];
  virtues?: { description: string; plant_part_id?: number; reference_id?: number }[];
}

export interface CompoundFormData {
  name: string;
  knapsack_id?: string;
  pubchem_id?: string;
  compound_group_id?: number;
  mol_file?: File;
}
