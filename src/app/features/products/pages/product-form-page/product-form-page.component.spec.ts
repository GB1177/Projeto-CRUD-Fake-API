import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi, type Mock } from 'vitest';

import { Product } from '@core/models/product.model';

import { ProductsStoreService } from '../../data-access/products-store.service';
import { ProductFormValue } from '../../models/product-form.model';
import { ProductFormComponent } from '../../ui/product-form/product-form.component';
import { ProductFormPageComponent } from './product-form-page.component';

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
  readonly createProduct: Mock<
    (payload: ProductFormValue) => ReturnType<ProductsStoreService['createProduct']>
  >;
  readonly updateProduct: Mock<
    (
      id: number,
      payload: ProductFormValue,
    ) => ReturnType<ProductsStoreService['updateProduct']>
  >;
  readonly deleteProduct: Mock<
    (id: number) => ReturnType<ProductsStoreService['deleteProduct']>
  >;
  readonly clearSelectedProduct: Mock<() => void>;
  readonly clearError: Mock<() => void>;
};

describe('ProductFormPageComponent', () => {
  let fixture: ComponentFixture<ProductFormPageComponent>;
  let store: ProductsStoreMock;
  let router: { readonly navigate: Mock<Router['navigate']> };

  const product: Product = {
    id: 7,
    title: 'Slim Shirt',
    price: 49.9,
    description: 'Cotton shirt with a clean fit.',
    category: 'mens clothing',
    image: 'https://example.com/shirt.png',
  };

  const formValue: ProductFormValue = {
    title: 'Leather Wallet',
    price: 79.9,
    description: 'Compact wallet for daily use.',
    category: 'mens clothing',
    image: 'https://example.com/wallet.png',
  };

  it('should load categories on init', async () => {
    await setup();

    expect(store.loadCategories).toHaveBeenCalledOnce();
  });

  it('should render new product title in create mode', async () => {
    await setup();

    expect(query('[data-testid="product-form-page-title"]')?.textContent).toContain(
      'Novo produto',
    );
  });

  it('should load product by id in edit mode', async () => {
    await setup('7');

    expect(store.loadProductById).toHaveBeenCalledWith(7);
  });

  it('should call createProduct when submitting in create mode', async () => {
    await setup();
    store.createProduct.mockReturnValue(of({ id: 21, ...formValue }));
    fillAndSubmitForm(formValue);

    expect(store.createProduct).toHaveBeenCalledWith(formValue);
  });

  it('should call updateProduct when submitting in edit mode', async () => {
    await setup('7');
    store.selectedProduct.set(product);
    fixture.detectChanges();
    store.updateProduct.mockReturnValue(of({ id: product.id, ...formValue }));
    fillAndSubmitForm(formValue);

    expect(store.updateProduct).toHaveBeenCalledWith(product.id, formValue);
  });

  it('should navigate to products after saving successfully', async () => {
    await setup();
    store.createProduct.mockReturnValue(of({ id: 21, ...formValue }));
    fillAndSubmitForm(formValue);

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should navigate to products when canceling', async () => {
    await setup();
    click('[data-testid="product-form-cancel"]');

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should render loading in edit mode when loading is true', async () => {
    store = createStoreMock();
    store.loading.set(true);
    await setup('7', store);

    expect(query('[data-testid="loading-state"]')).not.toBeNull();
  });

  it('should render error when store has error', async () => {
    store = createStoreMock();
    store.error.set('Não foi possível carregar o produto.');
    await setup('7', store);

    expect(query('[data-testid="error-state-message"]')?.textContent).toContain(
      'Não foi possível carregar o produto.',
    );
  });

  async function setup(
    routeId?: string,
    storeOverride = createStoreMock(),
  ): Promise<void> {
    store = storeOverride;
    router = {
      navigate: vi.fn<Router['navigate']>().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormPageComponent],
      providers: [
        {
          provide: ProductsStoreService,
          useValue: store,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeId ? { id: routeId } : {}),
            },
          },
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPageComponent);
    fixture.detectChanges();
  }

  function fillAndSubmitForm(value: ProductFormValue): void {
    const formComponent = getProductFormComponent();

    formComponent.form.setValue(value);
    formComponent.submit();
    fixture.detectChanges();
  }

  function getProductFormComponent(): ProductFormComponent {
    const debugElement = fixture.debugElement.query(By.directive(ProductFormComponent));

    if (!debugElement) {
      throw new Error('ProductFormComponent not found.');
    }

    return debugElement.componentInstance as ProductFormComponent;
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
    categories: signal<string[]>(['mens clothing']),
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
    createProduct: vi.fn<
      (payload: ProductFormValue) => ReturnType<ProductsStoreService['createProduct']>
    >(),
    updateProduct: vi.fn<
      (
        id: number,
        payload: ProductFormValue,
      ) => ReturnType<ProductsStoreService['updateProduct']>
    >(),
    deleteProduct: vi.fn<
      (id: number) => ReturnType<ProductsStoreService['deleteProduct']>
    >(),
    clearSelectedProduct: vi.fn<() => void>(),
    clearError: vi.fn<() => void>(),
  };
}
