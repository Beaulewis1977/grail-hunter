# Technical Blueprint: The 'SneakerMeta' Orchestrator Actor

I. Strategic Pivot: A Blueprint for an Eligible, Challenge-Winning Actor

This section outlines a critical, non-negotiable course correction to the initial project scope.
This pivot is foundational to ensuring the resulting Actor is eligible to compete and win the Apify
Challenge.

A. The Critical Flaw: Ineligibility of Core Targets

The initial project brief identified Facebook Marketplace as a key target. A meticulous review of
the Apify Challenge judging criteria and rules reveals a direct conflict that invalidates this
approach.1 The official rules explicitly state that Actors performing scraping functions on a
specific list of services are "not eligible for rewards". This list includes, among others, Facebook
and Instagram.1 This finding is paramount. Any Actor developed according to the original plan, which
relies on scraping Facebook, would be immediately and automatically disqualified from all prize
consideration. Therefore, a strategic pivot is not optional; it is the first and most critical step
toward success. All reliance on ineligible platforms must be completely removed from the development
plan.

B. The Winning Pivot: The 'SneakerMeta' Orchestrator Model

The user's core vision—a "whole, all in one actor"—remains the correct product strategy. The flaw
was not in the vision, but in the selection of ineligible targets. The revised, winning strategy is
to pivot from a simple, multi-target scraper to a sophisticated Aggregator & Orchestrator Actor.
This design provides geometrically greater value to the end-user and directly targets the explicit
judging criteria for the Apify Challenge's Grand Prize 1: Novelty, Usefulness, and Real-World Value:
The Apify Store features numerous single-site scrapers for platforms like GOAT, eBay, and Grailed.2
The "all-in-one" orchestrator provides a "10x" value proposition by unifying all eligible platforms
into a single, deduplicated, and intelligent feed. The user runs one Actor, not eight, to solve
their problem. Technical Excellence: This architecture is inherently more complex and demonstrates a
higher level of technical mastery. It involves a "meta-actor" structure: Actor-to-Actor Calls:
Programmatically calling and integrating with other existing, eligible, and maintained Actors from
the Apify Store. Custom Scraping Modules: Building new, proprietary scraping logic for eligible
high-value platforms that currently lack a public Actor. Data Aggregation & Normalization: Ingesting
and standardizing data from dozens of disparate sources, each with its own data structure. Advanced
Data Processing: Running all normalized results through an advanced parsing and deduplication engine
to filter for signal (new deals) vs. noise (old listings). This "Orchestrator" model respects the
existing Apify ecosystem by building upon it, rather than wastefully rebuilding it. It focuses
development effort on net-new value—the aggregation, the intelligence, and the scraping of new
"white space" targets.

C. Redefining the Target List: The Eligible Ecosystem

With the pivot to an eligible, compliant model, the target list is redefined. This revised ecosystem
is vast, data-rich, and provides more than enough high-value targets for a winning Actor.
Authenticated Platforms: StockX, GOAT.2 Peer-to-Peer (P2P) Marketplaces: eBay 4, Grailed 3, Vinted
5, Depop 6, Poshmark. High-End Consignment: Flight Club, Stadium Goods.7 General Classifieds:
Craigslist, Gumtree (UK/Australia), Kijiji (Canada). This ecosystem is fully compliant with all
challenge rules and forms the foundation for the technical architecture outlined below.

II. The Sneaker Data Universe: Market, Terminology, and Data Modeling

To build an effective aggregator, the Actor must first understand the "language" of the market it
scrapes. It must be ableto deconstruct what it is looking for and how that data is described by the
target audience. This section defines the data dictionary and parsing logic.

A. Deconstructing the "Grails": Seed Data & Benchmarking

The Actor will be tested and benchmarked against high-value, "grail" sneakers. Data on these
sneakers provides the initial search terms and, more importantly, the pricing benchmarks for the
"Deal Scoring" feature. Seed Targets: The Air Jordan 1 (AJ1) is an iconic silhouette with numerous
high-value releases.9 Collaborations: Off-White™, Travis Scott, fragment design.9 Colorways: "Bred"
(Black/Red) 10, "Chicago" 9, "UNC".9 Benchmark Prices: This data provides a "market value" baseline.
Off-White™ x Nike Air Jordan 1 “Chicago”: $1,945 9 Off-White™ x Nike Air Jordan 1 “White” (EU
Exclusive): $1,956 9 fragment x Nike Air Jordan 1: $1,817 9 Travis Scott x Nike Air Jordan 1
“Reverse Swoosh”: $973 9 The integration of this price data is what elevates the Actor from a simple
scraper to an intelligent agent. A "deal" is defined as a listing priced significantly below this
established market value. The Actor's input will allow a user to set an alert_threshold_percentage
(e.g., 20%). If the Actor scrapes the benchmark price from an authenticated source like GOAT and
then finds a P2P listing for the same shoe at a price 20% or more below that benchmark, it will
trigger a high-priority "DEAL FOUND" alert. This feature alone directly addresses the "usefulness"
judging criterion.1

B. The Reseller's Lexicon: Parsing Unstructured Data

On authenticated platforms like StockX and GOAT, data is structured. On P2P and classified sites
like Grailed, Vinted, and Craigslist, critical data—namely a listing's condition—is buried within
unstructured title and description fields. The Actor must be able to parse this sneakerhead lexicon
to be useful. This terminology is the key to differentiating a new, valuable item from a worthless
one.10

Table 1: Sneakerhead Terminology & Parsing Logic

This table defines the mapping from unstructured sneakerhead slang to the standardized
listing.condition and listing.tags fields in the Actor's output schema. This is the core blueprint
for the "AI & Regex Parsing Engine" (Section V).

Slang/Abbreviation Full Meaning Example Usage Standardized condition Field Parsing Logic (Regex
Example) DS Deadstock "DS Bred 1s, never worn" 12 new_in_box /\b(ds|deadstock|bnib)\b/i BNIB Brand
New In Box "BNIB Travis Scott AJ1" 10 new_in_box /\b(ds|deadstock|bnib)\b/i VNDS Very Near Deadstock
"VNDS, worn 1x, 9.5/10" 13 used_like_new /\b(vnds)\b/i NDS Near Deadstock "NDS, see pics" 13
used_good /\b(nds)\b/i Worn Worn "Worn, 7/10 condition" 13 used_fair /\b(worn|beat|beaters)\b/i Beat
Beaters "Beaters, need restore" 13 used_poor /\b(worn|beat|beaters)\b/i OG Original "OG all,
includes box/laces" 14 (N/A, map to tags: ["og_all"]) /\b(og all|og box)\b/i Bred Black and Red
"Jordan 1 Bred" 10 (N/A, map to product.colorway: "Bred") /\b(bred)\b/i PE Player Edition "Rare Kobe
PE" 10 (N/A, map to tags: ["player_edition"]) /\b(pe)\b/i WTB / WTS Want to Buy / Want to Sell "WTB
Jordan 4s size 10" 10 (N/A, map to listing.type: "buy" or "sell") /\b(wtb|wts|wtt)\b/i

C. The Standardized Output Schema (Data Model)

To fulfill the "all-in-one" mandate, all data from all sources must be normalized into a single,
standard JSON structure. This is a non-negotiable core requirement for achieving a high "Actor
Quality Score".1 A defined output schema ensures the Actor's data is predictable, reliable, and
plug-and-play for other automated workflows. The full schema is detailed in Section IV.D.

III. Marketplace & Competitive Platform Analysis

This section maps the eligible ecosystem, analyzes the technical challenge of scraping each
platform, and identifies the existing competitive landscape on the Apify Store. A review of the
Apify Store and the user query reveals that existing Actors cover many key platforms, including
GOAT, eBay, Grailed, and Vinted.2 The "SneakerMeta" Actor's strategy is to orchestrate these
existing tools, calling them as sub-tasks. This approach reveals a key "white space" opportunity.
Several high-end, high-trust consignment platforms are not currently served by dedicated public
Actors on the Apify Store. Specifically, Flight Club and Stadium Goods 7 represent a significant
gap. By building new, robust scraping modules for these "white space" targets, the SneakerMeta Actor
provides net-new value to the Apify ecosystem, massively boosting its "novelty" and "usefulness"
scores for the challenge.1

Table 2: Marketplace Competitive & Technical Matrix

This matrix is the strategic guide for development. It dictates whether the Actor will call an
existing Actor (Orchestrate) or build a new scraping module (Innovate).

Marketplace URL Eligible? Existing Apify Actor? Recommended Action Scrape Method / Technical Notes
StockX stockx.com Yes Yes 2 Orchestrate Call existing Actor. Can also be scraped via hidden API
.../api/browse with proper headers.15 GOAT goat.com Yes Yes 2 Orchestrate Call existing
ecomscrape/goat-product-search-scraper. Data is high-quality and authenticated.2 eBay ebay.com Yes
Yes 4 Orchestrate Call existing getdataforme/ebay-scraper. Must filter for "Buy It Now" vs.
"Auction" and "Authenticity Guarantee." Craigslist craigslist.org Yes Yes (per user query)
Orchestrate Call existing "Craigslist Search Results Scraper." Input will be a list of city-specific
search URLs. Data is highly unstructured. OfferUp offerup.com Yes Yes (per user query) Orchestrate
Call existing "OfferUp Scraper." Requires location (ZIP code) and residential proxies. Grailed
grailed.com Yes Yes 3 Orchestrate Call existing vmscrapers/grailed. Data is semi-structured P2P.
Vinted vinted.com Yes Yes 5 Orchestrate Call existing louisdeconinck/vinted-scraper. Popular in EU
market. Flight Club flightclub.com Yes No (White Space) Innovate (Build New) High Priority. A key
"novelty" feature. Consignment model, data is authenticated.7 Stadium Goods stadiumgoods.com Yes No
(White Space) Innovate (Build New) High Priority. Sister site to Flight Club. High-value,
authenticated inventory.7 Depop depop.com Yes No (White Space) Innovate (Build New) Lower priority,
but good for "novelty".6 P2P, similar to Grailed. Poshmark poshmark.com Yes No (White Space)
InnovATE (Build New) Lower priority. Large US market, but less sneaker-focused. Facebook Mktpl.
facebook.com NO Yes (but irrelevant) EXCLUDE Disqualified per.1 Do not scrape. Instagram
instagram.com NO (N/A) EXCLUDE Disqualified per.1 Do not scrape.

IV. Technical Architecture: The 'SneakerMeta' Aggregator Blueprint

This section serves as the core "build document" detailing the Actor's structure, input/output
contracts, and operational logic.

A. Actor Input Schema (INPUT_SCHEMA.json)

A robust, validated input schema is a mandatory technical criterion for achieving the 65+ Actor
Quality Score.1 This schema is designed for maximum flexibility, user-friendliness, and power.

JSON

{ "title": "SneakerMeta Orchestrator Input", "type": "object", "schemaVersion": 1, "properties": {
"searchTerms": { "title": "Search Terms", "type": "array", "description": "Array of sneaker models
or keywords to search for (e.g., 'Air Jordan 1 Bred', 'Yeezy 350').", "editor": "stringList",
"prefill": }, "sizes": { "title": "Desired Sizes (US Men's)", "type": "array", "description": "Array
of US Men's sizes to filter for (e.g., '10', '10.5'). Actor will attempt to parse sizes.", "editor":
"stringList", "prefill": ["10", "10.5", "11"] }, "maxPrice": { "title": "Maximum Price (USD)",
"type": "number", "description": "Optional. Only return listings at or below this price." },
"targetPlatforms": { "title": "Platforms to Search", "type": "array", "description": "Select the
platforms you want to search.", "editor": "select", "options":, "default": }, "craigslistLocations":
{ "title": "Craigslist Search URLs", "type": "array", "description": "Required if 'Craigslist' is
selected. Provide full search URLs (e.g., 'newyork.craigslist.org/search/sss?query=...').",
"editor": "stringList" }, "proxies": { "title": "Proxy Configuration", "type": "object",
"description": "Proxy settings for custom scrapers (FlightClub, StadiumGoods).", "editor": "proxy"
}, "notificationConfig": { "title": "Notification Settings", "type": "object", "properties": {
"emailTo": { "type": "string", "title": "Email (e.g., 'me@example.com')" }, "slackWebhookUrl": {
"type": "string", "title": "Slack/Discord Webhook URL" } } } }, "required": }

B. Core Orchestration Logic (The main function)

The Actor's main function serves as the central orchestrator. It iterates through the user's
targetPlatforms input and delegates work to either an external Actor (via Apify.call) or an
internal, custom-built scraping function. Initialization: Load inputs: searchTerms, sizes,
targetPlatforms, notificationConfig. Open Apify Key-Value Store (KV_STORE) for deduplication.
Initialize an empty array: allListings =. Orchestration Loop: for each term in searchTerms: for each
platform in targetPlatforms: If platform == "GOAT": listings = await
Apify.call('ecomscrape/goat-product-search-scraper', { query: term,... }); 2 Push results to
allListings. If platform == "eBay": listings = await Apify.call('getdataforme/ebay-scraper', {
urls:,... }); 4 Push results to allListings. If platform == "Grailed": listings = await
Apify.call('vmscrapers/grailed', { search: term,... }); 3 Push results to allListings. If platform
== "FlightClub" (Innovate Module): listings = await scrapeFlightClub(term, proxies); (Executes our
custom-built JS rendering scraper). Push results to allListings. If platform == "StadiumGoods"
(Innovate Module): listings = await scrapeStadiumGoods(term, proxies); (Executes our custom-built
scraper). Push results to allListings. (Repeat for Vinted, Craigslist, etc.) Processing Pipeline
(The "Value-Add"): normalizedListings = normalizeData(allListings): Maps all disparate source fields
to the Standardized Output Schema (Table 3). parsedListings = aiAndRegexParser(normalizedListings):
Uses Table 1 logic to parse title and description for condition and size. filteredListings =
filterBy(parsedListings, sizes, maxPrice): Applies the user's specific filters. newAlerts =
findNewListings(filteredListings, KV_STORE): The deduplication engine identifies only new listings.
Alerting & Output: if (newAlerts.length > 0): await sendNotifications(newAlerts,
notificationConfig); (Calls email/Slack webhooks). await Apify.pushData(newAlerts);: Saves the new
listings to the Actor's default dataset.

C. Data Normalization & Deduplication Engine

These two components are essential for providing a clean, usable data feed. Normalization: This is a
utility function containing a large switch statement. It accepts a listing object from any source
and a string identifying that source (e.g., "GOAT"). It then maps the source-specific fields (e.g.,
goat.price_usd) to the standardized schema (e.g., listing.price). This ensures the final output is
100% uniform. Deduplication (The "Memory"): This engine prevents alert spam and is essential for a
continuous monitoring Actor. It uses Apify's Key-Value Store for persistent state between runs. For
each normalized listing, a unique listingId is generated (e.g., an MD5 hash of platform +
platform_specific_id). The findNewListings function logic is as follows: Initialize newAlerts =. for
each listing in filteredListings: listingId = createHash(listing.source.platform, listing.source.id)
seenListing = await KV_STORE.getValue(listingId) If seenListing is null: This is a new listing.
newAlerts.push(listing) await KV_STORE.setValue(listingId, { price: listing.listing.price,
timestamp: Date.now() }) Else (if seenListing exists): This is an old listing. (Advanced Feature):
Implement a price-drop check. if (listing.listing.price < seenListing.price) -> add to a separate
"Price Drop" alert. Update the KV_STORE record with the new price/timestamp. This logic guarantees
that on the next scheduled run (e.g., one hour later), only listings that have newly appeared since
the last run will trigger a notification.

D. The Standardized 'SneakerMeta' Output Schema (OUTPUT_SCHEMA.json)

This defines the clean, final JSON output for every listing, regardless of its source. This schema
must be defined in the Actor's settings to meet the 65+ Quality Score.1

Table 3: Standardized 'SneakerMeta' Output Schema

Field Path Data Type Description Example product.name String The full, normalized name of the
sneaker. "Air Jordan 1 Retro High OG 'Bred' (2016)" product.brand String The primary brand. "Air
Jordan" product.model String The base model. "Air Jordan 1" product.colorway String The common
nickname for the colorway. "Bred" product.sku String The manufacturer's Stock Keeping Unit.
"555088-001" listing.price Number The listing price in USD. 1200 listing.size_us_mens String The US
Men's size. "10.5" listing.condition Enum Standardized condition from parsing. new_in_box,
used_like_new, used_good, used_fair, used_poor, unspecified listing.tags Array Array of tags parsed
from the description. ["og_all", "player_edition"] listing.type Enum The type of listing. sell, buy,
"auction" source.platform String The marketplace where the listing was found. "Grailed" source.url
String The direct URL to the listing. "https://grailed.com/listings/..." source.id String The unique
ID of the listing on that platform. "12345678" source.is_authenticated Boolean True if the platform
(e.g., GOAT, StockX) authenticates. true seller.name String The seller's username. "sneakerhead123"
seller.rating Number The seller's rating, if available. 4.9 scrape.timestamp String ISO 8601
timestamp of when the data was scraped. "2026-01-15T14:30:00Z"

V. Advanced Modules for Novelty & Technical Excellence

To win the challenge, the Actor must exceed the basic requirements. These modules provide the
"novelty" and "technical excellence" that will differentiate the SneakerMeta Actor from a simple
scraper.1

A. The AI & Regex Parsing Engine (Condition & Size Extraction)

This module is the implementation of the logic defined in Table 1. Its purpose is to convert
unstructured, human-written text from P2P listings into structured, filterable data. Condition
Parsing: The engine first scans the title and description fields using the regex patterns from
Table 1. If /\b(vnds)\b/i matches, it sets listing.condition = "used_like_new". Size Parsing: This
is a more complex pattern-matching problem, as sizes are written in many formats. The engine must
check for common patterns: /\b(size\|sz)\s*(1[0-9](.5)?\|[1-9](.5)?)\b/i
/\b(US\s*M(en's)?)\s\*(1[0-9](.5)?\|[1-9](.5)?)\b/i When a match is found, it extracts the number
(e.g., "10.5") and populates the listing.size_us_mens field. AI (LLM) Enhancement: As an optional,
high-impact feature, the Actor can be configured to call an AI model for listings that fail
regex-based parsing. A simple prompt (e.g., "Given the following title and description, extract
'size', 'condition', and 'colorway' as a JSON object:") can handle messy, ambiguous listings,
showcasing a high degree of technical sophistication.

B. The "Trend-Spotting" & Release Calendar Module (Novelty)

This feature provides a massive expansion of the Actor's "usefulness".1 Finding a resale deal is
reactive; the ultimate "win" for a sneakerhead is acquiring a shoe at its retail price before it
sells out. This module provides that proactive intelligence. Target List: This module scrapes public
sneaker release calendars, such as thedropdate.com 16, soleretriever.com 17, and finishline.com.18
Logic: This function operates independently of the user's searchTerms. It runs on a schedule (e.g.,
daily) and scrapes these calendar sites for all upcoming releases. Output: It produces a separate
dataset of upcoming_releases, including shoe_name, release_date, retail_price, and raffle_links.
Alerts: It can send a daily digest email or Slack/Discord message: "Upcoming Drops for:..." This
module's value is immense. It directly competes with the "insider info" that paid "cook groups"
provide.19 By offering this intelligence as part of a free Actor, it will be a powerful driver of
user acquisition and long-term retention—a key metric for the challenge.1

C. The Multi-Channel Alerting System

Per the user query, notifications are mandatory. This system must be robust and integrate with the
user's workflow. Email: This is handled by calling the built-in Apify apify/send-email Actor. The
orchestrator will call this Actor at the end of its run, passing the newAlerts array and the
notificationConfig.emailTo input. Slack/Discord: This is essential for the target "sneakerhead"
audience, who are heavily concentrated on Discord.19 This is achieved via a generic webhook POST
request to the notificationConfig.slackWebhookUrl. Logic: if (notificationConfig.slackWebhookUrl):
for each alert in newAlerts: Format a rich message_body (e.g., "NEW LISTING: [Name] - [Price] on
[Platform]!"). await fetch(notificationConfig.slackWebhookUrl, { method: 'POST', body:
JSON.stringify({ text: message_body }) }) This provides the real-time, actionable alerts that
transform the Actor from a data-collection tool into a high-value monitoring service.

VI. Go-to-Market: Meeting the 65+ Quality Score and Attracting Users

A technically brilliant Actor with zero users will not win. This plan addresses the two final,
critical judging criteria: achieving a high Actor Quality Score and driving cumulative number of
monthly active users (MAUs).1

A. Achieving the 65+ Actor Quality Score

This blueprint is designed from the ground up to meet this technical checklist.1 [X] Unique,
Comprehensive README: Will be created (see B). [X] Defined & Validated Input Schema: Complete
(Section IV.A). [X] Defined Output Schema: Complete (Section IV.D, Table 3). [ ] Source Code in Git
Repo: A requirement for transparency and publishing. [ ] Good Error Handling: All custom scraping
modules (FlightClub, StadiumGoods, Calendars) must use try...catch blocks to handle blocks, layout
changes, or network errors gracefully. [ ] Use Apify Proxy: The proxies configuration (Section IV.A)
must be passed to all custom scraping functions and Apify calls to ensure reliability and avoid IP
bans.

B. The README Blueprint (The Actor's "Storefront")

The README is the Actor's single most important marketing tool on the Apify Store. It must be clear,
compelling, and sell the user on the value proposition. Title: SneakerMeta: The All-in-One Sneaker
Deal Finder Badge: "Apify Challenge Eligible" (This builds trust and highlights the project).
Elevator Pitch: "Stop opening 8 tabs. This one Actor monitors StockX, GOAT, eBay, Grailed, Flight
Club, Stadium Goods, and more. Get real-time Slack, Discord, or Email alerts when a 'grail' in your
size is listed for a steal." Key Features: One Actor, All Platforms: List all eligible scraped
platforms. AI-Powered Parsing: Explain that it understands "VNDS," "DS," "OG," etc. Release
Calendar: Highlight the proactive daily drop alerts. Instant Alerts: Show icons for Slack, Discord,
and Email. Input Configuration: A detailed guide on how to use the Input Schema, with clear examples
for searchTerms, craigslistLocations, and notificationConfig. Output Schema: A JSON code block
showing the clean, standardized output (from Table 3). "Why this Actor?" (vs. Competition): Explain
that this is an orchestrator that saves time and provides a single, clean, deduplicated feed, plus
new features (Release Calendar) not found elsewhere.

C. User Acquisition Strategy (Driving MAUs)

The challenge is judged heavily on "cumulative number of monthly active users".1 This requires a
targeted, non-spam promotion strategy. Target Audience: Sneakerheads, resellers, and collectors.
Target Communities: Forums: NikeTalk 21, Sole Collector.21 Discord: The ecosystem of "cook
groups".19 Apps/Blogs: Users of competing info apps like Sole Retriever 22 and SoleSavy.21 Reddit:
r/Sneakers 13, r/SNKRS.20 Promotion (Non-Spammy): The Rule: The challenge explicitly prohibits
"Spamming Apify community channels".1 This principle must be extended to all external communities.
The Strategy: "Provide, Don't Promote." Use the SneakerMeta Actor to monitor for "grails." When the
Actor finds a legitimate, high-value deal (e.g., "VNDS Off-White Chicago, size 10, for $1000 on
Grailed"), the first action is to post that deal to the relevant community (e.g., r/Sneakers). The
post is not "Check out my Actor." The post is "Heads up, just found an amazing deal on..." When
other users inevitably ask, "How did you find that so fast? It's already sold," the reply is: "I've
been using this Apify Actor to monitor all the sites at once. Here's the link if you want to use it;
it's free." This method provides tangible value to the community first (the deal), establishing
credibility. The Actor is then presented as the solution to a shared problem, not as spam. This is
the most effective and ethical path to building a loyal user base and winning the MAU metric.

D. Viral Growth Mechanics (MAU Amplification)

To maximize MAUs for the challenge, the Actor integrates built-in viral mechanics that encourage
organic sharing and community growth.

Public "Recent Grails Found" Feed The Actor automatically publishes anonymized high-value deals
(deal score 80+) to a public dataset:
https://apify.com/[username]/grail-hunter/dataset/public-grails-feed

This feed becomes a live marketing asset:

- Provides continuous social proof ("Look what the Actor found today!")
- Drives discovery through shareability (users share feed in communities)
- Automates the "Provide, Don't Promote" strategy (automated value delivery) Implementation: The
  Actor posts top deals to a separate public dataset after each run, removing seller info and URLs
  for privacy.

Social Sharing Features Every alert includes "Share This Deal" buttons for:

- Email forwarding
- Twitter/X posting
- Discord messaging

This leverages sneakerhead culture: sharing a great find = social currency in the community. When
users share alerts, they organically promote the Actor with authentic, valuable content.
Implementation: Notification messages include pre-formatted share links and social media intent
URLs.

Social Proof Counters Alerts display "X users hunting this shoe" counters, creating:

- Urgency (FOMO - "Others want this too!")
- Community feeling (shared interest)
- Increased perceived value (popular = valuable)

Implementation: Track anonymous interest counters in KV Store, increment when users search for
specific models, display in notifications.

Referral Tracking (Lightweight) Optional referral code input allows users to support friends. No
financial rewards needed—sharing = kudos in sneaker culture.

Future potential: Leaderboards, badges, exclusive early access for top referrers. Implementation:
Track referral attribution in KV Store for analytics. Display top referrers on public feed.

Viral Coefficient Target: 1.5x Goal: Each user refers 1.5 others through sharing alerts, public feed
visibility, and organic word-of-mouth. This exponential growth directly maximizes the MAU metric for
challenge judging.

E. Pricing Strategy for Challenge (FREE Launch)

Critical Strategic Decision: Launch as FREE with no authentication required.

Rationale:

- Zero Friction: No payment, no login = maximum user acquisition
- MAU Maximization: The challenge judges heavily on cumulative MAUs. Free tier removes all barriers.
- Viral Amplification: Users share freely when there's no cost/commitment
- Challenge Focus: Win $100k Grand Prize first, monetize after January 31, 2026

Post-Challenge Migration:

- Grandfather existing users with "Founder" tier (legacy free access)
- Introduce tiered pricing for new users ($4.99 Hobby, $9.99 Pro)
- Announce transition 30 days before implementation

This strategy prioritizes challenge victory over immediate revenue. The Actor's MAU count becomes
its competitive advantage.

Works cited The Apify $1M Challenge · Apify, accessed November 9, 2025,
https://apify.com/challenge#join-the-challenge Goat Product Search Scraper - Apify, accessed
November 9, 2025, https://apify.com/ecomscrape/goat-product-search-scraper Grailed.com - Fashion
product scraper - Apify, accessed November 9, 2025, https://apify.com/vmscrapers/grailed Ebay
Scraper - Apify, accessed November 9, 2025, https://apify.com/getdataforme/ebay-scraper Vinted
Scraper - Apify, accessed November 9, 2025, https://apify.com/louisdeconinck/vinted-scraper 7 BEST
PLATFORMS TO SELL SNEAKERS IN 2024! - YouTube, accessed November 9, 2025,
https://www.youtube.com/watch?v=Xd915PCRehk The 5 Best Sneaker Resale Sites for Flipping Sneakers
[2023] - AIO bot, accessed November 9, 2025, https://www.aiobot.com/best-sneaker-resale-sites/ 5
Best Marketplaces for Sneaker Resellers - Vendoo's Blog, accessed November 9, 2025,
https://blog.vendoo.co/5-best-marketplaces-for-sneaker-resellers Nike Air Jordan 1 Resell Values: A
Full Ranking - Highsnobiety, accessed November 9, 2025,
https://www.highsnobiety.com/p/jordan-1-resell-value-prices/ Full Glossary of Sneaker Terminology |
Highsnobiety, accessed November 9, 2025,
https://www.highsnobiety.com/p/sneaker-terminology-glossary/ The Most Hyped Jordan Sneakers
Returning in 2025 (So Far), accessed November 9, 2025,
https://www.highsnobiety.com/p/jordan-sneaker-return-releases-2025/ Sneaker Slang 101: The Essential
Sneaker Terminology Guide - Novelship News, accessed November 9, 2025,
https://novelship.com/news/sneaker-slang-101-the-ultimate-sneaker-terminology-guide/ r/Sneakers, can
we create a unified sneaker-dictionary? To help define terms that we all use? It would be helpful to
people just starting out! - Reddit, accessed November 9, 2025,
https://www.reddit.com/r/Sneakers/comments/14bhe2/rsneakers_can_we_create_a_unified/ Sneaker
Collecting Glossary of Terms - Heritage Auctions, accessed November 9, 2025,
https://www.ha.com/information/sneakers-glossary-of-terms.s Help scraping StockX / Goat / eBay :
r/webscraping - Reddit, accessed November 9, 2025,
https://www.reddit.com/r/webscraping/comments/s5r9kv/help_scraping_stockx_goat_ebay/ The Drop Date:
Home, accessed November 9, 2025, https://thedropdate.com/ Sole Retriever – Sneaker raffles, release
dates, and news, accessed November 9, 2025, https://www.soleretriever.com/ Sneaker Release Dates -
Finish Line, accessed November 9, 2025, https://www.finishline.com/sneaker-release-dates Top 29 best
sneaker reselling Discord servers [October 2025] - Whop, accessed November 9, 2025,
https://whop.com/blog/best-sneaker-reselling-discord-servers/ Sneakers Cook Group/Discord :
r/SNKRS - Reddit, accessed November 9, 2025,
https://www.reddit.com/r/SNKRS/comments/rtmskm/sneakers_cook_groupdiscord/ 24 Best Shoe Collectors
communities to join in 2025 - Hive Index, accessed November 9, 2025,
https://thehiveindex.com/topics/shoe-collectors/ Sneaker discords : r/SNKRS - Reddit, accessed
November 9, 2025, https://www.reddit.com/r/SNKRS/comments/vto4p5/sneaker_discords/
