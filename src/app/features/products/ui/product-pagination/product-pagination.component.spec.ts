import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPaginationComponent } from './product-pagination.component';

describe('ProductPaginationComponent', () => {
  let fixture: ComponentFixture<ProductPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPaginationComponent);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 20);
    fixture.componentRef.setInput('hasPreviousPage', false);
    fixture.componentRef.setInput('hasNextPage', true);
    fixture.detectChanges();
  });

  it('should render current page and total pages', () => {
    expect(query('[data-testid="pagination-summary"]')?.textContent).toContain(
      'Página 1 de 3',
    );
    expect(query('[data-testid="pagination-summary"]')?.textContent).toContain(
      '20 itens',
    );
  });

  it('should disable previous button on the first page', () => {
    expect(button('[data-testid="pagination-previous"]').disabled).toBe(true);
  });

  it('should disable next button on the last page', () => {
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('hasPreviousPage', true);
    fixture.componentRef.setInput('hasNextPage', false);
    fixture.detectChanges();

    expect(button('[data-testid="pagination-next"]').disabled).toBe(true);
  });

  it('should emit previousPage', () => {
    const values: void[] = [];
    fixture.componentRef.setInput('hasPreviousPage', true);
    fixture.detectChanges();
    fixture.componentInstance.previousPage.subscribe((value) => values.push(value));

    button('[data-testid="pagination-previous"]').click();

    expect(values.length).toBe(1);
  });

  it('should emit nextPage', () => {
    const values: void[] = [];
    fixture.componentInstance.nextPage.subscribe((value) => values.push(value));

    button('[data-testid="pagination-next"]').click();

    expect(values.length).toBe(1);
  });

  it('should emit pageChange', () => {
    const values: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => values.push(page));

    button('[data-testid="pagination-page-2"]').click();

    expect(values).toEqual([2]);
  });

  it('should emit pageSizeChange', () => {
    const values: number[] = [];
    fixture.componentInstance.pageSizeChange.subscribe((size) => values.push(size));
    const select = query('[data-testid="pagination-page-size"]') as HTMLSelectElement;

    select.value = '15';
    select.dispatchEvent(new Event('change'));

    expect(values).toEqual([15]);
  });

  function query(selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  function button(selector: string): HTMLButtonElement {
    const element = query(selector) as HTMLButtonElement | null;

    if (!element) {
      throw new Error(`Button not found: ${selector}`);
    }

    return element;
  }
});
