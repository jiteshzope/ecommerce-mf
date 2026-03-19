import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { ShellStore } from '../stores/shell.store';

export const cartAuthGuard: CanMatchFn = (): boolean | UrlTree => {
  const store = inject(ShellStore) as InstanceType<typeof ShellStore>;
  const router = inject(Router);

  if (store.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/product']);
};
