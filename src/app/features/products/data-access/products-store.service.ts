import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize, Observable, tap, throwError } from 'rxjs';

import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@core/models/product.model';

import { ProductsApiService } from './products-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsStoreService {
  private readonly productsApi = inject(ProductsApiService);

  private readonly productsState = signal<Product[]>([]);
  private readonly categoriesState = signal<string[]>([]);
  private readonly selectedProductState = signal<Product | null>(null);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly deletingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly searchTermState = signal('');
  private readonly selectedCategoryState = signal('');

  readonly products = this.productsState.asReadonly();
  readonly categories = this.categoriesState.asReadonly();
  readonly selectedProduct = this.selectedProductState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly deleting = this.deletingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly searchTerm = this.searchTermState.asReadonly();
  readonly selectedCategory = this.selectedCategoryState.asReadonly();

  readonly filteredProducts = computed(() => {
    const searchTerm = this.searchTermState().trim().toLowerCase();
    const selectedCategory = this.selectedCategoryState().trim().toLowerCase();

    return this.productsState().filter((product) => {
      const matchesSearch =
        searchTerm.length === 0 ||
        product.title.toLowerCase().includes(searchTerm);
      const matchesCategory =
        selectedCategory.length === 0 ||
        product.category.toLowerCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  });

  readonly totalProducts = computed(() => this.filteredProducts().length);
  readonly hasProducts = computed(() => this.productsState().length > 0);
  readonly isEmpty = computed(
    () => !this.loadingState() && this.filteredProducts().length === 0,
  );

  loadProducts(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.productsApi
      .getProducts()
      .pipe(
        tap((products) => this.productsState.set(products)),
        catchError(() => {
          this.errorState.set('Não foi possível carregar os produtos.');
          return EMPTY;
        }),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe();
  }

  loadCategories(): void {
    this.productsApi
      .getCategories()
      .pipe(
        tap((categories) => this.categoriesState.set(categories)),
        catchError(() => {
          this.errorState.set('Não foi possível carregar as categorias.');
          return EMPTY;
        }),
      )
      .subscribe();
  }

  loadProductById(id: number): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.productsApi
      .getProductById(id)
      .pipe(
        tap((product) => this.selectedProductState.set(product)),
        catchError(() => {
          this.errorState.set('Não foi possível carregar o produto.');
          return EMPTY;
        }),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe();
  }

  setSearchTerm(term: string): void {
    this.searchTermState.set(term);
  }

  setSelectedCategory(category: string): void {
    this.selectedCategoryState.set(category);
  }

  clearFilters(): void {
    this.searchTermState.set('');
    this.selectedCategoryState.set('');
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    this.savingState.set(true);
    this.errorState.set(null);

    return this.productsApi.createProduct(payload).pipe(
      tap((createdProduct) => {
        this.productsState.update((products) => [...products, createdProduct]);
      }),
      catchError((error: unknown) => {
        this.errorState.set('Não foi possível criar o produto.');
        return throwError(() => error);
      }),
      finalize(() => this.savingState.set(false)),
    );
  }

  updateProduct(id: number, payload: UpdateProductPayload): Observable<Product> {
    this.savingState.set(true);
    this.errorState.set(null);

    return this.productsApi.updateProduct(id, payload).pipe(
      tap((updatedProduct) => {
        this.productsState.update((products) =>
          products.map((product) =>
            product.id === id ? updatedProduct : product,
          ),
        );
        this.selectedProductState.update((product) =>
          product?.id === id ? updatedProduct : product,
        );
      }),
      catchError((error: unknown) => {
        this.errorState.set('Não foi possível atualizar o produto.');
        return throwError(() => error);
      }),
      finalize(() => this.savingState.set(false)),
    );
  }

  deleteProduct(id: number): Observable<Product> {
    this.deletingState.set(true);
    this.errorState.set(null);

    return this.productsApi.deleteProduct(id).pipe(
      tap(() => {
        this.productsState.update((products) =>
          products.filter((product) => product.id !== id),
        );
        this.selectedProductState.update((product) =>
          product?.id === id ? null : product,
        );
      }),
      catchError((error: unknown) => {
        this.errorState.set('Não foi possível excluir o produto.');
        return throwError(() => error);
      }),
      finalize(() => this.deletingState.set(false)),
    );
  }

  clearSelectedProduct(): void {
    this.selectedProductState.set(null);
  }

  clearError(): void {
    this.errorState.set(null);
  }
}
