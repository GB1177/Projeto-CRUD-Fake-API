import { Routes } from '@angular/router';

import { ProductDetailPageComponent } from './pages/product-detail-page/product-detail-page.component';
import { ProductFormPageComponent } from './pages/product-form-page/product-form-page.component';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: 'new',
    component: ProductFormPageComponent,
    data: { breadcrumb: 'Novo produto' },
  },
  {
    path: ':id/edit',
    component: ProductFormPageComponent,
    data: { breadcrumb: 'Editar produto' },
  },
  {
    path: ':id',
    component: ProductDetailPageComponent,
    data: { breadcrumb: 'Detalhes do produto' },
  },
  {
    path: '',
    component: ProductListPageComponent,
    data: { breadcrumb: 'Produtos' },
  },
];
