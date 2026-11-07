export const colors = {
  paper: "#faf8f4",
  paperDeep: "#f3efe6",
  card: "#fffdf8",
  ink: "#23271f",
  inkSoft: "#454a40",
  muted: "#797d72",
  pine: "#20382f",
  pineDeep: "#16271f",
  pineSoft: "#e5ece6",
  sand: "#efe7d6",
  sandDeep: "#e1d3b8",
  border: "#e4ded1",
  white: "#fffdf8",
  danger: "#9c4037",
  dangerSoft: "#f7e7e4",
  gold: "#b08343",
} as const;

export const fonts = {
  serif: "InstrumentSerif_400Regular",
  serifItalic: "InstrumentSerif_400Regular_Italic",
  sans: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const layout = {
  screen: 20,
  gap: 12,
} as const;

export const shadowSoft = {
  shadowColor: "#20382f",
  shadowOpacity: 0.06,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
} as const;

export const shadowLift = {
  shadowColor: "#16271f",
  shadowOpacity: 0.12,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 14 },
  elevation: 5,
} as const;
