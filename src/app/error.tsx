// app/error.jsx
"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		posthog.captureException(error);
	}, [error]);

	return (
		<div>
			<h1>Something went wrong!</h1>
			<p>We've logged this error and will look into it.</p>
			{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
			<button onClick={() => reset()}>Try again</button>
		</div>
	);
}
