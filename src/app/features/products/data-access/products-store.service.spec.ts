import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, type MockedFunction } from 'vitest';

import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@core/models/product.model';

import { ProductsApiService } from './products-api.service';
import { ProductsStoreService } from './products-store.service';

type ProductsApiServiceMock = {
  readonly getProducts: MockedFunction<ProductsApiService['getProducts']>;
  readonly getProductById: MockedFunction<ProductsApiService['getProductById']>;
  readonly getCategories: MockedFunction<ProductsApiService['getCategories']>;
  readonly getProductsByCategory: MockedFunction<
    ProductsApiService['getProductsByCategory']
  >;
  readonly createProduct: MockedFunction<ProductsApiService['createProduct']>;
  readonly updateProduct: MockedFunction<ProductsApiService['updateProduct']>;
  readonly deleteProduct: MockedFunction<ProductsApiService['deleteProduct']>;
};

describe('ProductsStoreService', () => {
  let store: ProductsStoreService;
  let productsApi: ProductsApiServiceMock;

  const products: Product[] = [
    {
      id: 1,
      title: 'Slim Shirt',
      price: 49.9,
      description: 'Cotton shirt.',
      category: 'mens clothing',
      image: 'https://example.com/shirt.png',
    },
    {
      id: 2,
      title: 'Gold Ring',
      price: 199.9,
      description: 'Gold ring.',
      category: 'jewelery',
      image: 'https://example.com/ring.png',
    },
  ];

  const createPayload: CreateProductPayload = {
    title: 'Leather Wallet',
    price: 79.9,
    description: 'Compact wallet.',
    category: 'mens clothing',
    image: 'https://example.com/wallet.png',
  };

  beforeEach(() => {
    productsApi = {
      getProducts: vi.fn<ProductsApiService['getProducts']>(),
      getProductById: vi.fn<ProductsApiService['getProductById']>(),
      getCategories: vi.fn<ProductsApiService['getCategories']>(),
      getProductsByCategory:
        vi.fn<ProductsApiService['getProductsByCategory']>(),
      createProduct: vi.fn<ProductsApiService['createProduct']>(),
      updateProduct: vi.fn<ProductsApiService['updateProduct']>(),
      deleteProduct: vi.fn<ProductsApiService['deleteProduct']>(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProductsStoreService,
        {
          provide: ProductsApiService,
          useValue: productsApi,
        },
      ],
    });

    store = TestBed.inject(ProductsStoreService);
  });

  it('should expose the initial state', () => {
    expect(store.products()).toEqual([]);
    expect(store.categories()).toEqual([]);
    expect(store.selectedProduct()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.saving()).toBe(false);
    expect(store.deleting()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.searchTerm()).toBe('');
    expect(store.selectedCategory()).toBe('');
    expect(store.filteredProducts()).toEqual([]);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(10);
    expect(store.totalFilteredProducts()).toBe(0);
    expect(store.totalPages()).toBe(1);
    expect(store.paginatedProducts()).toEqual([]);
    expect(store.hasPreviousPage()).toBe(false);
    expect(store.hasNextPage()).toBe(false);
    expect(store.hasProducts()).toBe(false);
    expect(store.isEmpty()).toBe(true);
    expect(store.totalProducts()).toBe(0);
  });

  it('should load products successfully', () => {
    productsApi.getProducts.mockReturnValue(of(products));

    store.loadProducts();

    expect(productsApi.getProducts).toHaveBeenCalledOnce();
    expect(store.products()).toEqual(products);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.hasProducts()).toBe(true);
    expect(store.totalProducts()).toBe(2);
  });

  it('should handle load products error', () => {
    productsApi.getProducts.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    store.loadProducts();

    expect(store.products()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Não foi possível carregar os produtos.');
  });

  it('should load categories successfully', () => {
    const categories = ['mens clothing', 'jewelery'];

    productsApi.getProducts.mockReturnValue(
      throwError(() => new Error('Network error')),
    );
    productsApi.getCategories.mockReturnValue(of(categories));
    store.loadProducts();

    store.loadCategories();

    expect(productsApi.getCategories).toHaveBeenCalledOnce();
    expect(store.categories()).toEqual(categories);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Não foi possível carregar os produtos.');
  });

  it('should load product by id successfully', () => {
    const selectedProduct = products[0];

    productsApi.getProductById.mockReturnValue(of(selectedProduct));

    store.loadProductById(selectedProduct.id);

    expect(productsApi.getProductById).toHaveBeenCalledWith(selectedProduct.id);
    expect(store.selectedProduct()).toEqual(selectedProduct);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should filter by title with search term', () => {
    productsApi.getProducts.mockReturnValue(of(products));
    store.loadProducts();

    store.setSearchTerm('ring');

    expect(store.searchTerm()).toBe('ring');
    expect(store.filteredProducts()).toEqual([products[1]]);
    expect(store.totalProducts()).toBe(1);
  });

  it('should filter by selected category', () => {
    productsApi.getProducts.mockReturnValue(of(products));
    store.loadProducts();

    store.setSelectedCategory('mens clothing');

    expect(store.selectedCategory()).toBe('mens clothing');
    expect(store.filteredProducts()).toEqual([products[0]]);
    expect(store.totalProducts()).toBe(1);
  });

  it('should clear filters', () => {
    productsApi.getProducts.mockReturnValue(of(products));
    store.loadProducts();
    store.setSearchTerm('ring');
    store.setSelectedCategory('jewelery');

    store.clearFilters();

    expect(store.searchTerm()).toBe('');
    expect(store.selectedCategory()).toBe('');
    expect(store.filteredProducts()).toEqual(products);
  });

  it('should return only products from the current page', () => {
    const manyProducts = createProducts(12);
    productsApi.getProducts.mockReturnValue(of(manyProducts));
    store.loadProducts();

    expect(store.paginatedProducts()).toEqual(manyProducts.slice(0, 10));

    store.nextPage();

    expect(store.paginatedProducts()).toEqual(manyProducts.slice(10, 12));
  });

  it('should go to next page when possible', () => {
    productsApi.getProducts.mockReturnValue(of(createProducts(12)));
    store.loadProducts();

    store.nextPage();

    expect(store.currentPage()).toBe(2);
    expect(store.hasPreviousPage()).toBe(true);
    expect(store.hasNextPage()).toBe(false);
  });

  it('should go to previous page when possible', () => {
    productsApi.getProducts.mockReturnValue(of(createProducts(12)));
    store.loadProducts();
    store.nextPage();

    store.previousPage();

    expect(store.currentPage()).toBe(1);
    expect(store.hasPreviousPage()).toBe(false);
    expect(store.hasNextPage()).toBe(true);
  });

  it('should keep current page within valid limits', () => {
    productsApi.getProducts.mockReturnValue(of(createProducts(12)));
    store.loadProducts();

    store.setCurrentPage(99);

    expect(store.currentPage()).toBe(2);

    store.setCurrentPage(0);

    expect(store.currentPage()).toBe(1);
  });

  it('should reset pagination when search term changes', () => {
    productsApi.getProducts.mockReturnValue(of(createProducts(12)));
    store.loadProducts();
    store.nextPage();

    store.setSearchTerm('product');

    expect(store.currentPage()).toBe(1);
  });

  it('should reset pagination when selected category changes', () => {
    productsApi.getProducts.mockReturnValue(of(createProducts(12)));
    store.loadProducts();
    store.nextPage();

    store.setSelectedCategory('mens clothing');

    expect(store.currentPage()).toBe(1);
  });

  it('should reset pagination when filters are cleared', () => {
    productsApi.getProducts.mockReturnValue(of(createProducts(12)));
    store.loadProducts();
    store.nextPage();

    store.clearFilters();

    expect(store.currentPage()).toBe(1);
  });

  it('should create product and add it to local state', () => {
    const createdProduct: Product = {
      id: 3,
      ...createPayload,
    };

    productsApi.getProducts.mockReturnValue(of(products));
    productsApi.createProduct.mockReturnValue(of(createdProduct));
    store.loadProducts();

    const request = store.createProduct(createPayload);

    expect(store.saving()).toBe(true);

    request.subscribe((product) => {
      expect(product).toEqual(createdProduct);
    });

    expect(productsApi.createProduct).toHaveBeenCalledWith(createPayload);
    expect(store.products()).toEqual([...products, createdProduct]);
    expect(store.saving()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should update product and replace it in local state', () => {
    const updatePayload: UpdateProductPayload = {
      title: 'Updated Shirt',
      price: 59.9,
      description: 'Updated cotton shirt.',
      category: 'mens clothing',
      image: 'https://example.com/updated-shirt.png',
    };
    const updatedProduct: Product = {
      id: products[0].id,
      ...updatePayload,
    };

    productsApi.getProducts.mockReturnValue(of(products));
    productsApi.updateProduct.mockReturnValue(of(updatedProduct));
    store.loadProducts();

    const request = store.updateProduct(updatedProduct.id, updatePayload);

    expect(store.saving()).toBe(true);

    request.subscribe((product) => {
      expect(product).toEqual(updatedProduct);
    });

    expect(productsApi.updateProduct).toHaveBeenCalledWith(
      updatedProduct.id,
      updatePayload,
    );
    expect(store.products()).toEqual([updatedProduct, products[1]]);
    expect(store.saving()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should delete product and remove it from local state', () => {
    productsApi.getProducts.mockReturnValue(of(products));
    productsApi.deleteProduct.mockReturnValue(of(products[0]));
    store.loadProducts();

    const request = store.deleteProduct(products[0].id);

    expect(store.deleting()).toBe(true);

    request.subscribe((product) => {
      expect(product).toEqual(products[0]);
    });

    expect(productsApi.deleteProduct).toHaveBeenCalledWith(products[0].id);
    expect(store.products()).toEqual([products[1]]);
    expect(store.deleting()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should adjust current page after deleting product from the last page', () => {
    const manyProducts = createProducts(11);

    productsApi.getProducts.mockReturnValue(of(manyProducts));
    productsApi.deleteProduct.mockReturnValue(of(manyProducts[10]));
    store.loadProducts();
    store.nextPage();

    store.deleteProduct(manyProducts[10].id).subscribe();

    expect(store.currentPage()).toBe(1);
    expect(store.totalPages()).toBe(1);
  });

  it('should clear selected product', () => {
    productsApi.getProductById.mockReturnValue(of(products[0]));
    store.loadProductById(products[0].id);

    store.clearSelectedProduct();

    expect(store.selectedProduct()).toBeNull();
  });

  it('should clear error', () => {
    productsApi.getProducts.mockReturnValue(
      throwError(() => new Error('Network error')),
    );
    store.loadProducts();

    store.clearError();

    expect(store.error()).toBeNull();
  });
});

function createProducts(total: number): Product[] {
  return Array.from({ length: total }, (_, index) => ({
    id: index + 1,
    title: `Product ${index + 1}`,
    price: index + 1,
    description: `Product ${index + 1} description.`,
    category: index % 2 === 0 ? 'mens clothing' : 'jewelery',
    image: `https://example.com/product-${index + 1}.png`,
  }));
}
