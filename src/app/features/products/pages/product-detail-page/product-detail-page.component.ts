import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';

import { ProductsStoreService } from '../../data-access/products-store.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [
    ConfirmDialogComponent,
    CurrencyPipe,
    DecimalPipe,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPageComponent {
  readonly store = inject(ProductsStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly productId = this.getProductId();
  readonly deleteDialogOpen = signal(false);
  readonly deleteDialogDangerMessage = computed(() => {
    const productTitle = this.store.selectedProduct()?.title ?? 'este produto';

    return `O item "${productTitle}" será excluído.`;
  });

  constructor() {
    this.store.clearSelectedProduct();

    if (this.productId !== null) {
      this.store.loadProductById(this.productId);
    }
  }

  goBack(): void {
    void this.router.navigate(['/products']);
  }

  editProduct(): void {
    if (this.productId !== null) {
      void this.router.navigate(['/products', this.productId, 'edit']);
    }
  }

  askToDelete(): void {
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
  }

  confirmDelete(): void {
    const product = this.store.selectedProduct();

    if (!product) {
      return;
    }

    this.store
      .deleteProduct(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/products']),
        error: () => undefined,
      });
  }

  retryLoadProduct(): void {
    if (this.productId !== null) {
      this.store.loadProductById(this.productId);
    }
  }

  private getProductId(): number | null {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      return null;
    }

    const id = Number(idParam);

    return Number.isFinite(id) ? id : null;
  }
}
