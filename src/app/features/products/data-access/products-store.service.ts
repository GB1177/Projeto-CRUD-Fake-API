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
  private readonly currentPageState = signal(1);
  private readonly pageSizeState = signal(10);
  private readonly productsLoadedState = signal(false);

  readonly products = this.productsState.asReadonly();
  readonly categories = this.categoriesState.asReadonly();
  readonly selectedProduct = this.selectedProductState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly deleting = this.deletingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly searchTerm = this.searchTermState.asReadonly();
  readonly selectedCategory = this.selectedCategoryState.asReadonly();
  readonly currentPage = this.currentPageState.asReadonly();
  readonly pageSize = this.pageSizeState.asReadonly();
  readonly productsLoaded = this.productsLoadedState.asReadonly();

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

  readonly searchSuggestions = computed(() => {
    const searchTerm = this.searchTermState().trim().toLowerCase();

    if (searchTerm.length === 0) {
      return [];
    }

    const seenTitles = new Set<string>();
    const suggestions: string[] = [];

    for (const product of this.productsState()) {
      const titleKey = product.title.trim().toLowerCase();

      if (
        titleKey.includes(searchTerm) &&
        !seenTitles.has(titleKey)
      ) {
        seenTitles.add(titleKey);
        suggestions.push(product.title);
      }

      if (suggestions.length === 5) {
        break;
      }
    }

    return suggestions;
  });

  readonly totalProducts = computed(() => this.filteredProducts().length);
  readonly totalFilteredProducts = computed(() => this.filteredProducts().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalFilteredProducts() / this.pageSizeState())),
  );
  readonly paginatedProducts = computed(() => {
    const startIndex = (this.currentPageState() - 1) * this.pageSizeState();
    const endIndex = startIndex + this.pageSizeState();

    return this.filteredProducts().slice(startIndex, endIndex);
  });
  readonly hasPreviousPage = computed(() => this.currentPageState() > 1);
  readonly hasNextPage = computed(
    () => this.currentPageState() < this.totalPages(),
  );
  readonly hasProducts = computed(() => this.productsState().length > 0);
  readonly isEmpty = computed(
    () => !this.loadingState() && this.filteredProducts().length === 0,
  );

  loadProducts(forceRefresh = false): void {
    if (this.productsLoadedState() && !forceRefresh) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set(null);

    this.productsApi
      .getProducts()
      .pipe(
        tap((products) => {
          this.productsState.set(products);
          this.productsLoadedState.set(true);
        }),
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
    const localProduct = this.productsState().find((product) => product.id === id);

    if (localProduct) {
      this.selectedProductState.set(localProduct);
      this.errorState.set(null);
      return;
    }

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
    this.resetPagination();
  }

  setSelectedCategory(category: string): void {
    this.selectedCategoryState.set(category);
    this.resetPagination();
  }

  clearFilters(): void {
    this.searchTermState.set('');
    this.selectedCategoryState.set('');
    this.resetPagination();
  }

  setCurrentPage(page: number): void {
    this.currentPageState.set(this.normalizePage(page));
  }

  nextPage(): void {
    this.setCurrentPage(this.currentPageState() + 1);
  }

  previousPage(): void {
    this.setCurrentPage(this.currentPageState() - 1);
  }

  setPageSize(size: number): void {
    this.pageSizeState.set(Math.max(1, Math.floor(size)));
    this.resetPagination();
  }

  resetPagination(): void {
    this.currentPageState.set(1);
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    this.savingState.set(true);
    this.errorState.set(null);

    return this.productsApi.createProduct(payload).pipe(
      tap((createdProduct) => {
        this.productsState.update((products) => [
          ...products,
          this.resolveCreatedProductId(createdProduct, products),
        ]);
        this.productsLoadedState.set(true);
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
        this.productsLoadedState.set(true);
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
        this.productsLoadedState.set(true);
        this.currentPageState.set(this.normalizePage(this.currentPageState()));
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

  private normalizePage(page: number): number {
    if (!Number.isFinite(page)) {
      return 1;
    }

    return Math.min(Math.max(1, Math.floor(page)), this.totalPages());
  }

  private resolveCreatedProductId(
    createdProduct: Product,
    products: readonly Product[],
  ): Product {
    const idAlreadyExists = products.some(
      (product) => product.id === createdProduct.id,
    );

    if (!idAlreadyExists) {
      return createdProduct;
    }

    const nextId =
      products.reduce((highestId, product) => Math.max(highestId, product.id), 0) +
      1;

    return {
      ...createdProduct,
      id: nextId,
    };
  }
}
