import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShellStore } from '../../stores/shell.store';
import { CartRemoteService } from '../../services/cart-remote.service';

@Component({
  selector: 'app-shell-header',
  imports: [RouterLink],
  templateUrl: './shell-header.component.html',
  styleUrl: './shell-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellHeaderComponent {
  readonly store = inject(ShellStore) as InstanceType<typeof ShellStore>;
  private readonly cartRemote = inject(CartRemoteService);

  logout(): void {
    this.cartRemote.sendClearCart();
    this.store.logout();
  }
}
