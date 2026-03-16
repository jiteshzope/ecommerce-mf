import { Subject } from 'rxjs';
import type { RemoteShellChannel } from '@ecommerce-mf/session';

export class ShellRemoteChannelService<TEvent>
  implements RemoteShellChannel<TEvent>
{
  private readonly eventsSubject = new Subject<TEvent>();

  readonly events$ = this.eventsSubject.asObservable();

  publish(event: TEvent): void {
    this.eventsSubject.next(event);
  }
}
