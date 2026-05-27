import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, type Mock } from 'vitest';

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
  readonly filteredProducts: WritableSignal<Product[]>;
  readonly hasProducts: WritableSignal<boolean>;
  readonly isEmpty: WritableSignal<boolean>;
  readonly totalProducts: WritableSignal<number>;
  readonly loadProducts: Mock<() => void>;
  readonly loadCategories: Mock<() => void>;
  readonly loadProductById: Mock<(id: number) => void>;
  readonly setSearchTerm: Mock<(term: string) => void>;
  readonly setSelectedCategory: Mock<(category: string) => void>;
  readonly clearFilters: Mock<() => void>;
  readonly deleteProduct: Mock<(id: number) => ReturnType<ProductsStoreService['deleteProduct']>>;
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
  });

  it('should navigate to create page when new product is clicked', () => {
    createComponent();

    click('[data-testid="new-product-button"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products', 'new']);
  });

  it('should update filters through the filters component', () => {
    store.categories.set(['mens clothing']);

    createComponent();

    setInputValue('[data-testid="product-search-input"]', 'shirt');
    setSelectValue('[data-testid="product-category-select"]', 'mens clothing');

    expect(store.setSearchTerm).toHaveBeenCalledWith('shirt');
    expect(store.setSelectedCategory).toHaveBeenCalledWith('mens clothing');
  });

  it('should clear filters', () => {
    createComponent();

    click('[data-testid="clear-filters-button"]');

    expect(store.clearFilters).toHaveBeenCalledOnce();
  });

  it('should open confirmation when delete is clicked', () => {
    arrangeProducts();

    createComponent();
    click('[data-testid="delete-product-button"]');
    fixture.detectChanges();

    expect(query('[data-testid="confirm-dialog"]')).not.toBeNull();
    expect(query('[data-testid="confirm-dialog-message"]')?.textContent).toContain(
      product.title,
    );
  });

  it('should delete product after confirmation', () => {
    arrangeProducts();
    store.deleteProduct.mockReturnValue(of(product));

    createComponent();
    click('[data-testid="delete-product-button"]');
    fixture.detectChanges();
    click('[data-testid="confirm-dialog-confirm"]');
    fixture.detectChanges();

    expect(store.deleteProduct).toHaveBeenCalledWith(product.id);
    expect(query('[data-testid="confirm-dialog"]')).toBeNull();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ProductListPageComponent);
    fixture.detectChanges();
  }

  function arrangeProducts(): void {
    store.products.set([product]);
    store.filteredProducts.set([product]);
    store.hasProducts.set(true);
    store.isEmpty.set(false);
    store.totalProducts.set(1);
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
    filteredProducts: signal<Product[]>([]),
    hasProducts: signal(false),
    isEmpty: signal(true),
    totalProducts: signal(0),
    loadProducts: vi.fn<() => void>(),
    loadCategories: vi.fn<() => void>(),
    loadProductById: vi.fn<(id: number) => void>(),
    setSearchTerm: vi.fn<(term: string) => void>(),
    setSelectedCategory: vi.fn<(category: string) => void>(),
    clearFilters: vi.fn<() => void>(),
    deleteProduct: vi.fn<
      (id: number) => ReturnType<ProductsStoreService['deleteProduct']>
    >(),
    clearSelectedProduct: vi.fn<() => void>(),
    clearError: vi.fn<() => void>(),
  };
}
