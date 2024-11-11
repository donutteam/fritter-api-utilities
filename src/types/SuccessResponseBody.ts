//
// Imports
//

import { z } from "zod";

import { MessageSchema } from "./Message.js";

//
// Types
//

export type SuccessResponseBody = z.infer<typeof SuccessResponseBodySchema>;

export const SuccessResponseBodySchema = z.object(
	{
		success: z.literal(true),
		warnings: z.array(MessageSchema).optional(),
	});