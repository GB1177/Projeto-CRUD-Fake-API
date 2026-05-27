import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormValue } from '../../models/product-form.model';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  const initialValue: ProductFormValue = {
    title: 'Slim Shirt',
    price: 49.9,
    description: 'Cotton shirt with a clean fit.',
    category: 'mens clothing',
    image: 'https://example.com/shirt.png',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should start invalid without initial value', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate required fields', () => {
    component.form.setValue({
      title: '',
      price: 0,
      description: '',
      category: '',
      image: '',
    });

    expect(component.form.controls.title.hasError('required')).toBe(true);
    expect(component.form.controls.description.hasError('required')).toBe(true);
    expect(component.form.controls.category.hasError('required')).toBe(true);
    expect(component.form.controls.image.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should validate price greater than zero', () => {
    component.form.patchValue({
      price: 0,
    });

    expect(component.form.controls.price.hasError('min')).toBe(true);

    component.form.patchValue({
      price: 10,
    });

    expect(component.form.controls.price.hasError('min')).toBe(false);
  });

  it('should validate image URL', () => {
    component.form.patchValue({
      image: 'not-a-url',
    });

    expect(component.form.controls.image.hasError('url')).toBe(true);

    component.form.patchValue({
      image: 'https://example.com/product.png',
    });

    expect(component.form.controls.image.hasError('url')).toBe(false);
  });

  it('should emit formSubmit with valid payload', () => {
    const submittedValues: ProductFormValue[] = [];
    component.formSubmit.subscribe((value) => submittedValues.push(value));
    component.form.setValue(initialValue);

    component.submit();

    expect(submittedValues).toEqual([initialValue]);
  });

  it('should fill form in edit mode with initialValue', () => {
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', initialValue);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual(initialValue);
    expect(component.form.valid).toBe(true);
  });

  it('should disable submit when saving is true', () => {
    component.form.setValue(initialValue);
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    const submitButton = getSubmitButton(fixture);

    expect(submitButton.disabled).toBe(true);
  });
});

function getSubmitButton(
  fixture: ComponentFixture<ProductFormComponent>,
): HTMLButtonElement {
  const element = fixture.nativeElement as HTMLElement;
  const button = element.querySelector<HTMLButtonElement>(
    '[data-testid="product-form-submit"]',
  );

  if (!button) {
    throw new Error('Submit button not found.');
  }

  return button;
}
