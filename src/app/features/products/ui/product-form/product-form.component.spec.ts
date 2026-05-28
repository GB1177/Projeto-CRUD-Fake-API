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
      price: '',
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
      price: '0',
    });

    expect(component.form.controls.price.hasError('min')).toBe(true);

    component.form.patchValue({
      price: '10',
    });

    expect(component.form.controls.price.hasError('min')).toBe(false);
  });

  it('should accept comma as decimal separator for price', () => {
    component.form.patchValue({
      price: '10,50',
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
    component.form.setValue({
      ...initialValue,
      price: '49,9',
    });

    component.submit();

    expect(submittedValues).toEqual([initialValue]);
  });

  it('should fill form in edit mode with initialValue', () => {
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', initialValue);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      ...initialValue,
      price: '49,90',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should format initial price with comma and two decimal places', () => {
    fixture.componentRef.setInput('initialValue', {
      ...initialValue,
      price: 22.3,
    });
    fixture.detectChanges();

    expect(priceInput(fixture).value).toBe('22,30');
  });

  it('should format integer price on blur', () => {
    setPriceInputValue(fixture, '10');

    priceInput(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(priceInput(fixture).value).toBe('10,00');
  });

  it('should format comma decimal price on blur', () => {
    setPriceInputValue(fixture, '10,1');

    priceInput(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(priceInput(fixture).value).toBe('10,10');
  });

  it('should format dot decimal price on blur', () => {
    setPriceInputValue(fixture, '10.1');

    priceInput(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(priceInput(fixture).value).toBe('10,10');
  });

  it('should disable submit when saving is true', () => {
    component.form.setValue({
      ...initialValue,
      price: '49.9',
    });
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    const submitButton = getSubmitButton(fixture);

    expect(submitButton.disabled).toBe(true);
  });

  it('should render price input as text without number spinner behavior', () => {
    expect(priceInput(fixture).type).toBe('text');
    expect(priceInput(fixture).inputMode).toBe('decimal');
  });

  it('should render image preview when image URL is filled', () => {
    component.form.patchValue({
      image: initialValue.image,
    });
    fixture.detectChanges();

    const previewImage = query<HTMLImageElement>(
      fixture,
      '[data-testid="product-image-preview-img"]',
    );

    expect(previewImage?.src).toBe(initialValue.image);
  });

  it('should render image preview fallback when image fails to load', () => {
    component.form.patchValue({
      image: initialValue.image,
    });
    fixture.detectChanges();

    const previewImage = query<HTMLImageElement>(
      fixture,
      '[data-testid="product-image-preview-img"]',
    );

    previewImage?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(
      query(fixture, '[data-testid="product-image-preview-fallback"]'),
    ).not.toBeNull();
  });
});

function priceInput(
  fixture: ComponentFixture<ProductFormComponent>,
): HTMLInputElement {
  const input = query<HTMLInputElement>(
    fixture,
    '[data-testid="product-price-input"]',
  );

  if (!input) {
    throw new Error('Price input not found.');
  }

  return input;
}

function setPriceInputValue(
  fixture: ComponentFixture<ProductFormComponent>,
  value: string,
): void {
  const input = priceInput(fixture);
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function query<T extends HTMLElement>(
  fixture: ComponentFixture<ProductFormComponent>,
  selector: string,
): T | null {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
}

function getSubmitButton(
  fixture: ComponentFixture<ProductFormComponent>,
): HTMLButtonElement {
  const element = fixture.nativeElement as HTMLElement;
  const button = element.querySelector<HTMLButtonElement>(
    '[data-testid="submit-product-button"]',
  );

  if (!button) {
    throw new Error('Submit button not found.');
  }

  return button;
}
