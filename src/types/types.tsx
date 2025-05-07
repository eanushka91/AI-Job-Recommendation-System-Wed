export interface JobRecommendation {
  id?: number | string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date_posted?: string | Date;
  content?: string;
  salary?: string;
  match_score: number;
}

export interface PaginatedJobRecommendations {
  items: JobRecommendation[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UserProfile {
  cv?: File;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  location?: string;
  user_id?: number;
  resume_id?: number;
}

export interface Experience {
  jobTitle: string;
  company: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface Education {
  degree: string;
  institution: string;
  graduationDate?: string;
}

// This is the response from the initial profile submission
export interface ApiResponse {
  message: string;
  url: string; // CV URL
  user_id: number;
  resume_id: number;
  job_recommendations_initial: PaginatedJobRecommendations;
}

// Response type for loading more recommendations specifically
export interface LoadMoreApiResponse {
    resume_id?: number;
    location?: string;
    query?: string;
    recommendations?: PaginatedJobRecommendations; // Expected from /api/recommendations/{resume_id}
    jobs?: PaginatedJobRecommendations; // If a different endpoint like /search-jobs was used
}