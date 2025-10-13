export const categoryIcon: Record<string, string> = {
  AI: "🤖",
  Web: "💻",
  IOS: "📱",
  Android: "📱", // or just 📱 if you want to keep it simple
  SaaS: "☁️",
  Games: "🎮",
  Design: "🎨",
};

export const SCREENSHOT_UPLOAD_LIMIT = 5;

export const metaDataForSteps: Record<
  number,
  { label: string; coverUrl: string }
> = {
  1: {
    label: "URL",
    coverUrl:
      "https://res.cloudinary.com/dh9x227hi/image/upload/v1759862222/domain-names_ppkckn.svg", // Desk setup with planning materials
  },
  2: {
    label: "Project Details",
    coverUrl:
      "https://res.cloudinary.com/dh9x227hi/image/upload/v1759861929/ideas_mauekx.svg", // Notebook, laptop and planning documents
  },
  3: {
    label: "Screenshots",
    coverUrl:
      "https://res.cloudinary.com/dh9x227hi/image/upload/v1759862006/startup-marketing_pg0c10.svg", // Cloud upload concept
  },
};

export const DEFAULT_PROJECT_LOGO =
  "https://res.cloudinary.com/dh9x227hi/image/upload/v1759931503/app-box-svgrepo-com_3_jot94c.svg";
