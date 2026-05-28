import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Excluir produto');
    fixture.componentRef.setInput(
      'dangerMessage',
      'O item "Slim Shirt" será excluído.',
    );
    fixture.componentRef.setInput('message', 'Tem certeza que deseja prosseguir?');
    fixture.componentRef.setInput('confirmLabel', 'Excluir');
    fixture.componentRef.setInput('confirmVariant', 'danger');
    fixture.detectChanges();
  });

  it('should not render close icon button', () => {
    expect(query('[data-testid="confirm-dialog-close"]')).toBeNull();
  });

  it('should emit cancel when backdrop is clicked', () => {
    let emitted = false;
    fixture.componentInstance.cancel.subscribe(() => {
      emitted = true;
    });

    click('[data-testid="confirm-dialog-backdrop"]');

    expect(emitted).toBe(true);
  });

  it('should not emit cancel when dialog content is clicked', () => {
    let emitted = false;
    fixture.componentInstance.cancel.subscribe(() => {
      emitted = true;
    });

    click('[data-testid="confirm-dialog"]');

    expect(emitted).toBe(false);
  });

  it('should render danger message and default message separately', () => {
    expect(
      query('[data-testid="confirm-dialog-danger-message"]')?.textContent,
    ).toContain('O item "Slim Shirt" será excluído.');
    expect(
      query('[data-testid="confirm-dialog-default-message"]')?.textContent,
    ).toContain('Tem certeza que deseja prosseguir?');
  });

  it('should apply danger variant to confirm button', () => {
    expect(
      query('[data-testid="confirm-dialog-confirm"]')?.classList.contains(
        'danger',
      ),
    ).toBe(true);
  });

  function query(selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  function click(selector: string): void {
    const element = query(selector);

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    element.click();
    fixture.detectChanges();
  }
});
