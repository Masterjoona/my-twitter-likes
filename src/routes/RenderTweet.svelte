<script lang="ts">
	import type { Author, Tweet } from './types';
	export let tweet: Tweet;
	export let lookUpAuthor: (userId: string) => Author;

	const yesOrNo = (value: boolean) => (value ? 'Yes' : 'No');
	const author = lookUpAuthor(tweet?.user_id_str)?.legacy || {
		name: 'Unknown',
		screen_name: 'unknown'
	};
</script>

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
		<p class="tweet-author">
			{author?.name} (@{author?.screen_name})
		</p>
		<p class="tweet-id">Tweet ID: {tweet?.id_str}</p>
		<p>
			Likes: {tweet?.favorite_count} | Retweets: {tweet?.retweet_count} | Bookmarks: {tweet?.bookmark_count}
		</p>
		<p>
			Liked: {yesOrNo(tweet?.favorited)} | Retweeted: {yesOrNo(tweet?.retweeted)} | Bookmarked:
			{yesOrNo(tweet?.bookmarked)}
		</p>
		<p>Created at: {new Date(tweet?.created_at).toLocaleString()}</p>
	</div>
	<div class="tweet-content">
		<p>{tweet?.full_text || 'No content'}</p>
		{#if tweet?.extended_entities?.media}
			<div class="media-container">
				{#each tweet.extended_entities.media as media}
					{#if media.type === 'photo'}
						<div class="media-item">
							<img src={media.media_url_https} alt="some tweet media" class="tweet-image" />
						</div>
					{:else if media.type === 'video'}
						<div class="media-item">
							<video controls class="tweet-video">
								<source
									src={media.video_info.variants[media.video_info.variants.length - 1].url}
									type="video/mp4"
								/>
								<track kind="captions" />
							</video>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
	{#if tweet?.quoted_status_result}
		<svelte:self tweet={tweet.quoted_status_result} {lookUpAuthor} />
	{/if}
</article>

<style>
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

	.tweet-author {
		font-weight: bold;
	}

	.tweet-content {
		margin-top: 10px;
	}

	@media (max-width: 600px) {
		.tweet-card {
			padding: 15px;
		}
	}

	.tweet-image {
		max-width: 100%;
		height: auto;
		margin-top: 10px;
		border-radius: 5px;
	}
	.tweet-video {
		max-width: 100%;
		height: auto;
		margin-top: 10px;
		border-radius: 5px;
	}
</style>
