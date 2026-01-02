import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Protect all routes except sign-in and sign-up
  publicRoutes: ['/sign-in', '/sign-up'],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

