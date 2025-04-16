import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const url = request.nextUrl;

	// Posthog  -----------------------------------------------------------------
	if (url.pathname.startsWith("/ingest-internal-service/")) {
		const posthogUrl = request.nextUrl.clone();
		const hostname = posthogUrl.pathname.startsWith(
			"/ingest-internal-service/static/",
		)
			? "us-assets.i.posthog.com"
			: "us.i.posthog.com";
		const requestHeaders = new Headers(request.headers);

		requestHeaders.set("host", hostname);

		posthogUrl.protocol = "https";
		posthogUrl.hostname = hostname;
		posthogUrl.port = "443";
		posthogUrl.pathname = posthogUrl.pathname.replace(
			/^\/ingest-internal-service/,
			"",
		);
		console.info("user redirected to posthog");

		return NextResponse.rewrite(posthogUrl, {
			headers: requestHeaders,
		});
	}
	// Posthog end ------------------------------------------------------------------------------

	return NextResponse.next({
		request,
	});
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
	],
};
