import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirmar ação');
  readonly message = input('Tem certeza de que deseja continuar?');
  readonly dangerMessage = input('');
  readonly confirmVariant = input<'primary' | 'danger'>('primary');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
