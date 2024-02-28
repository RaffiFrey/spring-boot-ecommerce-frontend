import {Customer} from "./customer";
import {Address} from "./address";
import {OrderItem} from "./order-item";
import {Order} from "./order";

export class Purchase {
  customer: Customer | undefined;
  shippingAddress: Address | undefined;
  billingAddress: Address | undefined;
  order: Order | undefined;
  orderItems: OrderItem[] = [];
}
