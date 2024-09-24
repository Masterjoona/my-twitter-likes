<script lang="ts">
	import { onMount } from 'svelte';

	import RenderTweet from './RenderTweet.svelte';
	import type { Author, Tweet } from './types';

	const batchSize = 20;

	let tweets: Tweet[] = [];
	let authors: Record<string, Author> = {};
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
			authors = data.authors;
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
			console.log('loading more tweets');
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
		const filteredTweets = tweets.filter((tweet) =>
			tweet?.full_text?.toLowerCase().includes(searchQuery.toLowerCase())
		);
		searchMatching = filteredTweets.length;
		displayedTweets = filteredTweets.slice(0, batchSize);
		currentBatch = 1;
	};

	const lookUpAuthor = (userId: string) => authors[userId];
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
				<RenderTweet {tweet} {lookUpAuthor} />
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		padding: 20px;
		font-family: Arial, sans-serif;
	}
	.tweet-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}
</style>
