//
// Imports
//

import { ErrorResponseBody } from "../types/ErrorResponseBody.js";
import { Message } from "../types/Message.js";

//
// Class
//

export class APIError extends Error
{
	errors: Message[];

	statusCode: number;

	errorResponseBody: ErrorResponseBody;

	constructor(errorOrErrors: Message | Message[], statusCode = 400)
	{
		super("API Error");

		this.errors = Array.isArray(errorOrErrors) ? errorOrErrors : [ errorOrErrors ];

		this.statusCode = statusCode;

		this.errorResponseBody =
		{
			success: false,
			errors: this.errors,
		};
	}
}