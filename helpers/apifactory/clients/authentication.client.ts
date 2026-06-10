import { APIRequestContext, APIResponse } from "@playwright/test";
import { AuthEndpoints } from "helpers/datafactory/constants/paths.data";

export interface LoginRequest {
	email: string;
	password: string;
}

export class AuthenticationClient {
	constructor(private readonly request: APIRequestContext) {}

	login(data: LoginRequest): Promise<APIResponse> {
		return this.request.post(AuthEndpoints.LOGIN, { data });
	}

	getUsers(): Promise<APIResponse> {
		return this.request.get(AuthEndpoints.USERS);
	}
}
