import type { Project, ProjectCategory } from "../types";

export const projectCategories: { id: ProjectCategory; label: string }[] = [
  { id: "game-jam", label: "Game Jam / Hackathon" },
  { id: "personal", label: "Personal Project" },
  { id: "assets", label: "3D Model / 2D Assets" },
];

// Ordered by relevance: the projects page renders them in this order.
export const projects: Project[] = [
  {
    id: "expense-tracker",
    title: "Expense Tracker",
    description:
      "Full-stack expense tracker with a React + TypeScript frontend and a layered Spring Boot REST API, backed by MySQL on AWS and covered by 18 automated tests.",
    category: "personal",
    tags: ["Java", "Spring Boot", "React", "TypeScript", "MySQL", "AWS", "JUnit"],
    image: "/projects/expense-tracker.jpg",
    links: [{ kind: "github", href: "https://github.com/tsuki9355/Personal-Expense-Tracker" }],
  },
  {
    id: "pawn-escape",
    title: "Pawn Escape",
    description:
      "Turn-based grid puzzle game made in 96 hours for GMTK Game Jam 2026 (theme: 'Countdown'), with BFS movement, an FSM-driven turn system and multi-system undo.",
    category: "game-jam",
    tags: ["Unity", "C#", "BFS", "State Machine", "Event-Driven UI"],
    image: "/projects/pawn-escape.jpg",
    links: [
      { kind: "itch", href: "https://tsuki-0505.itch.io/pawn-escape" },
      { kind: "github", href: "https://github.com/tsuki9355/Pawn-Escape" },
    ],
  },
  {
    id: "vyxxen",
    title: "Vyxxen",
    description:
      "Zaxxon-inspired isometric shooter built in Unreal Engine 5 and C++ for Vertex School's AI Game Development Boot Camp, with an earlier browser prototype in Three.js.",
    category: "personal",
    tags: ["Unreal Engine 5", "C++", "Actor Components", "Three.js", "Agentic Workflow"],
    image: "/projects/vyxxen.jpg",
    links: [
      { kind: "github", label: "UE5 Source", href: "https://github.com/tsuki9355/Vyxxen_UE" },
      { kind: "github", label: "Three.js Prototype", href: "https://github.com/tsuki9355/Vyxxen_Prototype" },
    ],
  },
  {
    id: "protocol-zero",
    title: "Protocol Zero",
    description:
      "Top-down sci-fi arena survival shooter in Unreal Engine 5 and C++. Player movement, aiming and health systems are built with automated tests; enemy waves are next.",
    category: "personal",
    tags: ["Unreal Engine 5", "C++", "Component Design", "Automation Tests"],
    inProgress: true,
    links: [{ kind: "github", href: "https://github.com/tsuki9355/Protocol_Zero" }],
  },
  {
    id: "mini-dungeon-adventure",
    title: "Mini Dungeon Adventure",
    description:
      "Turn-based text dungeon crawler in C++ with level-scaled enemy encounters using weighted random selection, enum-driven item effects and a persistent leaderboard.",
    category: "personal",
    tags: ["C++", "STL", "OOP", "Visual Studio"],
    links: [{ kind: "github", href: "https://github.com/tsuki9355/Mini-Dungeon-Adventure" }],
  },
  {
    id: "portfolio-site",
    title: "My Personal Website",
    description:
      "The site you're on: React 19 + TypeScript with Vite, a custom YouTube-powered music player and hand-drawn art, with a game mode in progress.",
    category: "personal",
    tags: ["React", "TypeScript", "Vite", "CSS", "Clip Studio Paint"],
    image: "/projects/personal-website.jpg",
    links: [
      { kind: "live", href: "https://angus-personal-website.vercel.app/" },
      { kind: "github", href: "https://github.com/tsuki9355/My-Website" },
    ],
  },
  {
    id: "zoo-manager",
    title: "Zoo Manager",
    description:
      "Java zoo management sim with 12+ features, an object-oriented domain model shared across Swing and console interfaces, JSON save/load and 73 JUnit tests.",
    category: "personal",
    tags: ["Java", "Swing", "JUnit", "JSON"],
    links: [{ kind: "github", href: "https://github.com/tsuki9355/Zoo-Manager" }],
  },
  {
    id: "guess-the-weight",
    title: "Guess the Weight",
    description:
      "Game created in 48 hours for Kenney Jam 2026 featuring the theme 'Scale'.",
    category: "game-jam",
    tags: ["Unity", "C#", "Physics", "Event-Driven UI"],
    image: "/projects/guess-the-weight.jpg",
    links: [
      { kind: "itch", href: "https://tsuki-0505.itch.io/guess-the-weight" },
      { kind: "github", href: "https://github.com/tsuki9355/Guess-The-Weight-Kenney-Jam-2026-" },
    ],
  },
  {
    id: "blender-diorama",
    title: "Cozy Diorama",
    description:
      "3D room assets being modeled in Blender for the site's upcoming Game Mode.",
    category: "assets",
    tags: ["Blender", "3D Art"],
    inProgress: true,
  },
  {
    id: "lumi",
    title: "Lumi the Forgotten Moon",
    description: "A Hollow Knight-inspired 2D platformer.",
    category: "personal",
    tags: ["Unity", "C#", "OOP", "FSM", "SRP", "DSA", "Queue", "Clip Studio Paint Pro"],
    image: "/projects/lumi.jpg",
    links: [{ kind: "github", href: "https://github.com/tsuki9355/Lumi-and-the-Forgotten-Moon" }],
  },
];
