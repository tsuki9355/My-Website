export type PageId = "home" | "projects" | "experience";
export type ProjectCategory = "game-jam" | "personal" | "assets";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  link?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  tags: string[];
}

export interface Track {
  id: string;
  title: string;
  youtubeId: string;
}
