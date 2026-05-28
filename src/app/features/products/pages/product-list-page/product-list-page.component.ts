import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Product } from '@core/models/product.model';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';

import { ProductsStoreService } from '../../data-access/products-store.service';
import { ProductCardComponent } from '../../ui/product-card/product-card.component';
import { ProductFiltersComponent } from '../../ui/product-filters/product-filters.component';
import { ProductPaginationComponent } from '../../ui/product-pagination/product-pagination.component';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ProductCardComponent,
    ProductFiltersComponent,
    ProductPaginationComponent,
  ],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent {
  readonly store = inject(ProductsStoreService);
  private readonly router = inject(Router);

  constructor() {
    this.store.loadProducts();
    this.store.loadCategories();
  }

  createProduct(): void {
    void this.router.navigate(['/products', 'new']);
  }

  viewProduct(product: Product): void {
    void this.router.navigate(['/products', product.id]);
  }

  retryLoadProducts(): void {
    this.store.loadProducts(true);
  }

  emptyTitle(): string {
    return this.hasActiveFilters()
      ? 'Nenhum produto encontrado'
      : 'Nenhum produto cadastrado';
  }

  emptyDescription(): string {
    return this.hasActiveFilters()
      ? 'Ajuste os filtros ou limpe a busca para ver outros produtos.'
      : 'Quando houver produtos disponíveis, eles serão exibidos aqui.';
  }

  hasActiveFilters(): boolean {
    return (
      this.store.searchTerm().trim().length > 0 ||
      this.store.selectedCategory().trim().length > 0
    );
  }
}
