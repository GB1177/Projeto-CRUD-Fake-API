import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { map, startWith, tap } from 'rxjs';

import {
  ProductFormMode,
  ProductFormValue,
} from '../../models/product-form.model';

const defaultFormValue: ProductFormValue = {
  title: '',
  price: 0,
  description: '',
  category: '',
  image: '',
};

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly initialValue = input<ProductFormValue | null>(null);
  readonly categories = input<readonly string[]>([]);
  readonly saving = input(false);
  readonly mode = input<ProductFormMode>('create');

  readonly formSubmit = output<ProductFormValue>();
  readonly cancel = output<void>();

  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    price: ['', [Validators.required, priceValidator]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['', [Validators.required]],
    image: ['', [Validators.required, urlValidator]],
  });

  readonly imageLoadFailed = signal(false);
  readonly imagePreviewUrl = toSignal(
    this.form.controls.image.valueChanges.pipe(
      startWith(this.form.controls.image.value),
      tap(() => this.imageLoadFailed.set(false)),
      map((value) => value.trim()),
    ),
    { initialValue: '' },
  );
  readonly hasImagePreview = computed(() => this.imagePreviewUrl().length > 0);
  readonly shouldShowImage = computed(
    () => this.hasImagePreview() && !this.imageLoadFailed(),
  );

  private readonly syncInitialValue = effect(() => {
    const initialValue = this.initialValue();

    this.form.reset({
      ...(initialValue ?? defaultFormValue),
      price: initialValue ? formatPriceForInput(initialValue.price) : '',
    });
  });

  protected get submitLabel(): string {
    if (this.saving()) {
      return 'Salvando...';
    }

    return this.mode() === 'edit' ? 'Salvar alterações' : 'Criar produto';
  }

  protected showError(controlName: keyof ProductFormValue): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.formSubmit.emit({
      ...value,
      price: parsePrice(value.price),
    });
  }

  onImagePreviewError(): void {
    this.imageLoadFailed.set(true);
  }

  formatPriceOnBlur(): void {
    const price = parsePrice(this.form.controls.price.value);

    if (price > 0) {
      this.form.controls.price.setValue(formatPriceForInput(price));
    }
  }
}

function priceValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  const price = parsePrice(control.value);

  return price > 0 ? null : { min: true };
}

function parsePrice(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');

  if (normalizedValue.length === 0) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatPriceForInput(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function urlValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();

  if (value.length === 0) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? null
      : { url: true };
  } catch {
    return { url: true };
  }
}
