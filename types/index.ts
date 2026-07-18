export interface Property {
  type: string;
  desc: string;
  price: number;
  img: string;
}

export interface City {
  name: string;
  props: Property[];
}
