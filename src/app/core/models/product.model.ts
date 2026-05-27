export interface ProductRating {
  readonly rate: number;
  readonly count: number;
}

export interface Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly category: string;
  readonly description: string;
  readonly image: string;
  readonly rating?: ProductRating;
}

export interface CreateProductPayload {
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly category: string;
  readonly image: string;
}

export type UpdateProductPayload = CreateProductPayload;
