import { environment } from '../../../environments/environment';

const productsPath = '/products';

export const apiEndpoints = {
  products: {
    base: `${environment.apiBaseUrl}${productsPath}`,
    productById: (id: number) => `${environment.apiBaseUrl}${productsPath}/${id}`,
    categories: `${environment.apiBaseUrl}${productsPath}/categories`,
    productsByCategory: (category: string) =>
      `${environment.apiBaseUrl}${productsPath}/category/${encodeURIComponent(category)}`,
  },
} as const;
