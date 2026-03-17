import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShellStore } from './stores/shell.store';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'shell';

  readonly store = inject(ShellStore) as InstanceType<typeof ShellStore>;

  ngOnInit(): void {
    void this.store.loadData();
  }
}
