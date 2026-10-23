import { APIResponse } from "@playwright/test";
import { ResourceClient } from "../clients/resource.client";

export class ResourceService {
	constructor(private readonly client: ResourceClient) {}

	uploadProfilePicture(
		memberId: number,
		fileBuffer: Buffer,
		fileName?: string,
		contentType?: string
	): Promise<APIResponse> {
		return this.client.uploadProfilePicture(memberId, fileBuffer, fileName, contentType);
	}

	getProfilePicture(memberId: number): Promise<APIResponse> {
		return this.client.getProfilePicture(memberId);
	}

	deleteProfilePicture(memberId: number): Promise<APIResponse> {
		return this.client.deleteProfilePicture(memberId);
	}
}
