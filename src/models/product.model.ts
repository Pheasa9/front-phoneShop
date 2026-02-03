

export interface Model {
  id: number;
  name: string;
  brand: Brand;
}

export interface Color {
  id: number;
  name: string;
}

export interface Brand {
  id?: number;
  name: string;
  imagePath: string;
}

export interface Product {
  id: number;
  name: string;
  salePrice: number;
  imagePath: string;
  availableUnit: number;
  brand?: Brand; // optional
}
