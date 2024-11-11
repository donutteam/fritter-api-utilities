//
// Imports
//

import { z } from "zod";

import { ErrorResponseBody } from "../types/ErrorResponseBody.js";

//
// Function
//

export type ParseRequestBodyResult<RequestBody> =
{
	errorResponseBody: ErrorResponseBody;
	requestBody: null;
} |
{
	errorResponseBody: null;
	requestBody: RequestBody;
};

export function parseRequestBody<RequestBodySchema extends z.ZodSchema>(Schema: RequestBodySchema, rawRequestBody: unknown): ParseRequestBodyResult<z.infer<RequestBodySchema>>
{
	const requestBodyParseResult = Schema.safeParse(rawRequestBody);

	if (!requestBodyParseResult.success)
	{
		return {
			errorResponseBody:
			{
				success: false,
				errors: requestBodyParseResult.error.issues.map(
					(issue) =>
					{
						return {
							code: issue.code,
							message: issue.path.join(" > ") + ": " + issue.message,
						};
					}),
			},
			requestBody: null,
		};
	}
	else
	{
		return {
			errorResponseBody: null,
			requestBody: requestBodyParseResult.data,
		};
	}
}