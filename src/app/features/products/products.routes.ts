import { Routes } from '@angular/router';

import { ProductFormPageComponent } from './pages/product-form-page/product-form-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: 'new',
    component: ProductFormPageComponent,
  },
  {
    path: ':id/edit',
    component: ProductFormPageComponent,
  },
  {
    path: '',
    component: ProductListPageComponent,
  },
];
