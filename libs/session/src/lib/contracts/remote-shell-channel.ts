import type { Observable } from 'rxjs';

export interface RemoteShellChannel<TEvent> {
  readonly events$: Observable<TEvent>;
  publish(event: TEvent): void;
}
