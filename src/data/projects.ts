import type { Project, ProjectCategory } from "../types";

export const projectCategories: { id: ProjectCategory; label: string }[] = [
  { id: "game-jam", label: "Game Jam / Hackathon" },
  { id: "personal", label: "Personal Project" },
  { id: "assets", label: "3D Model / 2D Assets" },
];

export const projects: Project[] = [
  {
    id: "unity-Topdown-GMTK-2026",
    title: "Pawn Escape",
    description:
      "Game created in 96 hours for the GMTK 2026 game jam featuring the theme 'Countdown'.",
    category: "game-jam",
    tags: ["Unity", "C#", "BFS", "State-Machine", "Event-Driven UI"],
    link: "https://tsuki-0505.itch.io/pawn-escape",
  },
  {
    id: "portfolio-site",
    title: "My Personal Website",
    description:
      "The site you're looking at right now — React + TypeScript, hand-styled, with a game mode in progress.",
    category: "personal",
    tags: ["React", "TypeScript", "CSS", "Blender", "Clip Studio Paint"],
    link: "https://github.com",
  },
  {
    id: "Lumi",
    title: "Lumi the Forgotten Moon (WIP)",
    description: "A hollow knight inspired 2D platformer game.",
    category: "personal",
    tags: [
      "Unity",
      "C#",
      "OOP",
      "FSM",
      "SRP",
      "DSA",
      "Queue",
      "Clip Studio Paint Pro",
    ],
    link: "https://github.com/tsuki9355/Lumi-and-the-Forgotten-Moon",
  },
  {
    id: "Kenney 2026 Game jam",
    title: "Guess the Weight",
    description:
      "Game created in 48 hours for the Kenney 2026 game jam featuring the theme 'Scale'.",
    category: "game-jam",
    tags: ["Unity", "C#", "Physics", "Event-Driven UI"],
    link: "https://tsuki-0505.itch.io/guess-the-weight",
  },
  {
    id: "blender-diorama",
    title: "Cozy Diorama (WIP)",
    description:
      "3D room assets being modeled in Blender for the site's upcoming Game Mode.",
    category: "assets",
    tags: ["Blender", "3D Art"],
  },
];
