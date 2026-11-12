import { TypedAPIResponse, ensureSuccess as assertSuccess } from "../api.helper";
import { MentorClient } from "../clients/mentor.client";
import { MentorResponse, MentorSummary } from "helpers/datafactory/schemas/mentor.schema";
import { buildMentorPayload, buildRejectionReason } from "helpers/datafactory/mentor.factory";

export class MentorService {
	constructor(private readonly client: MentorClient) {}

	/** Registers a mentor with a dynamic Faker payload built in the method body. */
	async register(ensureSuccess = false): Promise<TypedAPIResponse<MentorResponse>> {
		const payload = buildMentorPayload();
		const response = await this.client.register(payload);
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	async list(ensureSuccess = false): Promise<TypedAPIResponse<MentorSummary[]>> {
		const response = await this.client.list();
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	/** Accepts a string id so specs can assert how the API handles a non-numeric path variable. */
	async getById(id: number | string, ensureSuccess = false): Promise<TypedAPIResponse<MentorResponse>> {
		const response = await this.client.getById(id);
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	async accept(id: number, ensureSuccess = false): Promise<TypedAPIResponse<MentorResponse>> {
		const response = await this.client.accept(id);
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	/**	Rejects a mentor; the reason is generated here because no response returns it. */
	async reject(id: number, ensureSuccess = false): Promise<TypedAPIResponse<MentorResponse>> {
		const body = buildRejectionReason();
		const response = await this.client.reject(id, body);
		if (ensureSuccess) assertSuccess(response);
		return response;
	}

	/** Updates a mentor with fresh faker data, keeping their email so the identity doesn't change. */
	async update(id: number, email: string, ensureSuccess = false): Promise<TypedAPIResponse<MentorResponse>> {
		const payload = { ...buildMentorPayload(), email };
		const response = await this.client.update(id, payload);
		if (ensureSuccess) assertSuccess(response);
		return response;
	}
}
