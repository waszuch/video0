import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";
import AnimatedLogo from "@/components/AnimatedLogo";
import { HeroButton } from "@/components/HeroButton";

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
			<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-archivo relative overflow-hidden">
				<div className="absolute inset-0 bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.2)_0%,rgba(0,0,0,0)_75%)]" />
				<div className="max-w-md w-full bg-zinc-900 rounded-lg shadow-xl p-6 space-y-6 relative z-10 my-8">
					<div className="flex justify-center items-center mb-4">
						<Link href="/">
							<AnimatedLogo />
						</Link>
					</div>

					<h1 className="text-3xl font-bold text-center bg-gradient-to-br from-white via-gray-300 to-gray-500 text-transparent bg-clip-text">
						{asset.title}
					</h1>

					<audio src={songData.songUrl} controls className="w-full">
						<track kind="captions" />
						Your browser does not support the audio element.
					</audio>

					<div className="bg-zinc-800 rounded-lg p-4 border border-purple-700/20">
						<h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
							Lyrics:
						</h2>
						<div className="whitespace-pre-line text-gray-300">
							{songData.lyrics}
						</div>
					</div>

					<div className="flex justify-center w-full">
						<HeroButton href="/login" textSize="text-lg">
							Create your own birthday song
						</HeroButton>
					</div>
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
			<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-archivo relative overflow-hidden">
				<div className="absolute inset-0 bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.2)_0%,rgba(0,0,0,0)_75%)]" />
				<div className="max-w-md w-full bg-zinc-900 rounded-lg shadow-xl p-6 space-y-6 relative z-10 my-8">
					<div className="flex justify-center items-center mb-4">
						<Link href="/">
							<AnimatedLogo />
						</Link>
					</div>
					
					<h1 className="text-3xl font-bold text-center bg-gradient-to-br from-white via-gray-300 to-gray-500 text-transparent bg-clip-text">
						{asset.title}
					</h1>

					<video
						src={videoData.videoUrl}
						controls
						className="w-full rounded-lg"
					>
						<track kind="captions" />
						Your browser does not support the video element.
					</video>

					<div className="bg-zinc-800 rounded-lg p-4 border border-purple-700/20">
						<h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
							Lyrics:
						</h2>
						<div className="whitespace-pre-line text-gray-300">
							{videoData.lyrics}
						</div>
					</div>

					<div className="flex justify-center w-full">
						<HeroButton href="/login" textSize="text-xl">
							Create your own birthday video
						</HeroButton>
					</div>
				</div>
			</div>
		);
	}
}
