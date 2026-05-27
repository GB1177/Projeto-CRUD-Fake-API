import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Product } from '@core/models/product.model';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';

import { ProductsStoreService } from '../../data-access/products-store.service';
import {
  ProductFormMode,
  ProductFormValue,
} from '../../models/product-form.model';
import { ProductFormComponent } from '../../ui/product-form/product-form.component';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ErrorStateComponent, LoadingStateComponent, ProductFormComponent],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPageComponent {
  readonly store = inject(ProductsStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly productId = this.getProductId();
  readonly mode: ProductFormMode = this.productId === null ? 'create' : 'edit';
  readonly title = this.mode === 'edit' ? 'Editar produto' : 'Novo produto';

  constructor() {
    this.store.loadCategories();

    if (this.productId === null) {
      this.store.clearSelectedProduct();
      return;
    }

    this.store.loadProductById(this.productId);
  }

  saveProduct(value: ProductFormValue): void {
    const request =
      this.mode === 'edit' && this.productId !== null
        ? this.store.updateProduct(this.productId, value)
        : this.store.createProduct(value);

    this.handleSave(request);
  }

  cancel(): void {
    void this.router.navigate(['/products']);
  }

  retryLoadProduct(): void {
    if (this.productId !== null) {
      this.store.loadProductById(this.productId);
    }
  }

  private handleSave(request: Observable<Product>): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigate(['/products']),
    });
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
