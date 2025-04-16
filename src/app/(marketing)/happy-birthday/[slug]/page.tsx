import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";

export default async function HappyBirthday({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const id = slug.split("-").pop();

	if (!id) {
		redirect("/");
	}

	const asset = await db.query.generatedAssets.findFirst({
		where: (generatedAssets, { eq }) => eq(generatedAssets.id, id),
	});

	if (!asset) {
		notFound();
	}

	if (asset.type === "birthdaySong") {
		const songData = asset.data as {
			songUrl: string;
			lyrics: string;
			type: "birthdaySong";
		};

		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 space-y-6">
					<h1 className="text-3xl font-bold text-center text-purple-600">
						{asset.title}
					</h1>

					<div className="bg-purple-50 rounded-lg p-4">
						<h2 className="text-lg font-semibold mb-2 text-purple-700">
							Listen to the birthday song:
						</h2>
						<audio src={songData.songUrl} controls className="w-full">
							<track kind="captions" />
							Your browser does not support the audio element.
						</audio>
					</div>

					<div className="bg-blue-50 rounded-lg p-4">
						<h2 className="text-lg font-semibold mb-2 text-blue-700">
							Lyrics:
						</h2>
						<div className="whitespace-pre-line text-gray-700">
							{songData.lyrics}
						</div>
					</div>

					<Link
						href="/login"
						className="block w-full text-center py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
					>
						Create your own birthday song
					</Link>
				</div>
			</div>
		);
	}

	if (asset.type === "birthdayVideo") {
		const videoData = asset.data as {
			videoUrl: string;
			imagesUrl: string[];
			songUrl: string;
			lyrics: string;
			type: "birthdayVideo";
		};

		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 space-y-6">
					<h1 className="text-3xl font-bold text-center text-purple-600">
						{asset.title}
					</h1>

					<div className="bg-purple-50 rounded-lg p-4">
						<h2 className="text-lg font-semibold mb-2 text-purple-700">
							Watch the birthday video:
						</h2>
						<video
							src={videoData.videoUrl}
							controls
							className="w-full rounded-lg"
						>
							<track kind="captions" />
							Your browser does not support the video element.
						</video>
					</div>

					<div className="bg-blue-50 rounded-lg p-4">
						<h2 className="text-lg font-semibold mb-2 text-blue-700">
							Lyrics:
						</h2>
						<div className="whitespace-pre-line text-gray-700">
							{videoData.lyrics}
						</div>
					</div>

					<Link
						href="/login"
						className="block w-full text-center py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
					>
						Create your own birthday video
					</Link>
				</div>
			</div>
		);
	}
}
