import { Component, OnInit, inject } from '@angular/core';
import { ProductShellBridgeService } from '../services/product-shell-bridge.service';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome],
  selector: 'app-product-entry',
  template: `<app-nx-welcome></app-nx-welcome>`,
})
export class RemoteEntry implements OnInit {
  private readonly shellBridge = inject(ProductShellBridgeService);

  ngOnInit(): void {
    this.shellBridge.publishRemoteReady();
  }
}
