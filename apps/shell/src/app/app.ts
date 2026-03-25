import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthRemoteService } from './services/auth-remote.service';
import { CartRemoteService } from './services/cart-remote.service';
import { ProductRemoteService } from './services/product-remote.service';
import { ShellHeaderComponent } from './components/shell-header/shell-header.component';
import { ShellStore } from './stores/shell.store';

@Component({
  imports: [RouterModule, ShellHeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'shell';
  readonly store = inject(ShellStore) as InstanceType<typeof ShellStore>;
  readonly authRemote = inject(AuthRemoteService);
  readonly cartRemote = inject(CartRemoteService);
  readonly productRemote = inject(ProductRemoteService);

  constructor() {
    effect(() => {
      const session = this.authRemote.session();

      if (session?.isAuthenticated) {
        this.store.setAuthSession(session);
        void this.store.loadCartItemCount();
        return;
      }

      this.store.clearAuthSession();
    });
  }

}
