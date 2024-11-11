//
// Imports
//

import { z } from "zod";

import { MessageSchema } from "./Message.js";

//
// Types
//

export type ErrorResponseBody = z.infer<typeof ErrorResponseBodySchema>;

export const ErrorResponseBodySchema = z.object(
	{
		success: z.literal(false),
		errors: z.array(MessageSchema),
	});