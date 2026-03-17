// Master numbers are preserved without reduction
const MASTER_NUMBERS = new Set([11, 22, 33]);

function sumDigits(n: number): number {
  return String(Math.abs(n))
    .split("")
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
}

function reduceToSingleOrMaster(n: number): number {
  if (n <= 9 || MASTER_NUMBERS.has(n)) return n;
  const reduced = sumDigits(n);
  return reduceToSingleOrMaster(reduced);
}

/**
 * Calculates the Life Path Number from a birth date.
 * Master numbers (11, 22, 33) are preserved.
 */
export function getLifePathNumber(birthDate: Date): number {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();

  const reducedMonth = reduceToSingleOrMaster(month);
  const reducedDay = reduceToSingleOrMaster(day);
  const reducedYear = reduceToSingleOrMaster(sumDigits(year));

  const total = reducedMonth + reducedDay + reducedYear;
  return reduceToSingleOrMaster(total);
}

/**
 * Returns the spiritual meaning of a Life Path Number.
 */
export function getLifePathMeaning(lifePathNumber: number): string {
  const meanings: Record<number, string> = {
    1: "The Leader — Pioneer, independent, original",
    2: "The Diplomat — Sensitive, cooperative, empathic",
    3: "The Creative — Expressive, joyful, communicative",
    4: "The Builder — Practical, disciplined, trustworthy",
    5: "The Freedom Seeker — Adventurous, versatile, curious",
    6: "The Nurturer — Responsible, loving, service-oriented",
    7: "The Seeker — Analytical, spiritual, introspective",
    8: "The Achiever — Ambitious, powerful, material mastery",
    9: "The Humanitarian — Compassionate, generous, visionary",
    11: "The Intuitive — Master of spiritual illumination",
    22: "The Master Builder — Turning dreams into reality",
    33: "The Master Teacher — Pure love and divine guidance",
  };

  return meanings[lifePathNumber] ?? "The Mystic — Beyond ordinary numbering";
}

/**
 * Calculates a simple soul urge number from vowels in a name.
 * A=1, E=5, I=9, O=6, U=3
 */
export function getSoulUrgeNumber(name: string): number {
  const vowelValues: Record<string, number> = {
    a: 1, e: 5, i: 9, o: 6, u: 3,
  };

  const total = name
    .toLowerCase()
    .split("")
    .reduce((sum, char) => sum + (vowelValues[char] ?? 0), 0);

  return reduceToSingleOrMaster(total);
}
