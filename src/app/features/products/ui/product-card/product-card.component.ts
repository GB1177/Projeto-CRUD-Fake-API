import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  readonly view = output<Product>();
  readonly edit = output<Product>();
  readonly delete = output<Product>();
}
