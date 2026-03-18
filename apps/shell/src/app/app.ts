import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthRemoteService } from './services/auth-remote.service';
import { ShellHeaderComponent } from './components/shell-header/shell-header.component';
import { ShellStore } from './stores/shell.store';

@Component({
  imports: [RouterModule, ShellHeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'shell';

  readonly store = inject(ShellStore) as InstanceType<typeof ShellStore>;
  readonly authRemote = inject(AuthRemoteService);

  constructor() {
    effect(() => {
      const session = this.authRemote.session();

      if (session?.isAuthenticated) {
        this.store.setAuthSession(session);
        return;
      }

      this.store.clearAuthSession();
    });
  }

}
