import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { ProductFiltersComponent } from './product-filters.component';

describe('ProductFiltersComponent', () => {
  let fixture: ComponentFixture<ProductFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFiltersComponent);
    fixture.componentRef.setInput('categories', ['mens clothing', 'jewelery']);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should emit searchTermChange after debounce', async () => {
    vi.useFakeTimers();
    const values: string[] = [];
    fixture.componentInstance.searchTermChange.subscribe((value) =>
      values.push(value),
    );

    setInputValue('shirt');
    await vi.advanceTimersByTimeAsync(299);

    expect(values).toEqual([]);

    await vi.advanceTimersByTimeAsync(1);

    expect(values).toEqual(['shirt']);
  });

  it('should not emit repeated values because of distinctUntilChanged', async () => {
    vi.useFakeTimers();
    const values: string[] = [];
    fixture.componentInstance.searchTermChange.subscribe((value) =>
      values.push(value),
    );

    setInputValue('shirt');
    await vi.advanceTimersByTimeAsync(300);
    setInputValue('shirt');
    await vi.advanceTimersByTimeAsync(300);

    expect(values).toEqual(['shirt']);
  });

  it('should render suggestions when there is a search term', () => {
    fixture.componentRef.setInput('suggestions', ['Slim Shirt']);
    fixture.detectChanges();

    setInputValue('shi');
    fixture.detectChanges();

    expect(query('[data-testid="search-suggestions"]')).not.toBeNull();
    expect(query('[data-testid="search-suggestion-Slim Shirt"]')).not.toBeNull();
  });

  it('should fill the input and emit searchTermChange when a suggestion is selected', () => {
    const values: string[] = [];
    fixture.componentInstance.searchTermChange.subscribe((value) =>
      values.push(value),
    );
    fixture.componentRef.setInput('suggestions', ['Slim Shirt']);
    fixture.detectChanges();
    setInputValue('shi');
    fixture.detectChanges();

    click('[data-testid="search-suggestion-Slim Shirt"]');

    expect(input().value).toBe('Slim Shirt');
    expect(values).toEqual(['Slim Shirt']);
    expect(query('[data-testid="search-suggestions"]')).toBeNull();
  });

  it('should clear the input and emit clearFilters', () => {
    let emitted = false;
    fixture.componentInstance.clearFilters.subscribe(() => {
      emitted = true;
    });
    setInputValue('shirt');

    click('[data-testid="clear-filters-button"]');

    expect(input().value).toBe('');
    expect(emitted).toBe(true);
    expect(query('[data-testid="search-suggestions"]')).toBeNull();
  });

  it('should emit selectedCategoryChange when category changes', () => {
    const values: string[] = [];
    fixture.componentInstance.selectedCategoryChange.subscribe((value) =>
      values.push(value),
    );
    const select = query(
      '[data-testid="product-category-select"]',
    ) as HTMLSelectElement;

    select.value = 'jewelery';
    select.dispatchEvent(new Event('change'));

    expect(values).toEqual(['jewelery']);
  });

  function input(): HTMLInputElement {
    const element = query('[data-testid="product-search-input"]') as
      | HTMLInputElement
      | null;

    if (!element) {
      throw new Error('Search input not found');
    }

    return element;
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

  function setInputValue(value: string): void {
    const element = input();
    element.value = value;
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
});
