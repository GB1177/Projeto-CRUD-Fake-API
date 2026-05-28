import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi, type Mock } from 'vitest';

import { Product } from '@core/models/product.model';

import { ProductsStoreService } from '../../data-access/products-store.service';
import { ProductDetailPageComponent } from './product-detail-page.component';

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
  readonly createProduct: Mock<ProductsStoreService['createProduct']>;
  readonly updateProduct: Mock<ProductsStoreService['updateProduct']>;
  readonly deleteProduct: Mock<ProductsStoreService['deleteProduct']>;
  readonly clearSelectedProduct: Mock<() => void>;
  readonly clearError: Mock<() => void>;
};

describe('ProductDetailPageComponent', () => {
  let fixture: ComponentFixture<ProductDetailPageComponent>;
  let store: ProductsStoreMock;
  let router: { readonly navigate: Mock<Router['navigate']> };

  const product: Product = {
    id: 7,
    title: 'Slim Shirt',
    price: 49.9,
    description: 'Cotton shirt with a clean fit.',
    category: 'mens clothing',
    image: 'https://example.com/shirt.png',
    rating: {
      rate: 4.4,
      count: 12,
    },
  };

  it('should load product by id on init', async () => {
    await setup();

    expect(store.clearSelectedProduct).toHaveBeenCalledOnce();
    expect(store.loadProductById).toHaveBeenCalledWith(product.id);
  });

  it('should render loading', async () => {
    store = createStoreMock();
    store.loading.set(true);
    await setup(store);

    expect(query('[data-testid="loading-state"]')).not.toBeNull();
  });

  it('should render error', async () => {
    store = createStoreMock();
    store.error.set('Não foi possível carregar o produto.');
    await setup(store);

    expect(query('[data-testid="error-state-message"]')?.textContent).toContain(
      'Não foi possível carregar o produto.',
    );
  });

  it('should render selected product data', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    await setup(store);

    expect(query('[data-testid="product-detail-product-title"]')?.textContent).toContain(
      product.title,
    );
    expect(query('[data-testid="product-detail-category"]')?.textContent).toContain(
      product.category,
    );
    expect(query('[data-testid="product-detail-description"]')?.textContent).toContain(
      product.description,
    );
    expect(query('[data-testid="product-detail-rating"]')).not.toBeNull();
  });

  it('should navigate to products when back is clicked', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    await setup(store);

    click('[data-testid="product-detail-back"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should navigate to edit page when edit is clicked', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    await setup(store);

    click('[data-testid="product-detail-edit"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products', product.id, 'edit']);
  });

  it('should open confirmation when delete is clicked', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    await setup(store);

    click('[data-testid="product-detail-delete"]');

    expect(query('[data-testid="confirm-dialog"]')).not.toBeNull();
    expect(query('[data-testid="confirm-dialog-message"]')?.textContent).toContain(
      `O item "${product.title}"`,
    );
  });

  it('should call deleteProduct after confirmation', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    store.deleteProduct.mockReturnValue(of(product));
    await setup(store);

    click('[data-testid="product-detail-delete"]');
    click('[data-testid="confirm-dialog-confirm"]');

    expect(store.deleteProduct).toHaveBeenCalledWith(product.id);
  });

  it('should navigate to products after successful deletion', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    store.deleteProduct.mockReturnValue(of(product));
    await setup(store);

    click('[data-testid="product-detail-delete"]');
    click('[data-testid="confirm-dialog-confirm"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should cancel deletion without calling deleteProduct', async () => {
    store = createStoreMock();
    store.selectedProduct.set(product);
    await setup(store);

    click('[data-testid="product-detail-delete"]');
    click('[data-testid="confirm-dialog-cancel"]');

    expect(store.deleteProduct).not.toHaveBeenCalled();
    expect(query('[data-testid="confirm-dialog"]')).toBeNull();
  });

  async function setup(storeOverride = createStoreMock()): Promise<void> {
    store = storeOverride;
    router = {
      navigate: vi.fn<Router['navigate']>().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailPageComponent],
      providers: [
        {
          provide: ProductsStoreService,
          useValue: store,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: String(product.id) }),
            },
          },
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.detectChanges();
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
    createProduct: vi.fn<ProductsStoreService['createProduct']>(),
    updateProduct: vi.fn<ProductsStoreService['updateProduct']>(),
    deleteProduct: vi.fn<ProductsStoreService['deleteProduct']>(),
    clearSelectedProduct: vi.fn<() => void>(),
    clearError: vi.fn<() => void>(),
  };
}
