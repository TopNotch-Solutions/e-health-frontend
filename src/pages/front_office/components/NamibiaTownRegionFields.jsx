import { useMemo } from 'react';
import {
  getAllRegions,
  getRegionForTown,
  getTownOptions,
  normalizeRegionId,
} from '../data/namibiaLocations';
import { fo } from '../styles/frontOfficeModuleClasses';

export default function NamibiaTownRegionFields({
  city,
  region,
  onChange,
  cityId = 'fo-city',
  regionId = 'fo-region',
}) {
  const selectedRegionId = useMemo(() => normalizeRegionId(region), [region]);
  const townOptions = useMemo(
    () => getTownOptions({ regionId: selectedRegionId, currentTown: city }),
    [selectedRegionId, city]
  );

  function handleTownChange(nextTown) {
    const matchedRegion = getRegionForTown(nextTown);
    onChange({
      city: nextTown,
      region: matchedRegion?.id || selectedRegionId,
    });
  }

  function handleRegionChange(nextRegionId) {
    const next = { region: nextRegionId };
    if (city) {
      const townRegion = getRegionForTown(city);
      if (!nextRegionId || townRegion?.id !== nextRegionId) {
        next.city = '';
      }
    }
    onChange(next);
  }

  return (
    <div className={`${fo.fieldRow} mt-4`}>
      <p className={fo.field}>
        <label className={fo.label} htmlFor={cityId}>
          Town / city
        </label>
        <select
          id={cityId}
          className={fo.select}
          value={city}
          onChange={(e) => handleTownChange(e.target.value)}
        >
          <option value="">
            {selectedRegionId ? 'Select town' : 'Select town (or choose a region first)'}
          </option>
          {townOptions.map((town) => (
            <option key={town} value={town}>
              {town}
            </option>
          ))}
        </select>
      </p>
      <p className={fo.field}>
        <label className={fo.label} htmlFor={regionId}>
          Region
        </label>
        <select
          id={regionId}
          className={fo.select}
          value={selectedRegionId}
          onChange={(e) => handleRegionChange(e.target.value)}
        >
          <option value="">Select region</option>
          {getAllRegions().map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </p>
    </div>
  );
}
