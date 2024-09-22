<script lang="ts">
	import { onMount } from 'svelte';
	import type { Tweet } from './types';

	const batchSize = 20;

	let tweets: Tweet[] = [];
	let displayedTweets: Tweet[] = [];
	let currentBatch = 1;
	let searchQuery = '';
	let searchMatching = 0;
	let timeout: number;

	const handleFileInput = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				const result = e.target?.result as string;
				parseFile(result);
			};
			reader.readAsText(file);
		}
	};

	const parseFile = (result: string) => {
		try {
			const data = JSON.parse(result);
			tweets = data.tweets;
			resetDisplay();
		} catch (error) {
			console.error('Error parsing JSON:', error);
		}
	};

	const resetDisplay = () => {
		currentBatch = 1;
		displayedTweets = tweets.slice(0, batchSize);
	};

	const loadMoreTweets = () => {
		const start = currentBatch * batchSize;
		const end = start + batchSize;

		const filteredTweets =
			searchQuery.length >= 3
				? tweets.filter(
						(tweet) =>
							tweet?.full_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
							tweet?.id_str.includes(searchQuery)
					)
				: tweets;

		const nextBatch = filteredTweets.slice(start, end);
		displayedTweets = [...displayedTweets, ...nextBatch];
		if (nextBatch.length > 0) currentBatch += 1;
	};

	const handleScroll = () => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
			loadMoreTweets();
		}
	};

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const handleSearch = () => {
		clearTimeout(timeout);
		if (searchQuery.length < 3) {
			resetDisplay();
			return;
		}
		timeout = setTimeout(() => filterTweets(), 300);
	};

	const filterTweets = () => {
		const filteredTweets = tweets.filter(
			(tweet) =>
				tweet?.full_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				tweet?.id_str.includes(searchQuery)
		);
		searchMatching = filteredTweets.length;
		displayedTweets = filteredTweets.slice(0, batchSize);
		currentBatch = 1;
	};

	const yesOrNo = (value: boolean) => (value ? 'Yes' : 'No');
</script>

<main>
	{#if !tweets.length}
		<p>upload a json :3</p>
		<p>read the readme for how to get the one</p>
	{/if}
	<input type="file" accept=".json" on:change={handleFileInput} />
	<input
		type="text"
		placeholder="Search tweets (3 chars)"
		bind:value={searchQuery}
		on:input={handleSearch}
	/>
	{#if searchMatching > 0}
		<p>Showing {displayedTweets.length} of {searchMatching} matching tweets</p>
	{/if}

	{#if displayedTweets.length > 0}
		<div class="tweet-grid">
			{#each displayedTweets as tweet}
				<article class="tweet-card" data-tweet={JSON.stringify(tweet)}>
					<a
						href={`https://twitter.com/i/web/status/${tweet?.id_str}`}
						target="_blank"
						rel="noopener noreferrer"
						class="tweet-link"
					>
						View Tweet
					</a>
					<div class="tweet-header">
						<p class="tweet-id">Tweet ID: {tweet?.id_str}</p>
						<p>
							Likes: {tweet?.favorite_count} | Retweets: {tweet?.retweet_count} | Bookmarks: {tweet?.bookmark_count}
						</p>
						<p>
							Liked: {yesOrNo(tweet?.favorited)} | Retweeted: {yesOrNo(tweet?.retweeted)} | Bookmarked:
							{yesOrNo(tweet?.bookmarked)} | Quoted: {yesOrNo(tweet?.is_quote_status)}
						</p>
						<p>Created at: {new Date(tweet?.created_at).toLocaleString()}</p>
					</div>
					<div class="tweet-content">
						<p>{tweet?.full_text || 'No content'}</p>
						{#if tweet?.extended_entities?.media}
							<div class="media">
								{#each tweet.extended_entities.media as media}
									{#if media.type === 'photo'}
										<img src={media.media_url_https} alt="Tweet" class="tweet-image" />
									{:else if media.type === 'video'}
										<video controls class="tweet-video">
											<source
												src={media.video_info.variants[media.video_info.variants.length - 1].url}
												type="video/mp4"
											/>
											<track kind="captions" />
											Your browser does not support the video tag.
										</video>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		padding: 20px;
		font-family: Arial, sans-serif;
	}
	.tweet-video {
		max-width: 100%;
		height: auto;
		margin-top: 10px;
		border-radius: 5px;
	}
	.tweet-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}
	.tweet-card {
		border: 1px solid #ddd;
		padding: 20px;
		border-radius: 8px;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.tweet-header {
		font-size: 14px;
		color: #555;
	}
	.tweet-content {
		margin-top: 10px;
	}
	.tweet-image {
		max-width: 100%;
		height: auto;
		margin-top: 10px;
		border-radius: 5px;
	}
	@media (max-width: 600px) {
		.tweet-card {
			padding: 15px;
		}
	}
</style>
