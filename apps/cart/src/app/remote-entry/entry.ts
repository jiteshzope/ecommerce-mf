import { Component, OnInit, inject } from '@angular/core';
import { CartShellBridgeService } from '../services/cart-shell-bridge.service';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome],
  selector: 'app-cart-entry',
  template: `<app-nx-welcome></app-nx-welcome>`,
})
export class RemoteEntry implements OnInit {
  private readonly shellBridge = inject(CartShellBridgeService);

  ngOnInit(): void {
    this.shellBridge.publishRemoteReady();
  }
}
