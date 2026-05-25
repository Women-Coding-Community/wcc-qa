import { AuthenticationClient } from '../clients/authentication.client';

export class AuthenticationService {
  constructor(private readonly client: AuthenticationClient) {}
}
