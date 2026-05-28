import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';

@Component({
  template: '',
})
class EmptyRouteComponent {}

describe('AppLayoutComponent', () => {
  let fixture: ComponentFixture<AppLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayoutComponent],
      providers: [
        provideRouter([
          {
            path: 'products',
            component: EmptyRouteComponent,
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayoutComponent);
    fixture.detectChanges();
  });

  it('should link the brand to products list', () => {
    const brand = query<HTMLAnchorElement>('[data-testid="app-brand"]');

    expect(brand?.getAttribute('href')).toBe('/products');
  });

  it('should render Products as informational text', () => {
    const productsNavigation = query('[data-testid="nav-products"]');

    expect(productsNavigation?.tagName.toLowerCase()).toBe('span');
    expect(productsNavigation?.textContent).toContain('Products');
    expect(productsNavigation?.getAttribute('href')).toBeNull();
  });

  function query<T extends HTMLElement>(selector: string): T | null {
    return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  }
});
