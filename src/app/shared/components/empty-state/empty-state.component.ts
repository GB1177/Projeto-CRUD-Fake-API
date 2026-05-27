import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input('Nenhum item encontrado');
  readonly description = input('Não há informações para exibir no momento.');
  readonly actionLabel = input<string>();

  readonly action = output<void>();
}
