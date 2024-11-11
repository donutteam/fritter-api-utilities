//
// Imports
//

import { z } from "zod";

//
// Types
//

export type Message = z.infer<typeof MessageSchema>;

export const MessageSchema = z.object(
	{
		code: z.string(),
		message: z.string(),
	});