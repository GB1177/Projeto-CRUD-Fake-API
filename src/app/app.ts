import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppLayoutComponent } from '@core/layout/app-layout.component';

@Component({
  selector: 'app-root',
  imports: [AppLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
}
