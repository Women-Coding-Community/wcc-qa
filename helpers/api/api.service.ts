import { APIRequestContext } from '@playwright/test';
import { AuthenticationClient } from './clients/authentication.client';
import { AuthenticationService } from './services/authentication.service';

export class APIService {
  public authentication: AuthenticationService;

  constructor(request: APIRequestContext) {
    const authenticationClient = new AuthenticationClient(request);

    this.authentication = new AuthenticationService(authenticationClient);
  }
}
