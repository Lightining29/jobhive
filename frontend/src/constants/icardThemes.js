export const THEME_CATEGORIES = [
  "All",
  "Uploaded Exact Cards",
  "Corporate & Badges",
  "Tech & Gaming",
  "Luxury & Executive",
  "Creative & Design",
  "Minimal & Clean",
  "Nature & Elemental",
  "Retro & Synth"
];

export const GOOGLE_FONTS = [
  { name: "Inter", family: "'Inter', sans-serif", category: "Clean Sans" },
  { name: "Outfit", family: "'Outfit', sans-serif", category: "Clean Modern" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", category: "Modern & Tech" },
  { name: "Montserrat", family: "'Montserrat', sans-serif", category: "Geometric Sans" },
  { name: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif", category: "Modern Sans" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "Editorial Serif" },
  { name: "Cinzel", family: "'Cinzel', serif", category: "Luxury & Serif" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "Monospace Telemetry" },
  { name: "Syne", family: "'Syne', sans-serif", category: "Bold Display" }
];

export const DEFAULT_THEMES = [
  // ================= 7 EXACT MATCH THEMES FROM UPLOADED IMAGES =================
  {
    id: "corporate-diagonal",
    name: "Corporate Blue Diagonal (Image 1)",
    category: "Uploaded Exact Cards",
    layoutType: "corporate-diagonal",
    description: "Exact match to Image 1: Navy top/bottom diagonal wedges, circular portrait, vertical 'IDENTITY CARD' ribbon on back.",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f1f5f9",
      accent: "#0b2545",
      accentSecondary: "#134074",
      highlight: "#00b4d8",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      border: "#cbd5e1",
      cardBg: "#ffffff",
      glowColor: "#00b4d8",
      ribbonBg: "#0b2545",
      ribbonText: "#ffffff",
      badgeBg: "rgba(11, 37, 69, 0.1)",
      badgeText: "#0b2545",
      badgeBorder: "#0b2545"
    },
    typography: {
      titleFont: "Montserrat",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      hasLanyardSlot: false,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "none",
      nfcStyle: "subtle",
      glassmorphism: false
    }
  },
  {
    id: "modern-gold-badge",
    name: "Modern Gold Geometric Badge (Image 2)",
    category: "Uploaded Exact Cards",
    layoutType: "modern-gold-badge",
    description: "Exact match to Image 2: Angular amber gold & navy geometric flags, lanyard slot cutout, rounded photo and front barcode.",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f8fafc",
      accent: "#1e1b4b",
      accentSecondary: "#f59e0b",
      highlight: "#fbbf24",
      textPrimary: "#1e1b4b",
      textSecondary: "#475569",
      border: "#e2e8f0",
      cardBg: "#ffffff",
      glowColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeText: "#1e1b4b",
      badgeBorder: "#f59e0b"
    },
    typography: {
      titleFont: "Inter",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1.25rem",
      borderWidth: "1px",
      hasLanyardSlot: true,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "none",
      nfcStyle: "subtle",
      glassmorphism: false
    }
  },
  {
    id: "fluid-cyan-waves",
    name: "Fluid Cyan Waves (Image 3)",
    category: "Uploaded Exact Cards",
    layoutType: "fluid-cyan-waves",
    description: "Exact match to Image 3: Translucent cyan and royal blue curved waves, circular avatar, front QR code card, back digital signature.",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f0fdfa",
      accent: "#00b4d8",
      accentSecondary: "#0077b6",
      highlight: "#03045e",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      border: "#e2e8f0",
      cardBg: "#ffffff",
      glowColor: "#00b4d8",
      badgeBg: "rgba(0, 180, 216, 0.15)",
      badgeText: "#0077b6",
      badgeBorder: "#00b4d8"
    },
    typography: {
      titleFont: "Montserrat",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      hasLanyardSlot: false,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "none",
      nfcStyle: "subtle",
      glassmorphism: false
    }
  },
  {
    id: "dark-real-estate",
    name: "Dark Midnight Geo & QR (Image 4)",
    category: "Uploaded Exact Cards",
    layoutType: "dark-real-estate",
    description: "Exact match to Image 4: Deep blue/black background with floating chevrons, blue circular avatar halo, massive back QR code.",
    colors: {
      bgPrimary: "#070b19",
      bgSecondary: "#0d1b2a",
      accent: "#2563eb",
      accentSecondary: "#38bdf8",
      highlight: "#60a5fa",
      textPrimary: "#ffffff",
      textSecondary: "#94a3b8",
      border: "#1e293b",
      cardBg: "linear-gradient(180deg, #070b19 0%, #0c1829 100%)",
      glowColor: "#38bdf8",
      badgeBg: "rgba(37, 99, 235, 0.2)",
      badgeText: "#60a5fa",
      badgeBorder: "#2563eb"
    },
    typography: {
      titleFont: "Montserrat",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      hasLanyardSlot: false,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: true,
      chipStyle: "none",
      nfcStyle: "neon",
      glassmorphism: false
    }
  },
  {
    id: "chevron-sidebar",
    name: "Chevron Blue Sidebar (Image 5)",
    category: "Uploaded Exact Cards",
    layoutType: "chevron-sidebar",
    description: "Exact match to Image 5: Left/right vertical blue chevron ribbon with rotated name, square photo frame, blood group, back barcode.",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f8fafc",
      accent: "#0066cc",
      accentSecondary: "#004080",
      highlight: "#0066cc",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      border: "#cbd5e1",
      cardBg: "#ffffff",
      glowColor: "#0066cc",
      badgeBg: "rgba(0, 102, 204, 0.1)",
      badgeText: "#0066cc",
      badgeBorder: "#0066cc"
    },
    typography: {
      titleFont: "Montserrat",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      hasLanyardSlot: false,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "none",
      nfcStyle: "subtle",
      glassmorphism: false
    }
  },
  {
    id: "stylish-blue-curves",
    name: "Stylish Blue Wave Pass (Image 6)",
    category: "Uploaded Exact Cards",
    layoutType: "stylish-blue-curves",
    description: "Exact match to Image 6: Deep navy and sky blue swooping fluid waves, circular avatar, full-width barcode, signature block.",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f0f9ff",
      accent: "#0284c7",
      accentSecondary: "#0c4a6e",
      highlight: "#38bdf8",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      border: "#e2e8f0",
      cardBg: "#ffffff",
      glowColor: "#38bdf8",
      badgeBg: "rgba(2, 132, 199, 0.1)",
      badgeText: "#0284c7",
      badgeBorder: "#0284c7"
    },
    typography: {
      titleFont: "Outfit",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "0.85rem",
      borderWidth: "1px",
      hasLanyardSlot: false,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "none",
      nfcStyle: "subtle",
      glassmorphism: false
    }
  },
  {
    id: "clean-geometric-wedge",
    name: "Clean Navy & Slate Wedge (Image 7)",
    category: "Uploaded Exact Cards",
    layoutType: "clean-geometric-wedge",
    description: "Exact match to Image 7: Deep midnight navy and slate blue top/bottom diagonal wedges, clean square photo, formatted key-values.",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f8fafc",
      accent: "#0b1d3a",
      accentSecondary: "#3b6fb6",
      highlight: "#2563eb",
      textPrimary: "#0b1d3a",
      textSecondary: "#475569",
      border: "#e2e8f0",
      cardBg: "#ffffff",
      glowColor: "#3b6fb6",
      badgeBg: "rgba(11, 29, 58, 0.1)",
      badgeText: "#0b1d3a",
      badgeBorder: "#0b1d3a"
    },
    typography: {
      titleFont: "Montserrat",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1.25rem",
      borderWidth: "1px",
      hasLanyardSlot: false,
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "none",
      nfcStyle: "subtle",
      glassmorphism: false
    }
  },

  // ================= 14 ADDITIONAL RICH SMART & 3D THEMES =================
  {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    category: "Tech & Gaming",
    layoutType: "smart-card",
    description: "High-tech neon cyan & hot magenta accents over midnight telemetry grid.",
    colors: {
      bgPrimary: "#070b19",
      bgSecondary: "#0d1b2a",
      accent: "#00f0ff",
      accentSecondary: "#ff0055",
      textPrimary: "#f8fafc",
      textSecondary: "#94a3b8",
      border: "rgba(0, 240, 255, 0.4)",
      cardBg: "linear-gradient(135deg, #070b19 0%, #111827 50%, #0d1527 100%)",
      glowColor: "#00f0ff",
      badgeBg: "rgba(255, 0, 85, 0.2)",
      badgeText: "#ff0055",
      badgeBorder: "rgba(255, 0, 85, 0.5)"
    },
    background: {
      type: "gradient",
      pattern: "grid",
      overlay: "radial-gradient(circle at 80% 20%, rgba(255, 0, 85, 0.25), transparent 50%), radial-gradient(circle at 20% 80%, rgba(0, 240, 255, 0.25), transparent 50%)"
    },
    typography: {
      titleFont: "Space Grotesk",
      bodyFont: "JetBrains Mono"
    },
    cardStyle: {
      borderRadius: "1rem",
      borderWidth: "1.5px",
      hasHologram: true,
      hasScanlines: true,
      hasGlow: true,
      chipStyle: "neon-cyan",
      nfcStyle: "neon",
      glassmorphism: true,
      shadow: "0 25px 50px -12px rgba(0, 240, 255, 0.25)"
    }
  },
  {
    id: "obsidian-luxe",
    name: "Obsidian Luxe",
    category: "Luxury & Executive",
    layoutType: "smart-card",
    description: "Stealth matte carbon weave texture with brushed 24K gold foil trim.",
    colors: {
      bgPrimary: "#0a0a0a",
      bgSecondary: "#171717",
      accent: "#d4af37",
      accentSecondary: "#f3e5ab",
      textPrimary: "#fdfdfd",
      textSecondary: "#a3a3a3",
      border: "rgba(212, 175, 55, 0.35)",
      cardBg: "linear-gradient(145deg, #141414 0%, #0a0a0a 100%)",
      glowColor: "#d4af37",
      badgeBg: "rgba(212, 175, 55, 0.15)",
      badgeText: "#f3e5ab",
      badgeBorder: "rgba(212, 175, 55, 0.4)"
    },
    background: {
      type: "pattern",
      pattern: "carbon",
      overlay: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 60%)"
    },
    typography: {
      titleFont: "Cinzel",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1.25rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "gold",
      nfcStyle: "gold",
      glassmorphism: false,
      shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
    }
  },
  {
    id: "holographic-prism",
    name: "Holographic Prism",
    category: "Creative & Design",
    layoutType: "smart-card",
    description: "Translucent frosted glass with dynamic iridescent color shift and rainbow sheen.",
    colors: {
      bgPrimary: "#0f172a",
      bgSecondary: "#1e1b4b",
      accent: "#38bdf8",
      accentSecondary: "#c084fc",
      textPrimary: "#ffffff",
      textSecondary: "#cbd5e1",
      border: "rgba(255, 255, 255, 0.3)",
      cardBg: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)",
      glowColor: "#c084fc",
      badgeBg: "rgba(56, 189, 248, 0.2)",
      badgeText: "#bae6fd",
      badgeBorder: "rgba(56, 189, 248, 0.4)"
    },
    background: {
      type: "mesh",
      pattern: "mesh",
      overlay: "linear-gradient(115deg, rgba(255, 0, 128, 0.15), rgba(0, 255, 255, 0.15), rgba(255, 255, 0, 0.15))"
    },
    typography: {
      titleFont: "Syne",
      bodyFont: "Plus Jakarta Sans"
    },
    cardStyle: {
      borderRadius: "1.5rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: true,
      chipStyle: "cyber-holo",
      nfcStyle: "white",
      glassmorphism: true,
      shadow: "0 25px 50px -12px rgba(192, 132, 252, 0.25)"
    }
  },
  {
    id: "swiss-minimalist",
    name: "Swiss Minimalist",
    category: "Minimal & Clean",
    layoutType: "smart-card",
    description: "Iconic modernist typography with structured grid system and stark red accent.",
    colors: {
      bgPrimary: "#f8fafc",
      bgSecondary: "#f1f5f9",
      accent: "#e11d48",
      accentSecondary: "#0f172a",
      textPrimary: "#09090b",
      textSecondary: "#52525b",
      border: "#e4e4e7",
      cardBg: "linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)",
      glowColor: "#e11d48",
      badgeBg: "#09090b",
      badgeText: "#ffffff",
      badgeBorder: "#09090b"
    },
    background: {
      type: "solid",
      pattern: "dots",
      overlay: "radial-gradient(#d4d4d8 1px, transparent 1px)"
    },
    typography: {
      titleFont: "Inter",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "0.5rem",
      borderWidth: "2px",
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "black",
      nfcStyle: "subtle",
      glassmorphism: false,
      shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
    }
  },
  {
    id: "vintage-synthwave",
    name: "Vintage Synthwave 80s",
    category: "Retro & Synth",
    layoutType: "smart-card",
    description: "Neon magenta sunset horizon, retro perspective grid, and chrome styling.",
    colors: {
      bgPrimary: "#1a0b2e",
      bgSecondary: "#2b0938",
      accent: "#ff2a85",
      accentSecondary: "#00f0ff",
      textPrimary: "#fff0f8",
      textSecondary: "#d8b4e2",
      border: "rgba(255, 42, 133, 0.5)",
      cardBg: "linear-gradient(180deg, #180929 0%, #2f0e47 60%, #511261 100%)",
      glowColor: "#ff2a85",
      badgeBg: "rgba(255, 42, 133, 0.25)",
      badgeText: "#ff90cf",
      badgeBorder: "rgba(255, 42, 133, 0.6)"
    },
    background: {
      type: "gradient",
      pattern: "waves",
      overlay: "linear-gradient(0deg, rgba(255, 42, 133, 0.3) 0%, transparent 60%)"
    },
    typography: {
      titleFont: "Outfit",
      bodyFont: "Space Grotesk"
    },
    cardStyle: {
      borderRadius: "1rem",
      borderWidth: "1.5px",
      hasHologram: true,
      hasScanlines: true,
      hasGlow: true,
      chipStyle: "neon-cyan",
      nfcStyle: "neon",
      glassmorphism: false,
      shadow: "0 25px 50px -12px rgba(255, 42, 133, 0.35)"
    }
  },
  {
    id: "executive-gold",
    name: "Executive Royal Navy",
    category: "Luxury & Executive",
    layoutType: "smart-card",
    description: "Deep Prussian navy velvet with opulent polished gold trim and gold seal.",
    colors: {
      bgPrimary: "#071328",
      bgSecondary: "#0f2347",
      accent: "#e5b85c",
      accentSecondary: "#fad586",
      textPrimary: "#fdf8ee",
      textSecondary: "#cbd5e1",
      border: "rgba(229, 184, 92, 0.4)",
      cardBg: "linear-gradient(135deg, #071328 0%, #0d1e3d 50%, #050d1a 100%)",
      glowColor: "#e5b85c",
      badgeBg: "rgba(229, 184, 92, 0.15)",
      badgeText: "#fad586",
      badgeBorder: "rgba(229, 184, 92, 0.5)"
    },
    background: {
      type: "gradient",
      pattern: "circuit",
      overlay: "radial-gradient(circle at 100% 0%, rgba(229, 184, 92, 0.2), transparent 50%)"
    },
    typography: {
      titleFont: "Playfair Display",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "gold",
      nfcStyle: "gold",
      glassmorphism: false,
      shadow: "0 25px 50px -12px rgba(7, 19, 40, 0.8)"
    }
  },
  {
    id: "tokyo-sakura",
    name: "Tokyo Sakura",
    category: "Creative & Design",
    layoutType: "smart-card",
    description: "Soft cherry blossom pastels, clean Japanese minimalist aesthetics & blush glow.",
    colors: {
      bgPrimary: "#180f1d",
      bgSecondary: "#2b1433",
      accent: "#f472b6",
      accentSecondary: "#fda4af",
      textPrimary: "#fff1f2",
      textSecondary: "#e2e8f0",
      border: "rgba(244, 114, 182, 0.35)",
      cardBg: "linear-gradient(135deg, #180f1d 0%, #2b1335 50%, #15091a 100%)",
      glowColor: "#f472b6",
      badgeBg: "rgba(244, 114, 182, 0.2)",
      badgeText: "#fbcfe8",
      badgeBorder: "rgba(244, 114, 182, 0.4)"
    },
    background: {
      type: "mesh",
      pattern: "dots",
      overlay: "radial-gradient(circle at 20% 30%, rgba(244, 114, 182, 0.3), transparent 60%)"
    },
    typography: {
      titleFont: "Outfit",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1.25rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: true,
      chipStyle: "silver",
      nfcStyle: "white",
      glassmorphism: true,
      shadow: "0 25px 50px -12px rgba(244, 114, 182, 0.2)"
    }
  },
  {
    id: "terminal-matrix",
    name: "Terminal / Hacker Matrix",
    category: "Tech & Gaming",
    layoutType: "smart-card",
    description: "Phosphor terminal green on pure CRT black with ASCII borders and command prompt.",
    colors: {
      bgPrimary: "#030a05",
      bgSecondary: "#06170b",
      accent: "#00ff66",
      accentSecondary: "#22c55e",
      textPrimary: "#e2fee6",
      textSecondary: "#86efac",
      border: "rgba(0, 255, 102, 0.4)",
      cardBg: "linear-gradient(180deg, #030a05 0%, #06150b 100%)",
      glowColor: "#00ff66",
      badgeBg: "rgba(0, 255, 102, 0.15)",
      badgeText: "#00ff66",
      badgeBorder: "rgba(0, 255, 102, 0.5)"
    },
    background: {
      type: "pattern",
      pattern: "grid",
      overlay: "linear-gradient(rgba(0, 255, 102, 0.05) 1px, transparent 1px)"
    },
    typography: {
      titleFont: "JetBrains Mono",
      bodyFont: "JetBrains Mono"
    },
    cardStyle: {
      borderRadius: "0.35rem",
      borderWidth: "1.5px",
      hasHologram: false,
      hasScanlines: true,
      hasGlow: true,
      chipStyle: "neon-cyan",
      nfcStyle: "neon",
      glassmorphism: false,
      shadow: "0 20px 40px -10px rgba(0, 255, 102, 0.25)"
    }
  },
  {
    id: "aurora-borealis",
    name: "Aurora Borealis",
    category: "Nature & Elemental",
    layoutType: "smart-card",
    description: "Luminescent northern arctic lights sweeping across deep starry polar sky.",
    colors: {
      bgPrimary: "#021526",
      bgSecondary: "#03346e",
      accent: "#2dd4bf",
      accentSecondary: "#a78bfa",
      textPrimary: "#f0fdfa",
      textSecondary: "#99f6e4",
      border: "rgba(45, 212, 191, 0.35)",
      cardBg: "linear-gradient(135deg, #021526 0%, #082f49 50%, #0f172a 100%)",
      glowColor: "#2dd4bf",
      badgeBg: "rgba(45, 212, 191, 0.2)",
      badgeText: "#ccfbf1",
      badgeBorder: "rgba(45, 212, 191, 0.5)"
    },
    background: {
      type: "mesh",
      pattern: "waves",
      overlay: "radial-gradient(circle at 70% 30%, rgba(45, 212, 191, 0.3), transparent 60%), radial-gradient(circle at 20% 80%, rgba(167, 139, 250, 0.25), transparent 50%)"
    },
    typography: {
      titleFont: "Syne",
      bodyFont: "Plus Jakarta Sans"
    },
    cardStyle: {
      borderRadius: "1.25rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: true,
      chipStyle: "silver",
      nfcStyle: "neon",
      glassmorphism: true,
      shadow: "0 25px 50px -12px rgba(45, 212, 191, 0.25)"
    }
  },
  {
    id: "brutalist-monolith",
    name: "Brutalist Monolith",
    category: "Minimal & Clean",
    layoutType: "smart-card",
    description: "Raw architectural concrete, heavy industrial stark borders & bold black typography.",
    colors: {
      bgPrimary: "#e2e8f0",
      bgSecondary: "#cbd5e1",
      accent: "#000000",
      accentSecondary: "#2563eb",
      textPrimary: "#020617",
      textSecondary: "#334155",
      border: "#000000",
      cardBg: "#e2e8f0",
      glowColor: "#000000",
      badgeBg: "#000000",
      badgeText: "#ffffff",
      badgeBorder: "#000000"
    },
    background: {
      type: "solid",
      pattern: "grid",
      overlay: "none"
    },
    typography: {
      titleFont: "Space Grotesk",
      bodyFont: "JetBrains Mono"
    },
    cardStyle: {
      borderRadius: "0px",
      borderWidth: "3px",
      hasHologram: false,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "black",
      nfcStyle: "subtle",
      glassmorphism: false,
      shadow: "8px 8px 0px #000000"
    }
  },
  {
    id: "fintech-titanium",
    name: "Fintech Titanium Card",
    category: "Corporate & Badges",
    layoutType: "smart-card",
    description: "Brushed aeronautical titanium metal texture, silver bevels & banking chip emblem.",
    colors: {
      bgPrimary: "#1e293b",
      bgSecondary: "#334155",
      accent: "#38bdf8",
      accentSecondary: "#94a3b8",
      textPrimary: "#f8fafc",
      textSecondary: "#cbd5e1",
      border: "rgba(226, 232, 240, 0.25)",
      cardBg: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)",
      glowColor: "#38bdf8",
      badgeBg: "rgba(56, 189, 248, 0.15)",
      badgeText: "#bae6fd",
      badgeBorder: "rgba(56, 189, 248, 0.4)"
    },
    background: {
      type: "pattern",
      pattern: "carbon",
      overlay: "linear-gradient(105deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%)"
    },
    typography: {
      titleFont: "Inter",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "silver",
      nfcStyle: "white",
      glassmorphism: false,
      shadow: "0 25px 50px -12px rgba(15, 23, 42, 0.8)"
    }
  },
  {
    id: "marble-rose-gold",
    name: "Marble & Rose Gold",
    category: "Luxury & Executive",
    layoutType: "smart-card",
    description: "Pure Italian Carrara marble veining combined with shimmering rose gold accents.",
    colors: {
      bgPrimary: "#120e16",
      bgSecondary: "#231826",
      accent: "#fb7185",
      accentSecondary: "#fbcfe8",
      textPrimary: "#fff1f2",
      textSecondary: "#f1f5f9",
      border: "rgba(251, 113, 133, 0.35)",
      cardBg: "linear-gradient(140deg, #1a1220 0%, #28172b 50%, #100b14 100%)",
      glowColor: "#fb7185",
      badgeBg: "rgba(251, 113, 133, 0.2)",
      badgeText: "#ffe4e6",
      badgeBorder: "rgba(251, 113, 133, 0.5)"
    },
    background: {
      type: "mesh",
      pattern: "waves",
      overlay: "radial-gradient(circle at 80% 20%, rgba(251, 113, 133, 0.25), transparent 50%)"
    },
    typography: {
      titleFont: "Cinzel",
      bodyFont: "Outfit"
    },
    cardStyle: {
      borderRadius: "1.25rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "gold",
      nfcStyle: "gold",
      glassmorphism: true,
      shadow: "0 25px 50px -12px rgba(251, 113, 133, 0.25)"
    }
  },
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula",
    category: "Creative & Design",
    layoutType: "smart-card",
    description: "Interstellar deep purple nebula dust, radiant starlight glow and orbit rings.",
    colors: {
      bgPrimary: "#09041a",
      bgSecondary: "#1a0b36",
      accent: "#a855f7",
      accentSecondary: "#ec4899",
      textPrimary: "#faf5ff",
      textSecondary: "#e9d5ff",
      border: "rgba(168, 85, 247, 0.4)",
      cardBg: "linear-gradient(135deg, #09041a 0%, #1e0938 50%, #110524 100%)",
      glowColor: "#a855f7",
      badgeBg: "rgba(168, 85, 247, 0.2)",
      badgeText: "#f3e8ff",
      badgeBorder: "rgba(168, 85, 247, 0.5)"
    },
    background: {
      type: "mesh",
      pattern: "dots",
      overlay: "radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.35), transparent 60%), radial-gradient(circle at 75% 85%, rgba(236, 72, 153, 0.3), transparent 60%)"
    },
    typography: {
      titleFont: "Syne",
      bodyFont: "Plus Jakarta Sans"
    },
    cardStyle: {
      borderRadius: "1.5rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: true,
      chipStyle: "cyber-holo",
      nfcStyle: "neon",
      glassmorphism: true,
      shadow: "0 25px 50px -12px rgba(168, 85, 247, 0.3)"
    }
  },
  {
    id: "bio-botanical",
    name: "Bio-Botanical Emerald",
    category: "Nature & Elemental",
    layoutType: "smart-card",
    description: "Lush deep forest emerald green, organic leaf watermark textures and eco-luxury gold.",
    colors: {
      bgPrimary: "#041c14",
      bgSecondary: "#083325",
      accent: "#10b981",
      accentSecondary: "#d4af37",
      textPrimary: "#ecfdf5",
      textSecondary: "#a7f3d0",
      border: "rgba(16, 185, 129, 0.35)",
      cardBg: "linear-gradient(135deg, #041c14 0%, #0b3d2c 50%, #03140e 100%)",
      glowColor: "#10b981",
      badgeBg: "rgba(16, 185, 129, 0.2)",
      badgeText: "#d1fae5",
      badgeBorder: "rgba(16, 185, 129, 0.5)"
    },
    background: {
      type: "gradient",
      pattern: "waves",
      overlay: "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.25), transparent 60%)"
    },
    typography: {
      titleFont: "Playfair Display",
      bodyFont: "Inter"
    },
    cardStyle: {
      borderRadius: "1rem",
      borderWidth: "1px",
      hasHologram: true,
      hasScanlines: false,
      hasGlow: false,
      chipStyle: "gold",
      nfcStyle: "gold",
      glassmorphism: false,
      shadow: "0 25px 50px -12px rgba(4, 28, 20, 0.8)"
    }
  }
];

export const INITIAL_CARD_DATA = {
  title: "Christian Martin — Graphic Designer",
  cardType: "business",
  orientation: "vertical",
  layoutType: "corporate-diagonal",
  personal: {
    fullName: "CHRISTIAN MARTIN",
    gender: "Male",
    dob: "01-10-21",
    jobTitle: "GRAPHIC DESIGNER",
    organization: "Appletree Infotech",
    department: "CREATIVE LABS",
    idNumber: "1234567890",
    validUntil: "01-01-2024",
    issueDate: "01-01-2024",
    expiryDate: "01-01-2024",
    bloodGroup: "AB+",
    emergencyContact: "+91 98765 43210",
    bio: "Passionate designer and developer working on high-quality web, mobile, and print digital assets.",
    termsAndConditions: [
      "This card is the property of Appletree Infotech and must be returned upon request.",
      "Holder must visibly wear this badge at all times on corporate facilities.",
      "Scan genuine QR code on back for instant cryptographic validation.",
      "Loss or theft of this card must be reported immediately."
    ],
    directorName: "Authorized Signatory",
    signatureText: "Authorized Signatory",
    tagline: "INNOVATING THE FUTURE",
    skills: ["Branding", "Vector UI", "Print Design", "Identity"]
  },
  media: {
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    avatarType: "image",
    logoUrl: "",
    signatureUrl: "/assets/signature.png",
    coverBannerUrl: ""
  },
  contact: {
    email: "info@appletreeinfotech.in",
    phone: "7503962162",
    website: "www.appletreeinfotech.in",
    location: "C-60 R.K Tower 3rd Floor Above PizzaKart RDC Rajnagar,Ghaziabad.",
    address: "C-60 R.K Tower 3rd Floor Above PizzaKart RDC Rajnagar,Ghaziabad."
  },
  socials: {
    github: "christian-martin",
    linkedin: "christian-martin",
    twitter: "cmartin_design",
    instagram: "cmartin_id",
    telegram: "cmartin",
    discord: "cmartin#1234",
    customLink: "https://coreldrawdesign.com",
    customLabel: "CorelDraw Design"
  },
  security: {
    barcodeNumber: "1234567890432",
    hasSecurityChip: false,
    hasNfcSymbol: true,
    hasHologramStamp: false,
    hasMagneticStripe: false,
    hasSignatureStrip: true,
    badgeLabel: "ID NO:1234567890",
    badgeType: "verified"
  },
  theme: {
    themeId: "corporate-diagonal",
    isCustom: false,
    customConfig: null
  },
  qrSettings: {
    targetType: "vcard",
    customUrl: "",
    fgColor: "#0b2545",
    bgColor: "transparent",
    includeMargin: false,
    level: "M"
  },
  analytics: {
    views: 84,
    qrScans: 42,
    vcardDownloads: 29
  }
};
