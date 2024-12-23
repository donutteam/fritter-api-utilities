//
// Imports
//

import * as Fritter from "@donutteam/fritter";
import { z } from "zod";

import { APIError } from "../classes/APIError.js";

import { parseRequestBody } from "./parseRequestBody.js";

//
// Function
//

export type CreateEndpointRouteOptions
<
	RouteFritterContext extends Fritter.RouterMiddleware.MiddlewareFritterContext & Fritter.BodyParserMiddleware.MiddlewareFritterContext,
	RequestBodySchema extends z.ZodSchema,
	ResponseBodySchema extends z.ZodSchema
> =
{
	method: "GET" | "POST",
	path: Fritter.RouterMiddleware.Route<RouteFritterContext>["path"];
	middlewares: Fritter.RouterMiddleware.Route<RouteFritterContext>["middlewares"];
	requestBodySchema: RequestBodySchema;
	responseBodySchema: ResponseBodySchema;
	handler: (requestBody: z.infer<RequestBodySchema>, context: RouteFritterContext) => Promise<z.infer<ResponseBodySchema>>;
};

export function createEndpointRoute
<
	RouteFritterContext extends Fritter.RouterMiddleware.MiddlewareFritterContext & Fritter.BodyParserMiddleware.MiddlewareFritterContext, 
	RequestBodySchema extends z.ZodSchema, 
	ResponseBodySchema extends z.ZodSchema
>
(
	options: CreateEndpointRouteOptions<RouteFritterContext, RequestBodySchema, ResponseBodySchema>
): Fritter.RouterMiddleware.Route<RouteFritterContext>
{
	return {
		method: options.method,
		path: options.path,
		middlewares: options.middlewares,
		handler: async (context) =>
		{
			context.fritterResponse.setContentType("applicaton/json");

			try
			{
				let rawRequestBody: Fritter.BodyParserMiddleware.RequestBody;

				if (options.method == "GET")
				{
					try
					{
						rawRequestBody = JSON.parse(context.fritterRequest.getSearchParams().get("requestBody") ?? "{}");
					}
					catch (error)
					{
						rawRequestBody = {};
					}
				}
				else
				{
					rawRequestBody = await context.getRequestBody();
				}

				const { requestBody, errorResponseBody } = parseRequestBody(options.requestBodySchema, rawRequestBody);

				if (errorResponseBody != null)
				{
					context.fritterResponse.setBody(errorResponseBody);
					context.fritterResponse.setStatusCode(400);
		
					return;
				}

				const rawResponseBody = await options.handler(requestBody, context);

				const responseBody = options.responseBodySchema.parse(rawResponseBody);

				context.fritterResponse.setBody(responseBody);
			}
			catch (error)
			{
				if (error instanceof APIError)
				{
					context.fritterResponse.setStatusCode(error.statusCode);

					return context.fritterResponse.setBody(error.errorResponseBody);
				}

				throw error;
			}
		},
	};
}