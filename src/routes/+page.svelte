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
		loadTweets();
	};

	const isRegex = (query: string): boolean => {
		return query.startsWith('/') && query.lastIndexOf('/') > 0;
	};

	const applySearchFilter = (): Tweet[] => {
		if (searchQuery.length < 3) return tweets;

		if (isRegex(searchQuery)) {
			try {
				const lastSlash = searchQuery.lastIndexOf('/');
				const flags = searchQuery.slice(lastSlash + 1);
				const toRegex = searchQuery.slice(1, lastSlash);
				console.log('Regex:', toRegex, flags);
				const regex = new RegExp(toRegex, flags);
				return tweets.filter((tweet) => regex.test(tweet?.full_text));
			} catch (error) {
				console.error('Invalid regex:', error);
				return [];
			}
		} else {
			return tweets.filter((tweet) =>
				tweet?.full_text?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
	};

	const loadTweets = () => {
		const filteredTweets = applySearchFilter();
		const start = (currentBatch - 1) * batchSize;
		const nextBatch = filteredTweets.slice(start, start + batchSize);

		if (currentBatch === 1) {
			displayedTweets = nextBatch;
		} else {
			displayedTweets = [...displayedTweets, ...nextBatch];
		}

		searchMatching = filteredTweets.length;
		if (nextBatch.length > 0) currentBatch += 1;
	};

	const handleScroll = () => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
			loadTweets();
		}
	};

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const handleSearch = () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			currentBatch = 1;
			loadTweets();
		}, 300);
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
	<span> (use /regex/flags for regex search)</span>

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
