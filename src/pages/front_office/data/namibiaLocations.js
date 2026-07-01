/** Namibia regions and towns for front office address capture. */

export const NAMIBIA_REGIONS = [
  {
    id: 'erongo',
    name: 'Erongo',
    towns: ['Arandis', 'Henties Bay', 'Karibib', 'Omaruru', 'Swakopmund', 'Usakos', 'Walvis Bay'],
  },
  {
    id: 'hardap',
    name: 'Hardap',
    towns: ['Aranos', 'Gibeon', 'Kalkrand', 'Maltahöhe', 'Mariental', 'Rehoboth', 'Stampriet'],
  },
  {
    id: 'karas',
    name: '//Karas',
    towns: [
      'Ariamsvlei',
      'Bethanie',
      'Grünau',
      'Karasburg',
      'Keetmanshoop',
      'Lüderitz',
      'Oranjemund',
      'Tses',
      'Warmbad',
    ],
  },
  {
    id: 'kavango-east',
    name: 'Kavango East',
    towns: ['Divundu', 'Mashare', 'Mukwe', 'Ndiyona', 'Rundu', 'Shambyu'],
  },
  {
    id: 'kavango-west',
    name: 'Kavango West',
    towns: ['Mpungu', 'Nkurenkuru', 'Tondoro'],
  },
  {
    id: 'khomas',
    name: 'Khomas',
    towns: ['Windhoek'],
  },
  {
    id: 'kunene',
    name: 'Kunene',
    towns: ['Bergsig', 'Kamanjab', 'Khorixas', 'Opuwo', 'Outjo', 'Ruacana', 'Sesfontein'],
  },
  {
    id: 'ohangwena',
    name: 'Ohangwena',
    towns: ['Eenhana', 'Endola', 'Helao Nafidi', 'Ohangwena', 'Ondobe', 'Oshikango'],
  },
  {
    id: 'omaheke',
    name: 'Omaheke',
    towns: ['Aminuis', 'Epukiro', 'Gobabis', 'Leonardville', 'Otjinene', 'Talismanus'],
  },
  {
    id: 'omusati',
    name: 'Omusati',
    towns: ['Elim', 'Etilyasa', 'Ogongo', 'Okahao', 'Oshikuku', 'Outapi', 'Tsandi'],
  },
  {
    id: 'oshana',
    name: 'Oshana',
    towns: ['Ehenye', 'Okaku', 'Okatana', 'Ondangwa', 'Ongwediva', 'Oshakati', 'Uukwiyu'],
  },
  {
    id: 'oshikoto',
    name: 'Oshikoto',
    towns: ['Olukondo', 'Omuthiya', 'Onayena', 'Oniipa', 'Tsumeb'],
  },
  {
    id: 'otjozondjupa',
    name: 'Otjozondjupa',
    towns: ['Grootfontein', 'Kombat', 'Okahandja', 'Okakarara', 'Otavi', 'Otjiwarongo'],
  },
  {
    id: 'zambezi',
    name: 'Zambezi',
    towns: ['Bagani', 'Bukalo', 'Impalila', 'Katima Mulilo', 'Kongola', 'Linyanti', 'Ngoma', 'Sibinda'],
  },
];

const regionById = new Map(NAMIBIA_REGIONS.map((region) => [region.id, region]));
const regionByName = new Map(NAMIBIA_REGIONS.map((region) => [region.name.toLowerCase(), region]));
const townToRegion = new Map();

for (const region of NAMIBIA_REGIONS) {
  for (const town of region.towns) {
    townToRegion.set(town.toLowerCase(), region);
  }
}

const LEGACY_REGION_IDS = {
  khomas: 'khomas',
  erongo: 'erongo',
  other: '',
};

/** Normalize stored region values (legacy slugs or display names) to a region id. */
export function normalizeRegionId(value) {
  if (!value) return '';
  const legacy = LEGACY_REGION_IDS[String(value).toLowerCase()];
  if (legacy !== undefined) return legacy;
  const byId = regionById.get(String(value).toLowerCase());
  if (byId) return byId.id;
  const byName = regionByName.get(String(value).toLowerCase());
  return byName?.id || '';
}

export function getRegionById(regionId) {
  return regionById.get(regionId) || null;
}

export function getRegionForTown(townName) {
  if (!townName) return null;
  return townToRegion.get(String(townName).trim().toLowerCase()) || null;
}

export function getAllRegions() {
  return NAMIBIA_REGIONS;
}

export function getAllTowns() {
  return NAMIBIA_REGIONS.flatMap((region) => region.towns).sort((a, b) => a.localeCompare(b));
}

export function getTownsForRegion(regionId) {
  const region = getRegionById(regionId);
  return region ? [...region.towns].sort((a, b) => a.localeCompare(b)) : [];
}

export function getTownOptions({ regionId, currentTown = '' }) {
  const towns = regionId ? getTownsForRegion(regionId) : getAllTowns();
  if (currentTown && !towns.some((town) => town.toLowerCase() === currentTown.toLowerCase())) {
    return [currentTown, ...towns];
  }
  return towns;
}
