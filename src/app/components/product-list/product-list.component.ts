import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit{


  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = -1;
  searchMode: boolean = false;

  pageNumber: number = 1;
  pageSize: number = 10;
  totalPageElements: number = 0;

  previousKeyword: string = "";
  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute
              ) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.searchProducts();
    } else {
      this.handleListProducts();
    }
  }

  /**
   * Searches for products based on a keyword.
   *
   * @return {void}
   */
  searchProducts(): void {
    const keyword: string = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword != keyword) {
      this.pageNumber = 1;
    }
    this.previousKeyword = keyword;

    // we need to decrement by one because Angular pagination is 1 based, Spring boot is 0 based
    this.productService.searchProductsPaginate(this.pageNumber - 1, this.pageSize, keyword)
      .subscribe(this.processResult());
  }

  /**
   * Handles listing of products based on the category ID provided as a parameter in the route.
   * If no category ID is provided, defaults to category ID 1.
   *
   * @return void
   */
  handleListProducts() {
    // check if "id" param is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      //get the "id" param string. convert it to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      // no category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    // Check if we have different category than previous
    // Angular will reuse component if its currently being viewed.
    if (this.previousCategoryId != this.currentCategoryId) {
      this.pageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    // we need to decrement by one because Angular pagination is 1 based, Spring boot is 0 based
    this.productService.getProductListPaginate(this.pageNumber -1, this.pageSize, this.currentCategoryId)
      .subscribe(this.processResult());
  }

  updatePageSize(pageSize: string) {
    this.pageSize = +pageSize;
    this.pageNumber = 1;
    this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.pageNumber = data.page.number + 1;
      this.pageSize = data.page.size;
      this.totalPageElements = data.page.totalElements;
    }
  }

  addToCart(product: Product) {
    const cartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }
}
