import { expect, test, type Locator, type Page } from '@playwright/test';

const imageUrl = 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg';
const products = [
  createProduct(1, 'Classic Cotton Shirt', 29.9, "men's clothing"),
  createProduct(2, 'Slim Fit Denim Jacket', 89.9, "men's clothing"),
  createProduct(3, 'Leather Travel Backpack', 109.95, 'electronics'),
  createProduct(4, 'Wireless Studio Headphones', 59.5, 'electronics'),
  createProduct(5, 'Minimalist Silver Ring', 19.99, 'jewelery'),
  createProduct(6, 'Gold Plated Bracelet', 45.5, 'jewelery'),
  createProduct(7, 'Women Summer Dress', 34.75, "women's clothing"),
  createProduct(8, 'Fleece Lined Hoodie', 49.99, "women's clothing"),
  createProduct(9, 'USB-C Docking Station', 79.9, 'electronics'),
  createProduct(10, 'Canvas Weekend Bag', 39.9, "men's clothing"),
  createProduct(11, 'Ceramic Watch', 149.9, 'jewelery'),
  createProduct(12, 'Lightweight Running Shirt', 24.9, "women's clothing"),
  createProduct(13, 'Portable Monitor', 199.9, 'electronics'),
  createProduct(14, 'Cotton Crew Socks', 9.9, "men's clothing"),
  createProduct(15, 'Pearl Drop Earrings', 27.5, 'jewelery'),
  createProduct(16, 'Rainproof Shell Jacket', 69.9, "women's clothing"),
];
const categories = [
  'electronics',
  'jewelery',
  "men's clothing",
  "women's clothing",
];

test.describe('products', () => {
  test.beforeEach(async ({ page }) => {
    await mockFakeStoreApi(page);
  });

  test('opens product listing', async ({ page }) => {
    await openProducts(page);

    await expect(page.getByTestId('product-list-page')).toBeVisible();
    await expect(page.getByTestId('new-product-button')).toBeVisible();
    await expect(page.getByTestId('products-grid')).toBeVisible();
    await expect(page.getByTestId('product-card').first()).toBeVisible();
  });

  test('filters products with local autocomplete', async ({ page }) => {
    await openProducts(page);

    const searchInput = page.getByTestId('product-search-input');
    await searchInput.fill('shirt');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();

    await page.getByTestId('product-list-page').click({ position: { x: 10, y: 10 } });
    await expect(suggestions).toBeHidden();

    await searchInput.focus();
    await expect(suggestions).toBeVisible();

    const suggestionText = await page
      .getByTestId('search-suggestion-item')
      .first()
      .textContent();
    await page.getByTestId('search-suggestion-item').first().click();

    expect((await searchInput.inputValue()).trim()).toBe(
      (suggestionText ?? '').trim(),
    );
    await expect(page.getByTestId('product-card').first()).toBeVisible();

    await page.getByTestId('clear-search-button').click();
    await expect(searchInput).toHaveValue('');
  });

  test('changes client-side pagination', async ({ page }) => {
    await openProducts(page);

    await expect(page.getByTestId('product-pagination')).toBeVisible();
    const summary = page.getByTestId('pagination-summary');
    await expect(summary).toContainText('1 de');

    await page.getByTestId('page-size-select').selectOption('15');
    await expect(summary).toContainText('1 de');

    const nextButton = page.getByTestId('pagination-next-button');

    if (await nextButton.isEnabled()) {
      const previousSummary = await summary.textContent();
      await nextButton.click();
      await expect(summary).not.toHaveText(previousSummary ?? '');
    }
  });

  test('opens product detail and returns to listing', async ({ page }) => {
    await openProducts(page);

    await page.getByTestId('product-details-button').first().click();

    await expect(page.getByTestId('product-detail-page')).toBeVisible();
    await expect(page.getByTestId('product-detail-title')).toBeVisible();
    await expect(page.getByTestId('product-detail-price')).toBeVisible();
    await expect(page.getByTestId('product-detail-category')).toBeVisible();
    await expect(page.getByTestId('product-detail-description')).toBeVisible();
    await expect(page.getByTestId('back-button')).toBeVisible();
    await expect(page.getByTestId('edit-product-button')).toBeVisible();
    await expect(page.getByTestId('delete-product-button')).toBeVisible();

    await page.getByTestId('back-button').click();

    await expect(page.getByTestId('product-list-page')).toBeVisible();
  });

  test('creates a product and keeps it in the current session', async ({ page }) => {
    await openProducts(page);

    const title = `Produto E2E Teste ${Date.now()}`;

    await page.getByTestId('new-product-button').click();
    await expect(page.getByTestId('product-form-page')).toBeVisible();
    await fillProductForm(page, {
      title,
      price: '10,50',
      category: 'electronics',
      image: imageUrl,
      description: 'Produto criado durante teste E2E.',
    });
    await page.getByTestId('submit-product-button').click();

    await expect(page.getByTestId('product-list-page')).toBeVisible();
    await searchByTitle(page, title);
    await expect(page.getByTestId('product-card').filter({ hasText: title })).toBeVisible();
  });

  test('keeps invalid product form on screen', async ({ page }) => {
    await page.goto('/products/new');

    await expect(page.getByTestId('product-form-page')).toBeVisible();
    await expect(page.getByTestId('submit-product-button')).toBeDisabled();
    await expect(page).toHaveURL(/\/products\/new$/);
  });

  test('edits a product and keeps the updated title in the current session', async ({
    page,
  }) => {
    await openProducts(page);

    await page.getByTestId('product-details-button').first().click();
    await page.getByTestId('edit-product-button').click();

    const title = `Produto Editado E2E ${Date.now()}`;
    await page.getByTestId('product-title-input').fill(title);
    await page.getByTestId('product-price-input').fill('22,30');
    await page.getByTestId('product-price-input').blur();
    await page.getByTestId('submit-product-button').click();

    await expect(page.getByTestId('product-list-page')).toBeVisible();
    await searchByTitle(page, title);
    await expect(page.getByTestId('product-card').filter({ hasText: title })).toBeVisible();
  });

  test('deletes a product only after confirmation', async ({ page }) => {
    await openProducts(page);

    const firstCard = page.getByTestId('product-card').first();
    const title = (await firstCard.getByTestId('product-card-title').textContent())?.trim();

    if (!title) {
      throw new Error('Product title not found.');
    }

    await page.getByTestId('product-details-button').first().click();
    await page.getByTestId('delete-product-button').click();

    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.getByTestId('confirm-dialog-cancel-button').click();
    await expect(page.getByTestId('confirm-dialog')).toBeHidden();

    await page.getByTestId('delete-product-button').click();
    await page.getByTestId('confirm-dialog-confirm-button').click();

    await expect(page.getByTestId('product-list-page')).toBeVisible();
    await searchByTitle(page, title);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });
});

async function openProducts(page: Page): Promise<void> {
  await page.goto('/products');
  await expect(page.getByTestId('product-list-page')).toBeVisible();
  await expect(page.getByTestId('product-card').first()).toBeVisible();
}

async function mockFakeStoreApi(page: Page): Promise<void> {
  await page.route('https://fakestoreapi.com/products**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === '/products/categories') {
      await route.fulfill({ json: categories });
      return;
    }

    if (path.startsWith('/products/category/')) {
      const category = decodeURIComponent(path.replace('/products/category/', ''));
      await route.fulfill({
        json: products.filter((product) => product.category === category),
      });
      return;
    }

    if (path === '/products' && request.method() === 'GET') {
      await route.fulfill({ json: products });
      return;
    }

    if (path === '/products' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      await route.fulfill({ json: { id: 21, ...payload } });
      return;
    }

    const id = Number(path.replace('/products/', ''));
    const product = products.find((item) => item.id === id);

    if (request.method() === 'GET') {
      await route.fulfill({
        status: product ? 200 : 404,
        json: product ?? { message: 'Product not found' },
      });
      return;
    }

    if (request.method() === 'PUT') {
      const payload = request.postDataJSON();
      await route.fulfill({ json: { id, ...payload } });
      return;
    }

    if (request.method() === 'DELETE') {
      await route.fulfill({
        status: product ? 200 : 404,
        json: product ?? { message: 'Product not found' },
      });
      return;
    }

    await route.fallback();
  });
}

async function fillProductForm(
  page: Page,
  value: {
    readonly title: string;
    readonly price: string;
    readonly category: string;
    readonly image: string;
    readonly description: string;
  },
): Promise<void> {
  await page.getByTestId('product-title-input').fill(value.title);
  await page.getByTestId('product-price-input').fill(value.price);
  await page.getByTestId('product-price-input').blur();
  await page.getByTestId('product-category-select').selectOption(value.category);
  await page.getByTestId('product-image-input').fill(value.image);
  await page.getByTestId('product-description-input').fill(value.description);
}

async function searchByTitle(page: Page, title: string): Promise<Locator> {
  const searchInput = page.getByTestId('product-search-input');
  await searchInput.fill(title);
  await expect(searchInput).toHaveValue(title);

  return page.getByTestId('product-card').filter({ hasText: title });
}

function createProduct(
  id: number,
  title: string,
  price: number,
  category: string,
) {
  return {
    id,
    title,
    price,
    category,
    image: imageUrl,
    description: `${title} criado para cobrir os fluxos E2E da listagem de produtos.`,
    rating: {
      rate: 4.5,
      count: 120,
    },
  };
}
