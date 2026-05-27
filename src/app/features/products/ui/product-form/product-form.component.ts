import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

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
    price: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['', [Validators.required]],
    image: ['', [Validators.required, urlValidator]],
  });

  private readonly syncInitialValue = effect(() => {
    const initialValue = this.initialValue();

    this.form.reset(initialValue ?? defaultFormValue);
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

    this.formSubmit.emit(this.form.getRawValue());
  }
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
