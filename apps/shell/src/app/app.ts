import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthRemoteService } from './services/auth-remote.service';
import { CartRemoteService } from './services/cart-remote.service';
import { ProductRemoteService } from './services/product-remote.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'shell';

  // Injecting the services at the shell root initialises their event subscriptions
  readonly authRemote = inject(AuthRemoteService);
  readonly cartRemote = inject(CartRemoteService);
  readonly productRemote = inject(ProductRemoteService);
}
