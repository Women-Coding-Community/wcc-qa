import { TypedAPIResponse, ensureSuccess as assertSuccess } from '../api.helper';
import { AuthenticationClient } from '../clients/authentication.client';
import { LoginResponse } from 'helpers/datafactory/schemas/auth.schema';
import { UserAccount } from 'helpers/datafactory/schemas/user.account.schema';

export class AuthenticationService {
  constructor(private readonly client: AuthenticationClient) {}

  async login(email: string, password: string, ensureSuccess = false): Promise<TypedAPIResponse<LoginResponse>> {
    const payload = { email, password };
    const response = await this.client.login(payload);
    if (ensureSuccess) assertSuccess(response);
    return response;
  }

  async getUsers(ensureSuccess = false): Promise<TypedAPIResponse<UserAccount[]>> {
    const response = await this.client.getUsers();
    if (ensureSuccess) assertSuccess(response);
    return response;
  }
}
