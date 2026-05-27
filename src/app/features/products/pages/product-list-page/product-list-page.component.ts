import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { Product } from '@core/models/product.model';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';

import { ProductsStoreService } from '../../data-access/products-store.service';
import { ProductCardComponent } from '../../ui/product-card/product-card.component';
import { ProductFiltersComponent } from '../../ui/product-filters/product-filters.component';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    ConfirmDialogComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ProductCardComponent,
    ProductFiltersComponent,
  ],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent {
  readonly store = inject(ProductsStoreService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly productToDelete = signal<Product | null>(null);
  readonly deleteDialogMessage = computed(() => {
    const productTitle = this.productToDelete()?.title ?? 'este produto';

    return `Tem certeza de que deseja excluir ${productTitle}?`;
  });

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

  editProduct(product: Product): void {
    void this.router.navigate(['/products', product.id, 'edit']);
  }

  askToDelete(product: Product): void {
    this.productToDelete.set(product);
  }

  cancelDelete(): void {
    this.productToDelete.set(null);
  }

  confirmDelete(): void {
    const product = this.productToDelete();

    if (!product) {
      return;
    }

    this.store
      .deleteProduct(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.productToDelete.set(null),
      });
  }

  retryLoadProducts(): void {
    this.store.loadProducts();
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
