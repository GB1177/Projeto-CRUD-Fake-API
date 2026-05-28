import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, vi, type Mock } from 'vitest';

import { Product } from '@core/models/product.model';

import { ProductsStoreService } from '../../data-access/products-store.service';
import { ProductListPageComponent } from './product-list-page.component';

type ProductsStoreMock = {
  readonly products: WritableSignal<Product[]>;
  readonly categories: WritableSignal<string[]>;
  readonly selectedProduct: WritableSignal<Product | null>;
  readonly loading: WritableSignal<boolean>;
  readonly saving: WritableSignal<boolean>;
  readonly deleting: WritableSignal<boolean>;
  readonly error: WritableSignal<string | null>;
  readonly searchTerm: WritableSignal<string>;
  readonly selectedCategory: WritableSignal<string>;
  readonly searchSuggestions: WritableSignal<string[]>;
  readonly filteredProducts: WritableSignal<Product[]>;
  readonly paginatedProducts: WritableSignal<Product[]>;
  readonly hasProducts: WritableSignal<boolean>;
  readonly isEmpty: WritableSignal<boolean>;
  readonly totalProducts: WritableSignal<number>;
  readonly totalFilteredProducts: WritableSignal<number>;
  readonly currentPage: WritableSignal<number>;
  readonly pageSize: WritableSignal<number>;
  readonly totalPages: WritableSignal<number>;
  readonly hasPreviousPage: WritableSignal<boolean>;
  readonly hasNextPage: WritableSignal<boolean>;
  readonly loadProducts: Mock<(forceRefresh?: boolean) => void>;
  readonly loadCategories: Mock<() => void>;
  readonly loadProductById: Mock<(id: number) => void>;
  readonly setSearchTerm: Mock<(term: string) => void>;
  readonly setSelectedCategory: Mock<(category: string) => void>;
  readonly clearFilters: Mock<() => void>;
  readonly setCurrentPage: Mock<(page: number) => void>;
  readonly nextPage: Mock<() => void>;
  readonly previousPage: Mock<() => void>;
  readonly setPageSize: Mock<(size: number) => void>;
  readonly resetPagination: Mock<() => void>;
  readonly clearSelectedProduct: Mock<() => void>;
  readonly clearError: Mock<() => void>;
};

describe('ProductListPageComponent', () => {
  let fixture: ComponentFixture<ProductListPageComponent>;
  let store: ProductsStoreMock;
  let router: { readonly navigate: Mock<Router['navigate']> };

  const product: Product = {
    id: 1,
    title: 'Slim Shirt',
    price: 49.9,
    description: 'Cotton shirt.',
    category: 'mens clothing',
    image: 'https://example.com/shirt.png',
    rating: {
      rate: 4.4,
      count: 12,
    },
  };

  beforeEach(async () => {
    store = createStoreMock();
    router = {
      navigate: vi.fn<Router['navigate']>().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ProductListPageComponent],
      providers: [
        {
          provide: ProductsStoreService,
          useValue: store,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should load products and categories on init', () => {
    createComponent();

    expect(store.loadProducts).toHaveBeenCalledOnce();
    expect(store.loadCategories).toHaveBeenCalledOnce();
  });

  it('should render loading state', () => {
    store.loading.set(true);

    createComponent();

    expect(query('[data-testid="loading-state"]')).not.toBeNull();
  });

  it('should render error state', () => {
    store.error.set('Não foi possível carregar os produtos.');

    createComponent();

    expect(query('[data-testid="error-state-message"]')?.textContent).toContain(
      'Não foi possível carregar os produtos.',
    );

    click('[data-testid="error-state-action"]');

    expect(store.loadProducts).toHaveBeenCalledTimes(2);
    expect(store.loadProducts).toHaveBeenLastCalledWith(true);
  });

  it('should navigate to create page when new product is clicked', () => {
    createComponent();

    click('[data-testid="new-product-button"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products', 'new']);
  });

  it('should update filters through the filters component', async () => {
    vi.useFakeTimers();
    store.categories.set(['mens clothing']);

    createComponent();

    setInputValue('[data-testid="product-search-input"]', 'shirt');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    setSelectValue('[data-testid="product-category-select"]', 'mens clothing');

    expect(store.setSearchTerm).toHaveBeenCalledWith('shirt');
    expect(store.setSelectedCategory).toHaveBeenCalledWith('mens clothing');
  });

  it('should clear filters', () => {
    createComponent();

    click('[data-testid="clear-filters-button"]');

    expect(store.clearFilters).toHaveBeenCalledOnce();
  });

  it('should navigate to product details from card action', () => {
    arrangeProducts();

    createComponent();
    click('[data-testid="view-product-button"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products', product.id]);
  });

  it('should connect pagination actions to the store', () => {
    arrangeProducts();
    store.totalPages.set(2);
    store.hasNextPage.set(true);

    createComponent();
    click('[data-testid="pagination-next"]');
    click('[data-testid="pagination-page-2"]');

    expect(store.nextPage).toHaveBeenCalledOnce();
    expect(store.setCurrentPage).toHaveBeenCalledWith(2);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ProductListPageComponent);
    fixture.detectChanges();
  }

  function arrangeProducts(): void {
    store.products.set([product]);
    store.filteredProducts.set([product]);
    store.paginatedProducts.set([product]);
    store.hasProducts.set(true);
    store.isEmpty.set(false);
    store.totalProducts.set(1);
    store.totalFilteredProducts.set(1);
  }

  function query(selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  function click(selector: string): void {
    const element = query(selector);

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    element.click();
    fixture.detectChanges();
  }

  function setInputValue(selector: string, value: string): void {
    const input = query(selector) as HTMLInputElement | null;

    if (!input) {
      throw new Error(`Input not found: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function setSelectValue(selector: string, value: string): void {
    const select = query(selector) as HTMLSelectElement | null;

    if (!select) {
      throw new Error(`Select not found: ${selector}`);
    }

    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }
});

function createStoreMock(): ProductsStoreMock {
  return {
    products: signal<Product[]>([]),
    categories: signal<string[]>([]),
    selectedProduct: signal<Product | null>(null),
    loading: signal(false),
    saving: signal(false),
    deleting: signal(false),
    error: signal<string | null>(null),
    searchTerm: signal(''),
    selectedCategory: signal(''),
    searchSuggestions: signal<string[]>([]),
    filteredProducts: signal<Product[]>([]),
    paginatedProducts: signal<Product[]>([]),
    hasProducts: signal(false),
    isEmpty: signal(true),
    totalProducts: signal(0),
    totalFilteredProducts: signal(0),
    currentPage: signal(1),
    pageSize: signal(10),
    totalPages: signal(1),
    hasPreviousPage: signal(false),
    hasNextPage: signal(false),
    loadProducts: vi.fn<(forceRefresh?: boolean) => void>(),
    loadCategories: vi.fn<() => void>(),
    loadProductById: vi.fn<(id: number) => void>(),
    setSearchTerm: vi.fn<(term: string) => void>(),
    setSelectedCategory: vi.fn<(category: string) => void>(),
    clearFilters: vi.fn<() => void>(),
    setCurrentPage: vi.fn<(page: number) => void>(),
    nextPage: vi.fn<() => void>(),
    previousPage: vi.fn<() => void>(),
    setPageSize: vi.fn<(size: number) => void>(),
    resetPagination: vi.fn<() => void>(),
    clearSelectedProduct: vi.fn<() => void>(),
    clearError: vi.fn<() => void>(),
  };
}
