import type { SessionState } from './session-state';

export interface BaseShellEvent<TSource extends string> {
  source: TSource;
  type: string;
  timestamp: number;
  payload: any;
}

export type AuthShellEvent = BaseShellEvent<'auth'>;

export type CartShellEvent = BaseShellEvent<'cart'>;

export type ProductShellEvent = BaseShellEvent<'product'>;

// Shell -> Cart remote events
export type ShellCartEvent = BaseShellEvent<'shell'>;

// Shell -> Product remote events
export type ShellProductEvent = BaseShellEvent<'shell'>;

export type AuthChannelEvent = AuthShellEvent;
export type CartChannelEvent = CartShellEvent | ShellCartEvent;
export type ProductChannelEvent = ProductShellEvent | ShellProductEvent;

export type AnyShellEvent =
  | AuthShellEvent
  | CartShellEvent
  | ProductShellEvent
  | ShellCartEvent
  | ShellProductEvent;
