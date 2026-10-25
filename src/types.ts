export type PageId = "home" | "projects" | "experience";
export type ProjectCategory = "game-jam" | "personal" | "assets";

export type ProjectLinkKind = "github" | "itch" | "live";

export interface ProjectLink {
  kind: ProjectLinkKind;
  href: string;
  label?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  image?: string;
  links?: ProjectLink[];
  inProgress?: boolean;
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
