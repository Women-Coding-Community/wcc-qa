import { APIResponse } from "@playwright/test";

export interface TypedAPIResponse<T> extends APIResponse {json(): Promise<T>}

export function ensureSuccess(response: APIResponse){
    if(!response.ok()) {
        throw new Error(`Request failed with status ${response.status()}: ${response.statusText()}`);
    }
}