export interface Author {
    __typename: string
    id: string
    rest_id: string
    affiliates_highlighted_label: unknown
    has_graduated_access: boolean
    is_blue_verified: boolean
    profile_image_shape: string
    legacy: Legacy
    tipjar_settings: unknown
}

export interface Legacy {
    following: boolean
    can_dm: boolean
    can_media_tag: boolean
    created_at: string
    default_profile: boolean
    default_profile_image: boolean
    description: string
    entities: { description: { urls: unknown[] } }
    fast_followers_count: number
    favourites_count: number
    followers_count: number
    friends_count: number
    has_custom_timelines: boolean
    is_translator: boolean
    listed_count: number
    location: string
    media_count: number
    name: string
    normal_followers_count: number
    pinned_tweet_ids_str: string[]
    possibly_sensitive: boolean
    profile_banner_url: string
    profile_image_url_https: string
    profile_interstitial_type: string
    screen_name: string
    statuses_count: number
    translator_type: string
    verified: boolean
    want_retweets: boolean
    withheld_in_countries: unknown[]
}

export interface Tweet {
    bookmark_count: number
    bookmarked: boolean
    created_at: string
    conversation_id_str: string
    display_text_range: number[]
    entities: Entities
    extended_entities: { media: Medum[] }
    favorite_count: number
    favorited: boolean
    full_text: string
    is_quote_status: boolean
    lang: string
    possibly_sensitive: boolean
    possibly_sensitive_editable: boolean
    quote_count: number
    reply_count: number
    retweet_count: number
    retweeted: boolean
    user_id_str: string
    id_str: string

    // added by us
    quoted_status_result?: Tweet
}

export interface Entities {
    hashtags: unknown[]
    media: Medum[]
    symbols: unknown[]
    timestamps: unknown[]
    urls: unknown[]
    user_mentions: unknown[]
}

export interface Medum {
    display_url: string
    expanded_url: string
    id_str: string
    indices: number[]
    media_key: string
    media_url_https: string
    type: string
    url: string
    ext_media_availability: { status: string }
    features: Features
    sizes: Sizes
    original_info: OriginalInfo
    allow_download_status: { allow_download: boolean }
    media_results: { result: { media_key: string } }
    video_info: VideoInfo
}


export interface Features {
    large: Feature
    medium: Feature
    small: Feature
    orig: Feature
}

export interface Feature {
    faces: unknown[]
}

export interface Sizes {
    large: GenericSize
    medium: GenericSize
    small: GenericSize
    thumb: GenericSize
}

export interface GenericSize {
    h: number
    w: number
    resize: string
}

export interface OriginalInfo {
    height: number
    width: number
    focus_rects: FocusRect[]
}

export interface FocusRect {
    x: number
    y: number
    w: number
    h: number
}

export interface VideoInfo {
    aspect_ratio: number[]
    duration_millis: number
    variants: Variant[]
}

export interface Variant {
    content_type: string
    url: string
    bitrate?: number
}