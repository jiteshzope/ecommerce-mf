import { Component } from '@angular/core';
import { CartItemsListComponent } from '../components/cart-items-list/cart-items-list.component';

@Component({
  imports: [CartItemsListComponent],
  selector: 'app-cart-entry',
  templateUrl: './entry.html',
})
export class RemoteEntry {}
