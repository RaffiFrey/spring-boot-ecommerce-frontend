import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  totalQuantity: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  storage: Storage = sessionStorage;
  constructor() {
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if (data != null) {
      this.cartItems = data;

      this.calculateCartTotals();
    }
  }

  addToCart(cartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;
    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === cartItem.id);
      alreadyExistsInCart = (existingCartItem != undefined);
    }
    if (alreadyExistsInCart) {
      existingCartItem!.quantity++;

    } else {
      this.cartItems.push(cartItem);
    }
    this.calculateCartTotals();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  public calculateCartTotals() {
    let totalPrice: number = 0;
    let totalQuantity: number = 0;
    for (let cartItem of this.cartItems) {
      totalPrice += cartItem.quantity * cartItem.unitPrice;
      totalQuantity += cartItem.quantity;
    }
    // next will publish an event
    this.totalPrice.next(totalPrice);
    this.totalQuantity.next(totalQuantity);
    this.persistCartItems();
  }

  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;
    if (cartItem.quantity === 0) {
      this.remove(cartItem);
    }
    else {
      this.calculateCartTotals();
    }
  }

  public remove(cartItem: CartItem) {
    const index = this.cartItems.findIndex(tempCartItem => tempCartItem.id === cartItem.id);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
    this.calculateCartTotals();
  }
}
