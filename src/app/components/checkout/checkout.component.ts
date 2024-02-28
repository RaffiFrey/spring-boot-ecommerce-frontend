import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {RfreyFormService} from "../../services/rfrey-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {RfreyValidators} from "../../validators/rfrey-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {Address} from "../../common/address";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{
  checkoutFormGroup: FormGroup | undefined;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  storage: Storage = sessionStorage;

  constructor(private formBuilder: FormBuilder,
              private rfreyFormService: RfreyFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) {

  }

  ngOnInit(): void {

    this.reviewCartDetails();

    const email: string = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
        customer: this.formBuilder.group({
          firstName: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          lastName: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          email: new FormControl(email,
            [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        }),
        shippingAddress: this.formBuilder.group({
          street: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          city: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          country: new FormControl('', [Validators.required]),
          state: new FormControl('', [Validators.required]),
          zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
        }),
        billingAddress: this.formBuilder.group({
          street: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          city: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          country: new FormControl('', [Validators.required]),
          state: new FormControl('', [Validators.required]),
          zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
        }),
        creditCard: this.formBuilder.group({
          cardType: new FormControl('', [Validators.required]),
          nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2),
            RfreyValidators.notOnlyWhitespace]),
          cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
          securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
          expirationMonth: new FormControl('', [Validators.required]),
          expirationYear: new FormControl('', [Validators.required]),
        }),
      }
    );
    // populate credit card months & years
    const startMonth: number = new Date().getMonth() + 1;
    this.rfreyFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data);
    this.rfreyFormService.getCreditCardYears().subscribe(
      data => this.creditCardYears = data);

    this.rfreyFormService.getCountries().subscribe(
      data => this.countries = data
    );
  }

  onSubmit() {
    if (this.checkoutFormGroup?.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map(cartItem => new OrderItem(cartItem));
    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup?.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup!.controls['shippingAddress'].value as Address;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup!.controls['billingAddress'].value as Address;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
        this.resetCart();
      },
      error: err => {
        alert(`There was an error: ${err.message}`)
      }
    });
  }

  get firstName() {
    return this.checkoutFormGroup?.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup?.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup?.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup?.get('shippingAddress.street');
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup?.get('shippingAddress.city');
  }

  get shippingAddressZipCode() {
    return this.checkoutFormGroup?.get('shippingAddress.zipCode');
  }

  get shippingAddressState() {
    return this.checkoutFormGroup?.get('shippingAddress.state');
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup?.get('shippingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup?.get('billingAddress.street');
  }

  get billingAddressCity() {
    return this.checkoutFormGroup?.get('billingAddress.city');
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup?.get('billingAddress.zipCode');
  }

  get billingAddressState() {
    return this.checkoutFormGroup?.get('billingAddress.state');
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup?.get('billingAddress.country');
  }

  get creditCardCardType() {
    return this.checkoutFormGroup?.get('creditCard.cardType')
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup?.get('creditCard.nameOnCard')
  }

  get creditCardCardNumber() {
    return this.checkoutFormGroup?.get('creditCard.cardNumber')
  }

  get creditCardSecurityCode() {
    return this.checkoutFormGroup?.get('creditCard.securityCode')
  }

  copyShippingAddressToBillingAddress(event: Event) {
    if ((event.target as HTMLInputElement).checked) {
      this.checkoutFormGroup?.controls['billingAddress'].setValue(this.checkoutFormGroup?.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup?.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup?.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);
    // if the current year equals the selected year, then start with the current month
    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.rfreyFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup?.get(formGroupName);
    const countryCode = formGroup!.value.country.code;
    this.rfreyFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  private resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.checkoutFormGroup?.reset();
    this.router.navigateByUrl("/products");
  }
}
