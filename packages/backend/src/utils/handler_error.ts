import { AuthenticationError } from "./error_utils/authentication_error";
import { NotFoundError } from "./error_utils/not_found_error";
import { UserInputError } from "./error_utils/user_error_input";

// Error handler helper
export const handleError = (error: any) => {
  if (error instanceof AuthenticationError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (error instanceof NotFoundError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (error instanceof UserInputError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Internal server error" }), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
};