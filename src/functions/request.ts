//
// Imports
//

import { FritterFile } from "@donutteam/fritter/build/classes/FritterFile.js";
import { z } from "zod";

import { ErrorResponseBodySchema } from "../types/ErrorResponseBody.js";
import { SuccessResponseBodySchema } from "../types/SuccessResponseBody.js";

//
// Locals
//

type RemapFritterFileToBrowserFile<T> =
{
	[K in keyof T]: T[K] extends FritterFile ? File : T[K];
};

//
// Function
//

export type RequestOptions
<
	EndpointRequestBodySchema extends z.ZodSchema, 
	EndpointResponseBodySchema extends z.ZodUnion<[ typeof SuccessResponseBodySchema, typeof ErrorResponseBodySchema ]>
> =
{
	requestBodySchema: EndpointRequestBodySchema;
	responseBodySchema: EndpointResponseBodySchema;
	requestBody: RemapFritterFileToBrowserFile<z.infer<EndpointRequestBodySchema>>;
}

export async function request
<
	EndpointRequestBodySchema extends z.ZodSchema, 
	EndpointResponseBodySchema extends z.ZodUnion<[ typeof SuccessResponseBodySchema, typeof ErrorResponseBodySchema ]>
>
(
	method: "GET" | "POST",
	endpointUrl: string,
	options: RequestOptions<EndpointRequestBodySchema, EndpointResponseBodySchema>
): Promise<z.infer<EndpointResponseBodySchema>>
{
	//
	// Validate Request Body
	//

	const requestBodyParseResult = options.requestBodySchema.safeParse(options.requestBody);

	if (!requestBodyParseResult.success)
	{
		return {
			success: false,
			errors:
			[
				{
					code: "INVALID_REQUEST_BODY",
					message: "The request body did not match the expected schema.",
				},
			],
		};
	}

	const requestBody = requestBodyParseResult.data;

	//
	// Do Request
	//

	let response: Response;

	if (method == "GET")
	{
		const searchParameters = new URLSearchParams();

		searchParameters.set("requestBody", JSON.stringify(requestBody));

		response = await fetch(endpointUrl + "?" + searchParameters.toString(),
			{
				credentials: "include",
				method: "GET",
			});
	}
	else
	{
		const hasFiles = Object.values(requestBody).some(value => value instanceof File);

		if (hasFiles)
		{
			const formData = new FormData();

			for (const [ key, value ] of Object.entries(options.requestBody))
			{
				formData.append(key, value);
			}

			response = await fetch(endpointUrl,
				{
					credentials: "include",
					method: "POST",
					body: formData,
				});
		}
		else
		{
			const headers = new Headers();

			headers.set("Content-Type", "application/json");
	
			const body = JSON.stringify(requestBody);
	
			response = await fetch(endpointUrl,
				{
					credentials: "include",
					method: "POST",
					headers,
					body,
				});
		}
	}

	const responseJson = await response.json();

	const responseBodyParseResult = options.responseBodySchema.safeParse(responseJson);

	if (!responseBodyParseResult.success)
	{
		return {
			success: false,
			errors:
			[
				{
					code: "INVALID_RESPONSE_BODY",
					message: "The response body did not match the expected schema.",
				},
			],
		};
	}

	return responseBodyParseResult.data;
}