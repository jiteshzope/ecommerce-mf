export interface BaseShellEvent<TSource extends string, TPayload> {
  source: TSource;
  type: string;
  timestamp: number;
  payload: TPayload;
}

export type AuthShellEvent = BaseShellEvent<
  'auth',
  {
    message: string;
    email?: string;
  }
>;

export type CartShellEvent = BaseShellEvent<
  'cart',
  {
    message: string;
    itemCount?: number;
  }
>;

export type ProductShellEvent = BaseShellEvent<
  'product',
  {
    message: string;
    productId?: string;
  }
>;

export type AnyShellEvent = AuthShellEvent | CartShellEvent | ProductShellEvent;
