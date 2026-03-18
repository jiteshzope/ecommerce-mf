import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

@Component({
  imports: [RouterOutlet],
  selector: 'app-auth-entry',
  templateUrl: './entry.html',
})
export class RemoteEntry implements OnInit {
  readonly store = inject(AuthStore) as InstanceType<typeof AuthStore>;

  ngOnInit(): void {
    this.store.initialize();
  }
}
