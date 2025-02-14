### CAUTION

Server actions are still exported and built into the client bundle with unique
ids. As such, they should still be treated as HTTP endpoints and should have
proper authentication and authorization checks in place. While Next.js does some optimizations to prevent the client from accessing these endpoints, it is still possible to access them if the client is determined enough.

For this particular project, we are creating a simple project with no login
functionality, so we are not implementing any authentication or authorization

For more information, please visit the official Next.js documentation on this
https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#authentication-and-authorization
