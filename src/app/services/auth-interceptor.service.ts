import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {from, lastValueFrom, Observable} from 'rxjs';
import {OktaAuth} from "@okta/okta-auth-js";
import {OKTA_AUTH} from "@okta/okta-angular";
import {environment} from "../../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  private securedEndpoints : string[] = [environment.rfreyShopApiUrl + '/orders'];
  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.handleAccess(req, next))
    }

  private async handleAccess(req: HttpRequest<any>, next: HttpHandler) : Promise<HttpEvent<any>> {
    if(this.securedEndpoints.some(url => req.urlWithParams.includes(url))) {
      const accessToken = this.oktaAuth.getAccessToken();
      // clone the request and add new header with access token
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    }
    return await lastValueFrom(next.handle(req));
  }
}
