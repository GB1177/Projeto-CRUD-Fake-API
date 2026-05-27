export interface ProductFormValue {
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly category: string;
  readonly image: string;
}

export type ProductFormMode = 'create' | 'edit';
