import { APIRequestContext, APIResponse } from "@playwright/test";
import { PlatformEndpoints } from "helpers/datafactory/constants/paths.data";

export class MemberClient {
	constructor(private readonly request: APIRequestContext) {}

	delete(id: number): Promise<APIResponse> {
		return this.request.delete(`${PlatformEndpoints.MEMBERS}/${id}`);
	}
}
