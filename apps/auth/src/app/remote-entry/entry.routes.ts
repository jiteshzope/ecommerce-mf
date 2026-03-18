import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
	{
		path: '',
		component: RemoteEntry,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'login',
			},
			{
				path: 'login',
				loadComponent: () => import('../login/login').then((m) => m.Login),
			},
			{
				path: 'register',
				loadComponent: () => import('../register/register').then((m) => m.Register),
			},
		],
	},
];
