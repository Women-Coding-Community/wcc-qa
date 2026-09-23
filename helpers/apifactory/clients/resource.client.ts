import { APIRequestContext, APIResponse } from "@playwright/test";
import { PlatformEndpoints } from "helpers/datafactory/constants/paths.data";

export class ResourceClient {
	constructor(private readonly request: APIRequestContext) {}

	uploadProfilePicture(
		memberId: number,
		fileBuffer: Buffer,
		fileName = "profile.jpg",
		contentType = "image/jpeg"
	): Promise<APIResponse> {
		return this.request.post(`${PlatformEndpoints.RESOURCES_MEMBER_PROFILE_PICTURE}?memberId=${memberId}`, {
			multipart: {
				file: {
					name: fileName,
					mimeType: contentType,
					buffer: fileBuffer,
				},
			},
		});
	}

	getProfilePicture(memberId: number): Promise<APIResponse> {
		return this.request.get(`${PlatformEndpoints.RESOURCES_MEMBER_PROFILE_PICTURE}/${memberId}`);
	}

	deleteProfilePicture(memberId: number): Promise<APIResponse> {
		return this.request.delete(`${PlatformEndpoints.RESOURCES_MEMBER_PROFILE_PICTURE}/${memberId}`);
	}
}
