export interface UserProfile {
  cv?: File;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  location?: string;
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

export interface ApiResponse {
  message: string;
  url: string;
  user_id: number;
  resume_id: number;
  job_recommendations: JobRecommendation[];
}