import { TypedAPIResponse, ensureSuccess as assertSuccess } from "../api.helper";
import { CycleClient } from "../clients/cycle.client";
import { MentorshipCycle } from "helpers/datafactory/schemas/cycle.schema";

export class CycleService {
	constructor(private readonly client: CycleClient) {}

	/** The cycle that is OPEN with a registration window covering today; 404 when there is none. */
	async current(ensureSuccess = false): Promise<TypedAPIResponse<MentorshipCycle>> {
		const response = await this.client.current();
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	/** Every cycle regardless of status. */
	async all(ensureSuccess = false): Promise<TypedAPIResponse<MentorshipCycle[]>> {
		const response = await this.client.all();
		if (ensureSuccess) assertSuccess(response);
		return response;
	}
}
