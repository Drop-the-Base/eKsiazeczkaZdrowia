// Nazwy grup ATC (WHO) po polsku – poziom 1 i najczęstsze grupy poziomu 2. Same nazwy, bez ocen.

const LEVEL1: Record<string, string> = {
  A: 'Przewód pokarmowy i metabolizm',
  B: 'Krew i układ krwiotwórczy',
  C: 'Układ sercowo-naczyniowy',
  D: 'Dermatologia',
  G: 'Układ moczowo-płciowy i hormony płciowe',
  H: 'Hormony do stosowania ogólnego',
  J: 'Leki przeciwinfekcyjne',
  L: 'Leki przeciwnowotworowe i immunomodulujące',
  M: 'Układ mięśniowo-szkieletowy',
  N: 'Ośrodkowy układ nerwowy',
  P: 'Leki przeciwpasożytnicze',
  R: 'Układ oddechowy',
  S: 'Narządy zmysłów',
  V: 'Różne',
};

const LEVEL2: Record<string, string> = {
  A02: 'Leki na nadkwaśność',
  A10: 'Leki stosowane w cukrzycy',
  A11: 'Witaminy',
  A12: 'Składniki mineralne',
  B01: 'Leki przeciwzakrzepowe',
  B03: 'Leki przeciwanemiczne',
  C03: 'Leki moczopędne',
  C07: 'Beta-blokery',
  C08: 'Antagoniści wapnia',
  C09: 'Leki działające na układ renina-angiotensyna',
  C10: 'Leki zmniejszające stężenie lipidów',
  H02: 'Kortykosteroidy do stosowania ogólnego',
  H03: 'Leki stosowane w chorobach tarczycy',
  J01: 'Antybiotyki do stosowania ogólnego',
  L01: 'Leki przeciwnowotworowe',
  L04: 'Leki immunosupresyjne',
  M01: 'Leki przeciwzapalne i przeciwreumatyczne',
  N02: 'Leki przeciwbólowe',
  N05: 'Leki psycholeptyczne',
  N06: 'Leki psychoanaleptyczne',
  R03: 'Leki stosowane w obturacyjnych chorobach dróg oddechowych',
  R06: 'Leki przeciwhistaminowe do stosowania ogólnego',
};

/** Najdokładniejsza znana nazwa grupy dla kodu ATC (poziom 2, inaczej 1). */
export function atcGroupName(atc: string): string | undefined {
  const code = atc.trim().toUpperCase();
  return LEVEL2[code.slice(0, 3)] ?? LEVEL1[code.slice(0, 1)];
}
