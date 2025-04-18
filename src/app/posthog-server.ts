// app/posthog-server.js

import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null = null;

export function getPostHogServer() {
	if (!posthogInstance) {
		posthogInstance = new PostHog(
			"phc_Hp5YtGXOdsfzz3BTMZcI2h556t125bTcOHgH0oplfep",
			{
				host: "https://us.i.posthog.com",
				flushAt: 1,
				flushInterval: 0,
			},
		);
	}
	return posthogInstance;
}
