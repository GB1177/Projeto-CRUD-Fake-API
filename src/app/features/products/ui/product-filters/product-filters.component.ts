import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly searchValueState = signal('');
  private readonly suggestionsOpenState = signal(false);

  readonly searchTerm = input('');
  readonly selectedCategory = input('');
  readonly categories = input<readonly string[]>([]);
  readonly suggestions = input<readonly string[]>([]);

  readonly searchTermChange = output<string>();
  readonly selectedCategoryChange = output<string>();
  readonly clearFilters = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly shouldShowSuggestions = computed(
    () =>
      this.suggestionsOpenState() &&
      this.searchValueState().trim().length > 0 &&
      this.suggestions().length > 0,
  );

  constructor() {
    effect(() => {
      const searchTerm = this.searchTerm();

      if (this.searchControl.value !== searchTerm) {
        this.searchControl.setValue(searchTerm, { emitEvent: false });
      }

      this.searchValueState.set(searchTerm);

      if (searchTerm.trim().length === 0) {
        this.suggestionsOpenState.set(false);
      }
    });

    this.searchControl.valueChanges
      .pipe(
        tap((value) => {
          this.searchValueState.set(value);
          this.suggestionsOpenState.set(value.trim().length > 0);
        }),
        debounceTime(300),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.searchTermChange.emit(value));
  }

  openSuggestions(): void {
    this.suggestionsOpenState.set(this.searchValueState().trim().length > 0);
  }

  @HostListener('document:click', ['$event'])
  closeSuggestionsWhenClickingOutside(event: MouseEvent): void {
    const target = event.target;

    if (target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.suggestionsOpenState.set(false);
    }
  }

  selectSuggestion(title: string): void {
    this.searchControl.setValue(title, { emitEvent: false });
    this.searchValueState.set(title);
    this.suggestionsOpenState.set(false);
    this.searchTermChange.emit(title);
  }

  clearAllFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchValueState.set('');
    this.suggestionsOpenState.set(false);
    this.clearFilters.emit();
  }

  onSelectedCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategoryChange.emit(select.value);
  }
}
