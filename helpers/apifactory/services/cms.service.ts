import { TypedAPIResponse, ensureSuccess as assertSuccess } from "../api.helper";
import { CmsClient } from "../clients/cms.client";
import { CmsMentorsPage } from "helpers/datafactory/schemas/cms.schema";
import { CycleMentorshipType } from "helpers/datafactory/constants/cycle.data";

export class CmsService {
	constructor(private readonly client: CmsClient) {}

	/** Returns the public CMS mentorship page (mentors list lives under `mentors`). */
	async mentors(ensureSuccess = false): Promise<TypedAPIResponse<CmsMentorsPage>> {
		const response = await this.client.mentors();
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	/** Returns the public mentors page filtered by mentorship type, as a visitor clicking that filter sees it */
	async mentorsByType(
		mentorshipType: CycleMentorshipType,
		ensureSuccess = false
	): Promise<TypedAPIResponse<CmsMentorsPage>> {
		const response = await this.client.mentors(mentorshipType);
		if (ensureSuccess) assertSuccess(response);
		return response;
	}
}
