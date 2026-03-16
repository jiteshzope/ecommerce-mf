import { Component, OnInit, inject } from '@angular/core';
import { AuthShellBridgeService } from '../services/auth-shell-bridge.service';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome],
  selector: 'app-auth-entry',
  template: `<app-nx-welcome></app-nx-welcome>`,
})
export class RemoteEntry implements OnInit {
  private readonly shellBridge = inject(AuthShellBridgeService);

  ngOnInit(): void {
    this.shellBridge.publishRemoteReady();
  }
}
