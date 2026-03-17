// Shared moon phase logic for the server
export interface MoonPhase {
  name: string;
  emoji: string;
  meaning: string;
  toneModifier: string;
  illumination: number;
}

const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z");
const LUNAR_CYCLE_DAYS = 29.53058770576;

function getDaysSinceNewMoon(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const daysSince = getDaysSinceNewMoon(date);
  const illumination =
    Math.abs(Math.cos(((daysSince / LUNAR_CYCLE_DAYS) * 2 * Math.PI) - Math.PI)) * 0.5 + 0.5;
  const phaseProgress = daysSince / LUNAR_CYCLE_DAYS;

  if (phaseProgress < 0.03 || phaseProgress >= 0.97) {
    return {
      name: "New Moon",
      emoji: "🌑",
      meaning: "A time of beginnings. The veil between worlds is thin. Intentions planted now take root in the unseen.",
      toneModifier: "Tonight is a portal of new beginnings. What you name in the dark will bloom into light.",
      illumination,
    };
  } else if (phaseProgress < 0.25) {
    return {
      name: "Waxing Crescent",
      emoji: "🌒",
      meaning: "The light grows. Your intentions are taking their first breaths.",
      toneModifier: "The crescent light is gathering, and so is your momentum. Honor what is growing.",
      illumination,
    };
  } else if (phaseProgress < 0.28) {
    return {
      name: "First Quarter",
      emoji: "🌓",
      meaning: "A moment of tension and decision. Action is called for now.",
      toneModifier: "You stand at the half-lit threshold. The quarter moon asks you to choose and commit.",
      illumination,
    };
  } else if (phaseProgress < 0.47) {
    return {
      name: "Waxing Gibbous",
      emoji: "🌔",
      meaning: "Refinement. The fullness approaches. Adjust and continue building.",
      toneModifier: "The light is nearly full and so is your capacity. Refine what you have started.",
      illumination,
    };
  } else if (phaseProgress < 0.53) {
    return {
      name: "Full Moon",
      emoji: "🌕",
      meaning: "Culmination. The peak of energy, emotion, and illumination.",
      toneModifier: "The full moon pours its silver light upon all things. Tonight, nothing remains hidden.",
      illumination,
    };
  } else if (phaseProgress < 0.72) {
    return {
      name: "Waning Gibbous",
      emoji: "🌖",
      meaning: "Gratitude and release. Share what you have gathered.",
      toneModifier: "The energy tonight invites release and surrender.",
      illumination,
    };
  } else if (phaseProgress < 0.75) {
    return {
      name: "Last Quarter",
      emoji: "🌗",
      meaning: "Reflection and forgiveness. Release old patterns.",
      toneModifier: "The last quarter asks you to forgive what needs forgiving.",
      illumination,
    };
  } else {
    return {
      name: "Waning Crescent",
      emoji: "🌘",
      meaning: "Rest and surrender. Retreat, dream, and prepare.",
      toneModifier: "The waning crescent is the breath before the silence. Rest is sacred right now.",
      illumination,
    };
  }
}

export function isHighEnergyMoon(date: Date = new Date()): boolean {
  const phase = getMoonPhase(date);
  return phase.name === "Full Moon" || phase.name === "New Moon";
}
