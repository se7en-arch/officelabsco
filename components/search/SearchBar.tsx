'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CityDropdown from './CityDropdown';
import TypeDropdown from './TypeDropdown';
import PriceDropdown from './PriceDropdown';
import { SearchIcon } from '@/components/icons';

interface Props {
  className?: string;
}

export default function SearchBar({ className = '' }: Props) {
  const router = useRouter();
  const [city, setCity]         = useState('');
  const [propType, setPropType] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  function handleSearch() {
    const params = new URLSearchParams();
    if (city)     params.set('location', city);
    if (propType) params.set('type', propType);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className={`srch ${className}`.trim()}>
      <CityDropdown value={city} onChange={setCity} />
      <TypeDropdown value={propType} onChange={setPropType} />
      <PriceDropdown priceMin={priceMin} priceMax={priceMax} onChangeMin={setPriceMin} onChangeMax={setPriceMax} />
      <button className="srch__go" aria-label="Търси" onClick={handleSearch}>
        <SearchIcon />
      </button>
    </div>
  );
}
