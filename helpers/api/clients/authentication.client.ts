import { APIRequestContext } from '@playwright/test';

export class AuthenticationClient {
  constructor(private readonly request: APIRequestContext) {}
}
