import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiEndpoints } from '@core/api/api-endpoints';
import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(apiEndpoints.products.base);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(apiEndpoints.products.productById(id));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(apiEndpoints.products.categories);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      apiEndpoints.products.productsByCategory(category),
    );
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(apiEndpoints.products.base, payload);
  }

  updateProduct(id: number, payload: UpdateProductPayload): Observable<Product> {
    return this.http.put<Product>(apiEndpoints.products.productById(id), payload);
  }

  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(apiEndpoints.products.productById(id));
  }
}
