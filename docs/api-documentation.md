# API Documentation

Base URL: `/api`

All APIs return JSON responses. Successful responses wrap data in a `data` field. Errors return an `error` field with a human-readable message.

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "pagination": {        // included on paginated endpoints
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "error": "Human-readable error message"
}
```

---

## Pagination

Paginated endpoints accept these query parameters:

| Parameter | Type   | Default | Max | Description                  |
|-----------|--------|---------|-----|------------------------------|
| `limit`   | number | 10      | 50  | Number of items per page     |
| `offset`  | number | 0       | --  | Number of items to skip      |

The response includes a `pagination` object:

- `total` -- Total number of matching items
- `limit` -- Applied limit
- `offset` -- Applied offset
- `hasMore` -- `true` if there are more items beyond the current page

**Example: Fetching page 3 with 20 items per page:**

```
?limit=20&offset=40
```

---

## Caching

| Endpoint                          | ISR (s-maxage) | stale-while-revalidate |
|-----------------------------------|----------------|------------------------|
| `GET /api/categories`             | 3600s (1h)     | 600s (10min)           |
| `GET /api/categories/[slug]`      | 3600s (1h)     | 600s (10min)           |
| `GET /api/kols/[username]`        | 3600s (1h)     | 600s (10min)           |
| `GET /api/kols/[username]/tweets` | 3600s (1h)     | 600s (10min)           |
| `GET /api/search`                 | 60s (1min)     | 30s                    |

---

## Error Codes

| HTTP Status | Meaning                                    |
|-------------|--------------------------------------------|
| 200         | Success                                    |
| 400         | Bad request (missing required parameters)  |
| 404         | Resource not found                         |
| 500         | Internal server error                      |

---

## Endpoints

### 1. GET /api/categories

Returns all categories sorted by display order.

**Parameters:** None

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "AI & Machine Learning",
      "slug": "ai-ml",
      "description": "AI and ML thought leaders",
      "icon": "brain",
      "sort_order": 1,
      "kol_count": 25,
      "tweet_count": 500,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 7
}
```

**curl Example:**

```bash
curl http://localhost:3000/api/categories
```

**Source:** `app/api/categories/route.ts`

---

### 2. GET /api/categories/[slug]

Returns a category's details along with its paginated KOL list.

**Path Parameters:**

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `slug`    | string | Yes      | Category URL slug |

**Query Parameters:**

| Parameter | Type   | Default | Max | Description            |
|-----------|--------|---------|-----|------------------------|
| `limit`   | number | 10      | 50  | KOLs per page          |
| `offset`  | number | 0       | --  | Number of KOLs to skip |

**Response (200):**

```json
{
  "data": {
    "category": {
      "id": "uuid",
      "name": "AI & Machine Learning",
      "slug": "ai-ml",
      "description": "AI and ML thought leaders",
      "icon": "brain",
      "sort_order": 1,
      "kol_count": 25,
      "tweet_count": 500,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    "kols": [
      {
        "id": "uuid",
        "twitter_id": "123456789",
        "username": "elonmusk",
        "display_name": "Elon Musk",
        "bio": "...",
        "avatar_url": "https://pbs.twimg.com/...",
        "followers": 180000000,
        "following": 500,
        "tweet_total": 30000,
        "categories": ["ai-ml", "tech-founders"],
        "tags": ["CEO", "Tesla", "SpaceX"],
        "profile_url": "https://x.com/elonmusk",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  },
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Response (404):**

```json
{
  "error": "Category not found"
}
```

**curl Examples:**

```bash
# First page, default 10 items
curl http://localhost:3000/api/categories/ai-ml

# Page 2, 20 items per page
curl "http://localhost:3000/api/categories/ai-ml?limit=20&offset=20"
```

**Source:** `app/api/categories/[slug]/route.ts`

---

### 3. GET /api/kols/[username]

Returns the full profile of a single KOL.

**Path Parameters:**

| Parameter  | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| `username` | string | Yes      | Twitter/X username   |

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "twitter_id": "123456789",
    "username": "elonmusk",
    "display_name": "Elon Musk",
    "bio": "...",
    "avatar_url": "https://pbs.twimg.com/...",
    "followers": 180000000,
    "following": 500,
    "tweet_total": 30000,
    "categories": ["ai-ml", "tech-founders"],
    "tags": ["CEO", "Tesla", "SpaceX"],
    "profile_url": "https://x.com/elonmusk",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Response (404):**

```json
{
  "error": "KOL not found"
}
```

**curl Example:**

```bash
curl http://localhost:3000/api/kols/elonmusk
```

**Source:** `app/api/kols/[username]/route.ts`

---

### 4. GET /api/kols/[username]/tweets

Returns a paginated list of tweets from a specific KOL, sorted by newest first.

**Path Parameters:**

| Parameter  | Type   | Required | Description        |
|------------|--------|----------|--------------------|
| `username` | string | Yes      | Twitter/X username |

**Query Parameters:**

| Parameter | Type   | Default | Max | Description              |
|-----------|--------|---------|-----|--------------------------|
| `limit`   | number | 10      | 50  | Tweets per page          |
| `offset`  | number | 0       | --  | Number of tweets to skip |

**Response (200):**

```json
{
  "data": {
    "kol": {
      "username": "elonmusk",
      "display_name": "Elon Musk"
    },
    "tweets": [
      {
        "id": "uuid",
        "tweet_id": "1234567890123456789",
        "kol_username": "elonmusk",
        "content": "Tweet content here...",
        "media_urls": ["https://pbs.twimg.com/media/..."],
        "likes": 50000,
        "retweets": 10000,
        "replies": 5000,
        "views": 2000000,
        "tweet_time": "2026-02-15T12:00:00.000Z",
        "tweet_url": "https://x.com/elonmusk/status/1234567890123456789",
        "is_retweet": false,
        "is_reply": false,
        "created_at": "2026-02-15T12:05:00.000Z"
      }
    ]
  },
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Response (404):**

```json
{
  "error": "KOL not found"
}
```

**curl Examples:**

```bash
# Latest tweets, default pagination
curl http://localhost:3000/api/kols/elonmusk/tweets

# Page 3, 20 tweets per page
curl "http://localhost:3000/api/kols/elonmusk/tweets?limit=20&offset=40"
```

**Source:** `app/api/kols/[username]/tweets/route.ts`

---

### 5. GET /api/search

Searches across KOLs and tweets by keyword. Matches against KOL names, usernames, bios, and tweet content (case-insensitive).

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                              |
|-----------|--------|----------|---------|------------------------------------------|
| `q`       | string | Yes      | --      | Search keyword                           |
| `type`    | string | No       | `all`   | Filter results: `all`, `kols`, `tweets`  |
| `limit`   | number | No       | 10      | Max results per type (max 50)            |

**Response (200) -- type=all:**

```json
{
  "data": {
    "kols": [
      {
        "id": "uuid",
        "username": "elonmusk",
        "display_name": "Elon Musk",
        "bio": "...",
        "avatar_url": "https://pbs.twimg.com/...",
        "followers": 180000000,
        "following": 500,
        "tweet_total": 30000,
        "categories": ["ai-ml"],
        "tags": ["CEO"],
        "profile_url": "https://x.com/elonmusk",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "tweets": [
      {
        "id": "uuid",
        "tweet_id": "1234567890123456789",
        "kol_username": "elonmusk",
        "content": "Content matching the query...",
        "media_urls": [],
        "likes": 50000,
        "retweets": 10000,
        "replies": 5000,
        "views": 2000000,
        "tweet_time": "2026-02-15T12:00:00.000Z",
        "tweet_url": "https://x.com/elonmusk/status/1234567890123456789",
        "is_retweet": false,
        "is_reply": false,
        "created_at": "2026-02-15T12:05:00.000Z"
      }
    ]
  },
  "query": "AI",
  "type": "all"
}
```

**Response (200) -- type=kols:**

```json
{
  "data": {
    "kols": [ ... ]
  },
  "query": "AI",
  "type": "kols"
}
```

**Response (400):**

```json
{
  "error": "Missing search query parameter: q"
}
```

**curl Examples:**

```bash
# Search everything
curl "http://localhost:3000/api/search?q=AI"

# Search KOLs only, max 20 results
curl "http://localhost:3000/api/search?q=machine+learning&type=kols&limit=20"

# Search tweets only
curl "http://localhost:3000/api/search?q=GPT&type=tweets"
```

**Source:** `app/api/search/route.ts`

---

## Data Types

### Category

| Field        | Type   | Description                     |
|--------------|--------|---------------------------------|
| id           | string | UUID primary key                |
| name         | string | Display name                    |
| slug         | string | URL-friendly identifier         |
| description  | string | Category description            |
| icon         | string | Icon identifier                 |
| sort_order   | number | Display sort order              |
| kol_count    | number | Number of KOLs in this category |
| tweet_count  | number | Number of tweets in this category |
| created_at   | string | ISO 8601 timestamp              |
| updated_at   | string | ISO 8601 timestamp              |

### KOL

| Field        | Type     | Description                       |
|--------------|----------|-----------------------------------|
| id           | string   | UUID primary key                  |
| twitter_id   | string   | Twitter/X user ID                 |
| username     | string   | Twitter/X handle (without @)      |
| display_name | string   | Display name                      |
| bio          | string   | Profile bio                       |
| avatar_url   | string   | Profile picture URL               |
| followers    | number   | Follower count                    |
| following    | number   | Following count                   |
| tweet_total  | number   | Total tweet count                 |
| categories   | string[] | Category slugs this KOL belongs to |
| tags         | string[] | Descriptive tags                  |
| profile_url  | string   | Full Twitter/X profile URL        |
| created_at   | string   | ISO 8601 timestamp                |
| updated_at   | string   | ISO 8601 timestamp                |

### Tweet

| Field        | Type     | Description                    |
|--------------|----------|--------------------------------|
| id           | string   | UUID primary key               |
| tweet_id     | string   | Twitter/X tweet ID             |
| kol_username | string   | Author's Twitter/X username    |
| content      | string   | Tweet text content             |
| media_urls   | string[] | Attached media URLs            |
| likes        | number   | Like count                     |
| retweets     | number   | Retweet count                  |
| replies      | number   | Reply count                    |
| views        | number   | View count                     |
| tweet_time   | string   | Original tweet timestamp (ISO) |
| tweet_url    | string   | Full URL to the tweet          |
| is_retweet   | boolean  | Whether this is a retweet      |
| is_reply     | boolean  | Whether this is a reply        |
| created_at   | string   | Record creation timestamp      |
