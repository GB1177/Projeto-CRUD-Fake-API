import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { apiEndpoints } from '@core/api/api-endpoints';
import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@core/models/product.model';

import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpTesting: HttpTestingController;

  const product: Product = {
    id: 1,
    title: 'Test product',
    price: 99.9,
    description: 'Product used in service tests.',
    category: 'electronics',
    image: 'https://example.com/product.png',
    rating: {
      rate: 4.5,
      count: 10,
    },
  };

  const payload: CreateProductPayload = {
    title: 'New product',
    price: 120,
    description: 'New product payload.',
    category: 'jewelery',
    image: 'https://example.com/new-product.png',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should get products', () => {
    const products: Product[] = [product];

    service.getProducts().subscribe((response) => {
      expect(response).toEqual(products);
    });

    const request = httpTesting.expectOne(apiEndpoints.products.base);

    expect(request.request.method).toBe('GET');

    request.flush(products);
  });

  it('should get product by id', () => {
    service.getProductById(product.id).subscribe((response) => {
      expect(response).toEqual(product);
    });

    const request = httpTesting.expectOne(
      apiEndpoints.products.productById(product.id),
    );

    expect(request.request.method).toBe('GET');

    request.flush(product);
  });

  it('should get categories', () => {
    const categories = ['electronics', 'jewelery'];

    service.getCategories().subscribe((response) => {
      expect(response).toEqual(categories);
    });

    const request = httpTesting.expectOne(apiEndpoints.products.categories);

    expect(request.request.method).toBe('GET');

    request.flush(categories);
  });

  it('should get products by category', () => {
    const category = 'men clothing';
    const products: Product[] = [product];

    service.getProductsByCategory(category).subscribe((response) => {
      expect(response).toEqual(products);
    });

    const request = httpTesting.expectOne(
      apiEndpoints.products.productsByCategory(category),
    );

    expect(request.request.method).toBe('GET');

    request.flush(products);
  });

  it('should create product', () => {
    const createdProduct: Product = {
      id: 21,
      ...payload,
    };

    service.createProduct(payload).subscribe((response) => {
      expect(response).toEqual(createdProduct);
    });

    const request = httpTesting.expectOne(apiEndpoints.products.base);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(createdProduct);
  });

  it('should update product', () => {
    const updatePayload: UpdateProductPayload = {
      title: 'Updated product',
      price: 150,
      description: 'Updated product payload.',
      category: 'electronics',
      image: 'https://example.com/updated-product.png',
    };
    const updatedProduct: Product = {
      id: product.id,
      ...updatePayload,
    };

    service.updateProduct(product.id, updatePayload).subscribe((response) => {
      expect(response).toEqual(updatedProduct);
    });

    const request = httpTesting.expectOne(
      apiEndpoints.products.productById(product.id),
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updatePayload);

    request.flush(updatedProduct);
  });

  it('should delete product', () => {
    service.deleteProduct(product.id).subscribe((response) => {
      expect(response).toEqual(product);
    });

    const request = httpTesting.expectOne(
      apiEndpoints.products.productById(product.id),
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(product);
  });
});
