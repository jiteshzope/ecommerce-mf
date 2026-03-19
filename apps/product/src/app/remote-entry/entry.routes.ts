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
				loadComponent: () => import('../product-list/product-list').then((m) => m.ProductList),
			},
			{
				path: ':id',
				loadComponent: () =>
					import('../product-details/product-details').then((m) => m.ProductDetails),
			},
		],
	},
];
