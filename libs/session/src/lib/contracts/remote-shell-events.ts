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

// Shell -> Auth remote events
export type ShellAuthEvent = BaseShellEvent<
  'shell',
  {
    message: string;
    redirectUrl?: string;
  }
>;

// Shell -> Cart remote events
export type ShellCartEvent = BaseShellEvent<
  'shell',
  {
    message: string;
    productId?: string;
    quantity?: number;
  }
>;

// Shell -> Product remote events
export type ShellProductEvent = BaseShellEvent<
  'shell',
  {
    message: string;
    productId?: string;
    category?: string;
    query?: string;
  }
>;

export type AuthChannelEvent = AuthShellEvent | ShellAuthEvent;
export type CartChannelEvent = CartShellEvent | ShellCartEvent;
export type ProductChannelEvent = ProductShellEvent | ShellProductEvent;

export type AnyShellEvent =
  | AuthShellEvent
  | CartShellEvent
  | ProductShellEvent
  | ShellAuthEvent
  | ShellCartEvent
  | ShellProductEvent;
