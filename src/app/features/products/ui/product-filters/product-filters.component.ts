import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent {
  readonly searchTerm = input('');
  readonly selectedCategory = input('');
  readonly categories = input<readonly string[]>([]);

  readonly searchTermChange = output<string>();
  readonly selectedCategoryChange = output<string>();
  readonly clearFilters = output<void>();

  onSearchTermInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTermChange.emit(input.value);
  }

  onSelectedCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategoryChange.emit(select.value);
  }
}
