import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';

@Component({
  standalone: true,
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

  it('should render only the brand link in the header', () => {
    const header = query('header');

    expect(header?.textContent).toContain('Fake Store Admin');
    expect(header?.textContent).not.toContain('Products');
  });

  it('should link the brand to products list', () => {
    const brand = query<HTMLAnchorElement>('[data-testid="app-brand-link"]');

    expect(brand?.getAttribute('href')).toBe('/products');
  });

  it('should not render the previous products informational label', () => {
    expect(query('[data-testid="nav-products"]')).toBeNull();
    expect(query('[data-testid="app-breadcrumb-label"]')).toBeNull();
  });

  function query<T extends HTMLElement>(selector: string): T | null {
    return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  }
});
