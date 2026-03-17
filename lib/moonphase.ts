export interface MoonPhase {
  name: string;
  emoji: string;
  meaning: string;
  toneModifier: string;
  illumination: number; // 0-1
}

// Known new moon: January 6, 2000 at 18:14 UTC
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z");
const LUNAR_CYCLE_DAYS = 29.53058770576;

function getDaysSinceNewMoon(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const daysSince = getDaysSinceNewMoon(date);
  const illumination = Math.abs(
    Math.cos(((daysSince / LUNAR_CYCLE_DAYS) * 2 * Math.PI) - Math.PI)
  ) * 0.5 + 0.5;

  // Determine phase from cycle position
  const phaseProgress = daysSince / LUNAR_CYCLE_DAYS;

  if (phaseProgress < 0.03 || phaseProgress >= 0.97) {
    return {
      name: "New Moon",
      emoji: "🌑",
      meaning:
        "A time of beginnings. The veil between worlds is thin. Intentions planted now take root in the unseen.",
      toneModifier:
        "Tonight is a portal of new beginnings. What you name in the dark will bloom into light.",
      illumination,
    };
  } else if (phaseProgress < 0.25) {
    return {
      name: "Waxing Crescent",
      emoji: "🌒",
      meaning:
        "The light grows. Your intentions are taking their first breaths. Trust the momentum building beneath the surface.",
      toneModifier:
        "The crescent light is gathering, and so is your momentum. Honor what is growing.",
      illumination,
    };
  } else if (phaseProgress < 0.28) {
    return {
      name: "First Quarter",
      emoji: "🌓",
      meaning:
        "A moment of tension and decision. Half illuminated, half in shadow. Action is called for now.",
      toneModifier:
        "You stand at the half-lit threshold. The quarter moon asks you to choose and commit.",
      illumination,
    };
  } else if (phaseProgress < 0.47) {
    return {
      name: "Waxing Gibbous",
      emoji: "🌔",
      meaning:
        "Refinement. The fullness approaches. Review, adjust, and continue building toward your vision.",
      toneModifier:
        "The light is nearly full and so is your capacity. Refine what you have started.",
      illumination,
    };
  } else if (phaseProgress < 0.53) {
    return {
      name: "Full Moon",
      emoji: "🌕",
      meaning:
        "Culmination. The peak of energy, emotion, and illumination. What has been hidden is now revealed. Celebrate completions.",
      toneModifier:
        "The full moon pours its silver light upon all things. Tonight, nothing remains hidden.",
      illumination,
    };
  } else if (phaseProgress < 0.72) {
    return {
      name: "Waning Gibbous",
      emoji: "🌖",
      meaning:
        "Gratitude and release. The harvest time. Share what you have gathered. Let go of what no longer serves.",
      toneModifier:
        "The moon releases its fullness gracefully. The energy tonight invites release and surrender.",
      illumination,
    };
  } else if (phaseProgress < 0.75) {
    return {
      name: "Last Quarter",
      emoji: "🌗",
      meaning:
        "Reflection and forgiveness. Stand in the balance between what was and what will be. Release old patterns.",
      toneModifier:
        "The last quarter asks you to forgive what needs forgiving and release what is complete.",
      illumination,
    };
  } else {
    return {
      name: "Waning Crescent",
      emoji: "🌘",
      meaning:
        "Rest and surrender. The cycle nears its end. Retreat, dream, and prepare for the next new beginning.",
      toneModifier:
        "The waning crescent is the breath before the silence. Rest is sacred right now.",
      illumination,
    };
  }
}

export function isHighEnergyMoon(date: Date = new Date()): boolean {
  const phase = getMoonPhase(date);
  return phase.name === "Full Moon" || phase.name === "New Moon";
}
