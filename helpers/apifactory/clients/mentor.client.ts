import { APIRequestContext, APIResponse } from "@playwright/test";
import { PlatformEndpoints } from "helpers/datafactory/constants/paths.data";
import { MentorPayload } from "helpers/datafactory/mentor.factory";

export class MentorClient {
	constructor(private readonly request: APIRequestContext) {}

	register(payload: MentorPayload): Promise<APIResponse> {
		return this.request.post(PlatformEndpoints.MENTORS, { data: payload });
	}

	list(): Promise<APIResponse> {
		return this.request.get(PlatformEndpoints.MENTORS);
	}

	getById(id: number | string): Promise<APIResponse> {
		return this.request.get(`${PlatformEndpoints.MENTORS}/${id}`);
	}

	accept(id: number): Promise<APIResponse> {
		return this.request.patch(`${PlatformEndpoints.MENTORS}/${id}/accept`);
	}

	reject(id: number, body: { reason: string }): Promise<APIResponse> {
		return this.request.patch(`${PlatformEndpoints.MENTORS}/${id}/reject`, { data: body });
	}

	update(id: number, payload: MentorPayload): Promise<APIResponse> {
		return this.request.put(`${PlatformEndpoints.MENTORS}/${id}`, { data: payload });
	}
}
