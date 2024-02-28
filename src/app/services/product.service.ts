import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Product} from "../common/product";
import {ProductCategory} from "../common/product-category";
import {environment} from "../../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productUrl : string = environment.rfreyShopApiUrl +  '/products';
  private categoryUrl : string = environment.rfreyShopApiUrl +  '/product-category';

  constructor(private httpClient: HttpClient) {}

  getProductCategories() : Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategories>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  getProductList(categoryId: number) : Observable<Product[]> {
    const searchUrl : string = `${this.productUrl}/search/findByCategoryId?id=${categoryId}`;
    return this.getProducts(searchUrl);
  }

  getProductListPaginate(page: number, pageSize: number, categoryId: number) : Observable<GetResponseProducts> {
    const searchUrl : string = `${this.productUrl}/search/findByCategoryId?id=${categoryId}`
                                + `&page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  searchProducts(keyword: string) : Observable<Product[]> {
    const searchUrl : string = `${this.productUrl}/search/findByNameContaining?name=${keyword}`;
    return this.getProducts(searchUrl);
  }

  searchProductsPaginate(page: number, pageSize: number, keyword: string) : Observable<GetResponseProducts> {
    const searchUrl : string = `${this.productUrl}/search/findByNameContaining?name=${keyword}`
                                + `&page=${page}&size=${pageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  private getProducts(searchUrl: string) : Observable<Product[]>  {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(productId: number) : Observable<Product> {
    const productUrl = `${this.productUrl}/${productId}`;
    return this.httpClient.get<Product>(productUrl);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

