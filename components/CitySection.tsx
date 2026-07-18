import type { City } from '@/types';
import PropertyCard from './PropertyCard';
import { ArrowRightIcon } from './icons';

interface Props {
  city: City;
}

export default function CitySection({ city }: Props) {
  return (
    <section className="city">
      <div className="city__hd">
        <h2>Популярни имоти в град {city.name}</h2>
        <span className="city__arr">
          <ArrowRightIcon />
        </span>
      </div>
      <div className="grid">
        {city.props.map((property, i) => (
          <PropertyCard key={`${city.name}-${i}`} property={property} />
        ))}
      </div>
    </section>
  );
}
