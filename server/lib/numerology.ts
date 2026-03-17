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

export function getLifePathNumber(birthDate: Date): number {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();

  const reducedMonth = reduceToSingleOrMaster(month);
  const reducedDay = reduceToSingleOrMaster(day);
  const reducedYear = reduceToSingleOrMaster(sumDigits(year));

  const total = reducedMonth + reducedDay + reducedYear;
  return reduceToSingleOrMaster(total);
}
