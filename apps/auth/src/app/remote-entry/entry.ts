import { Component, OnInit, inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

@Component({
  imports: [],
  selector: 'app-auth-entry',
  templateUrl: './entry.html',
})
export class RemoteEntry implements OnInit {
  readonly store = inject(AuthStore) as InstanceType<typeof AuthStore>;

  ngOnInit(): void {
    this.store.initialize();
  }
}
