import {Component, Inject, OnInit} from '@angular/core';
import {OKTA_AUTH} from "@okta/okta-angular";
import {OktaAuth, Token, Tokens} from "@okta/okta-auth-js";
import OktaSignIn from '@okta/okta-signin-widget';
import appConfig from "../../config/app-config";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: appConfig.oidc.issuer.split('/oauth2')[0],
      clientId: appConfig.oidc.clientId,
      redirectUri: appConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: appConfig.oidc.issuer,
        scopes: appConfig.oidc.scopes
      }
    });
  }

  ngOnInit(): void {

        this.oktaSignin.showSignIn({
          el: '#okta-sign-in-widget',
        }).then(async (tokens: Tokens | undefined) => {
          if (tokens) {
            const accessToken = tokens.accessToken as Token;
            await this.oktaAuth.signInWithRedirect({ originalUri: '/' });
          }
          this.oktaSignin.remove();
          await this.oktaAuth.handleLoginRedirect(tokens);
        }).catch((err: any) => {
          throw err;
        });
    }
}
