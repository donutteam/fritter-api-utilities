//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema } from "./ErrorResponseBody.js";
import { SuccessResponseBodySchema } from "./SuccessResponseBody.js";

//
// Types
//

export type ResponseBody = z.infer<typeof ResponseBodySchema>;

export const ResponseBodySchema = z.union([ ErrorResponseBodySchema, SuccessResponseBodySchema ]);
