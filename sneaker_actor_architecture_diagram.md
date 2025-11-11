# Sneaker Collector's Assistant - Architecture Diagrams

## System Architecture (High-Level)

```mermaid
graph TB
    subgraph "User Layer"
        A[👤 User Input<br/>Apify Console]
        B[⏰ Scheduled Runs<br/>Apify Scheduler]
        C[🔌 API Calls<br/>External Integration]
    end

    subgraph "Sneaker Collector's Assistant - Main Actor"
        D[📥 Input Parser<br/>& Validator]
        E[📋 Watchlist<br/>Manager]
        F[🎯 Marketplace<br/>Orchestrator]

        subgraph "Marketplace Scrapers"
            G1[🏪 StockX<br/>Scraper]
            G2[🏪 GOAT<br/>Scraper]
            G3[🏪 eBay<br/>Scraper]
            G4[🏪 Facebook<br/>Marketplace]
            G5[🏪 Craigslist<br/>Scraper]
            G6[🏪 OfferUp<br/>Scraper]
        end

        H[🔄 Data<br/>Aggregator]
        I[✨ Data Normalizer<br/>& Enricher]
        J[🔍 Deduplication<br/>Engine]
        K[📊 Historical Data<br/>Manager]
        L[🚨 Alert Condition<br/>Evaluator]
        M[📬 Notification<br/>Dispatcher]
    end

    subgraph "Storage Layer (Apify)"
        N[(📦 Dataset<br/>Current Listings)]
        O[(📈 Dataset<br/>Historical Snapshots)]
        P[(🔑 KV Store<br/>User Watchlists)]
        Q[(✅ KV Store<br/>Seen Listings)]
    end

    subgraph "Notification Layer"
        R[✉️ Email<br/>SendGrid API]
        S[💬 Slack<br/>Webhook]
        T[📱 SMS<br/>Twilio API]
    end

    A --> D
    B --> D
    C --> D

    D --> E
    E --> F
    E --> P

    F --> G1
    F --> G2
    F --> G3
    F --> G4
    F --> G5
    F --> G6

    G1 --> H
    G2 --> H
    G3 --> H
    G4 --> H
    G5 --> H
    G6 --> H

    H --> I
    I --> J
    J --> K
    J --> Q

    K --> N
    K --> O

    K --> L
    L --> M

    M --> R
    M --> S
    M --> T

    style D fill:#E3F2FD
    style F fill:#FFF3E0
    style H fill:#FFF9C4
    style L fill:#FFEBEE
    style M fill:#E8F5E9
```

---

## Data Flow Diagram

```mermaid
flowchart TB
    Start([⏰ Scheduled Run Starts]) --> LoadInput[📥 Load User Input<br/>from Apify Console]
    LoadInput --> LoadWatchlist[📋 Load Watchlist<br/>from KV Store]
    LoadWatchlist --> ValidateInput{✅ Valid Input?}

    ValidateInput -->|No| ErrorOut[❌ Log Error<br/>& Exit]
    ValidateInput -->|Yes| ProcessWatchlist[🔄 Process Each<br/>Watchlist Item]

    ProcessWatchlist --> GenerateQueries[🔍 Generate Search<br/>Queries & Variants]
    GenerateQueries --> ParallelScrape[⚡ Launch 6 Parallel<br/>Platform Scrapers]

    ParallelScrape --> StockX[🏪 StockX<br/>Sub-Actor]
    ParallelScrape --> GOAT[🏪 GOAT<br/>Sub-Actor]
    ParallelScrape --> eBay[🏪 eBay<br/>Sub-Actor]
    ParallelScrape --> Facebook[🏪 Facebook<br/>Sub-Actor]
    ParallelScrape --> Craigslist[🏪 Craigslist<br/>Sub-Actor]
    ParallelScrape --> OfferUp[🏪 OfferUp<br/>Sub-Actor]

    StockX --> Aggregate
    GOAT --> Aggregate
    eBay --> Aggregate
    Facebook --> Aggregate
    Craigslist --> Aggregate
    OfferUp --> Aggregate

    Aggregate[🔄 Aggregate All<br/>Results] --> Normalize[✨ Normalize Data<br/>Size, Price, SKU]
    Normalize --> Enrich[🎨 Enrich Data<br/>Colorway, Brand]

    Enrich --> Dedupe[🔍 Check Duplicates<br/>Against Seen Listings]
    Dedupe --> CheckSeen{Already Seen?}

    CheckSeen -->|Yes| Skip[⏭️ Skip Listing]
    CheckSeen -->|No| NewListing[✨ New Listing Found]

    NewListing --> MarkSeen[✅ Mark as Seen<br/>in KV Store]
    MarkSeen --> SaveCurrent[💾 Save to<br/>Current Listings Dataset]

    SaveCurrent --> CheckHistorical{📊 24h Since Last<br/>Snapshot?}
    CheckHistorical -->|Yes| SaveHistorical[💾 Save to<br/>Historical Dataset]
    CheckHistorical -->|No| SkipHistorical[⏭️ Skip Snapshot]

    SaveHistorical --> EvaluateAlert
    SkipHistorical --> EvaluateAlert

    EvaluateAlert[🚨 Evaluate Alert<br/>Conditions] --> CheckConditions{🎯 Matches Watchlist<br/>Conditions?}

    CheckConditions -->|No| NoAlert[⏭️ No Alert]
    CheckConditions -->|Yes| FlagForAlert[🔔 Flag for Alert]

    FlagForAlert --> QueueAlert[📋 Add to Alert Queue]
    QueueAlert --> AllProcessed{All Listings<br/>Processed?}

    NoAlert --> AllProcessed
    Skip --> AllProcessed

    AllProcessed -->|No| ProcessWatchlist
    AllProcessed -->|Yes| GroupAlerts[👥 Group Alerts<br/>by User]

    GroupAlerts --> CheckFreq{📬 Check Notification<br/>Frequency}

    CheckFreq -->|Immediate| SendImmediate[✉️ Send Individual<br/>Email per Listing]
    CheckFreq -->|Hourly Digest| SendDigest[📦 Send Hourly<br/>Digest Email]
    CheckFreq -->|Daily| QueueDaily[⏰ Queue for Daily<br/>Summary]

    SendImmediate --> CheckSlack{💬 Slack Enabled?}
    SendDigest --> CheckSlack
    QueueDaily --> CheckSlack

    CheckSlack -->|Yes| SendSlack[💬 Send Slack<br/>Notification]
    CheckSlack -->|No| CheckSMS

    SendSlack --> CheckSMS{📱 SMS Enabled?}
    CheckSMS -->|Yes| SendSMS[📱 Send SMS<br/>via Twilio]
    CheckSMS -->|No| LogMetrics

    SendSMS --> LogMetrics[📊 Log Run Metrics<br/>& Statistics]
    LogMetrics --> OutputResults[📤 Push Results to<br/>Actor Output]
    OutputResults --> Complete([✅ Run Complete])

    ErrorOut --> Complete

    style Start fill:#4CAF50,color:#fff
    style Complete fill:#4CAF50,color:#fff
    style ErrorOut fill:#F44336,color:#fff
    style CheckConditions fill:#FFC107
    style FlagForAlert fill:#FF5722,color:#fff
    style SendImmediate fill:#2196F3,color:#fff
    style SendDigest fill:#2196F3,color:#fff
    style SendSlack fill:#9C27B0,color:#fff
    style SendSMS fill:#E91E63,color:#fff
```

---

## Marketplace Integration Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Actor as 🎯 Main Actor
    participant WM as 📋 Watchlist Manager
    participant Orch as 🔄 Orchestrator
    participant StockX as 🏪 StockX Actor
    participant GOAT as 🏪 GOAT Actor
    participant eBay as 🏪 eBay Actor
    participant Proc as ✨ Processor
    participant KV as 🔑 KV Store
    participant DS as 📦 Dataset
    participant Email as ✉️ Email Service

    User->>Actor: 🚀 Trigger Run (Scheduled/Manual)
    Actor->>WM: Load Watchlist Configuration
    WM->>KV: Fetch watchlist-{userId}.json
    KV-->>WM: Return Watchlist Items

    WM->>Actor: Watchlist Ready
    Actor->>Orch: Start Parallel Scraping

    par Parallel Platform Scraping
        Orch->>StockX: scrapeStockX(query, sizes)
        StockX-->>Orch: Return StockX Listings
    and
        Orch->>GOAT: scrapeGOAT(query, sizes)
        GOAT-->>Orch: Return GOAT Listings
    and
        Orch->>eBay: scrapeEbay(query, sizes)
        eBay-->>Orch: Return eBay Listings
    end

    Orch->>Proc: Aggregate Raw Listings
    Proc->>Proc: Normalize Sizes (US/UK/EU)
    Proc->>Proc: Enrich SKUs & Colorways

    Proc->>KV: Check Seen Listings
    KV-->>Proc: Return Seen Hashes

    Proc->>Proc: Filter New Listings Only
    Proc->>KV: Mark New Listings as Seen

    Proc->>DS: Save to Current Listings Dataset
    Proc->>DS: Update Historical Snapshots

    Proc->>Actor: Return Processed Listings
    Actor->>Actor: Evaluate Alert Conditions

    Actor->>Email: Send Alert Email
    Email-->>User: 🔥 New Sneaker Alert!

    Actor->>DS: Push Final Output
    Actor-->>User: ✅ Run Complete
```

---

## Deduplication Strategy

```mermaid
flowchart LR
    subgraph "Layer 1: URL-Based Deduplication"
        L1A[📄 New Listing] --> L1B[Generate Hash<br/>platform + URL + size]
        L1B --> L1C{Hash Exists in<br/>KV Store?}
        L1C -->|Yes| L1D[⏭️ Skip Duplicate]
        L1C -->|No| L1E[✅ Pass to Layer 2]
    end

    subgraph "Layer 2: SKU-Based Cross-Platform"
        L1E --> L2A[Extract SKU<br/>from Listing]
        L2A --> L2B{SKU Available?}
        L2B -->|No| L2E[✅ Pass to Layer 3]
        L2B -->|Yes| L2C{Same SKU + Size<br/>Already Seen?}
        L2C -->|Yes| L2D[🔄 Keep Lowest Price<br/>Version Only]
        L2C -->|No| L2E
    end

    subgraph "Layer 3: Fuzzy Title Matching"
        L2E --> L3A[Calculate Levenshtein<br/>Similarity]
        L2D --> L3A
        L3A --> L3B{Similarity > 85%<br/>AND Same Size<br/>AND Price ±$10?}
        L3B -->|Yes| L3C[⚠️ Likely Duplicate<br/>Flag for Review]
        L3B -->|No| L3D[✅ Unique Listing]
    end

    L3D --> Output[💾 Store in Dataset]
    L3C --> Output
    L1D --> End([End])

    style L1D fill:#FFCDD2
    style L2D fill:#FFF9C4
    style L3C fill:#FFE0B2
    style L3D fill:#C8E6C9
    style Output fill:#B3E5FC
```

---

## Historical Data Tracking

```mermaid
graph TB
    subgraph "Daily Snapshot Process"
        A[⏰ Scheduled Run<br/>Completes] --> B{24h Since Last<br/>Snapshot for SKU?}
        B -->|No| C[⏭️ Skip Snapshot]
        B -->|Yes| D[📊 Calculate Daily Stats]

        D --> E[📈 Compute Average Price<br/>Lowest & Highest]
        E --> F[📦 Count Active Listings]
        F --> G[💾 Write to Historical<br/>Dataset]

        G --> H[(Historical Snapshots<br/>SKU + Size + Platform + Date)]
    end

    subgraph "Trend Calculation (On Query)"
        I[📊 User Requests<br/>Historical Data] --> J[🔍 Query Last 30/90/365<br/>Days from Dataset]
        J --> K[📉 Calculate % Changes<br/>1d, 7d, 30d, 90d]
        K --> L[📊 Compute Volatility<br/>Standard Deviation]
        L --> M[📈 Determine Trend<br/>Upward/Downward/Stable]
        M --> N[🎯 Generate Insights<br/>Buy/Sell Signals]
        N --> O[📤 Return to User]
    end

    H -.->|Read Historical Data| J

    style A fill:#E3F2FD
    style G fill:#C5E1A5
    style H fill:#FFF9C4
    style I fill:#F8BBD0
    style N fill:#CE93D8
```

---

## Alert Evaluation Logic

```mermaid
flowchart TD
    Start([New Listing Found]) --> CheckModel{Model Name<br/>Matches?}

    CheckModel -->|No| NoAlert[❌ No Alert]
    CheckModel -->|Yes| CheckSize{Size in<br/>Watchlist?}

    CheckSize -->|No| NoAlert
    CheckSize -->|Yes| CheckPrice{Price ≤<br/>maxPrice?}

    CheckPrice -->|No| NoAlert
    CheckPrice -->|Yes| CheckCondition{Condition ≥<br/>minCondition?}

    CheckCondition -->|No| NoAlert
    CheckCondition -->|Yes| CheckPlatform{Platform in<br/>Allowed List?}

    CheckPlatform -->|No| NoAlert
    CheckPlatform -->|Yes| CheckLocation{Location<br/>Filter Set?}

    CheckLocation -->|No| CheckAuth
    CheckLocation -->|Yes| WithinLocation{Within Target<br/>Location?}

    WithinLocation -->|No| NoAlert
    WithinLocation -->|Yes| CheckAuth{Auth-Only<br/>Filter Enabled?}

    CheckAuth -->|No| Trigger
    CheckAuth -->|Yes| IsAuth{Authenticity<br/>Status = Verified?}

    IsAuth -->|No| NoAlert
    IsAuth -->|Yes| Trigger[🔔 Trigger Alert!]

    Trigger --> CalculateDeal[💰 Calculate Deal Score<br/>vs Market Average]
    CalculateDeal --> QueueNotification[📋 Add to<br/>Notification Queue]
    QueueNotification --> End([✅ Continue])

    NoAlert --> End

    style Start fill:#4CAF50,color:#fff
    style NoAlert fill:#F44336,color:#fff
    style Trigger fill:#FF9800,color:#fff
    style QueueNotification fill:#2196F3,color:#fff
    style End fill:#9E9E9E,color:#fff
```

---

## Notification Dispatch Flow

```mermaid
graph TB
    subgraph "Alert Queue Processing"
        A[📋 Alert Queue<br/>Multiple Listings] --> B[👥 Group by User]
        B --> C[📊 Sort by Deal Score<br/>Best Deals First]
    end

    subgraph "Email Notifications"
        C --> D{Email<br/>Frequency?}
        D -->|Immediate| E[✉️ Send Individual<br/>Emails max 5]
        D -->|Hourly| F[📦 Send Digest<br/>All Listings]
        D -->|Daily| G[⏰ Queue for<br/>Daily Summary]

        E --> H[📧 SendGrid API]
        F --> H
        G --> I[(Queue Store<br/>Pending Daily)]
    end

    subgraph "Slack Notifications"
        C --> J{Slack<br/>Enabled?}
        J -->|Yes| K[💬 Format Slack<br/>Rich Blocks]
        J -->|No| N
        K --> L[🔄 Rate Limit<br/>1 msg/second]
        L --> M[🌐 POST to<br/>Webhook URL]
    end

    subgraph "SMS Notifications (Premium)"
        C --> N{SMS<br/>Enabled?}
        N -->|Yes| O[📱 Select TOP 1<br/>Best Deal Only]
        N -->|No| S
        O --> P[📝 Format 160 char<br/>Message]
        P --> Q[💰 Check Daily<br/>SMS Quota]
        Q --> R[📲 Twilio API]
    end

    H --> S[📊 Log Alert History]
    M --> S
    R --> S
    I -.->|Next Day 8am| F

    S --> T[(Alert History<br/>Dataset)]
    T --> U[✅ Dispatch Complete]

    style A fill:#FFF3E0
    style H fill:#2196F3,color:#fff
    style M fill:#9C27B0,color:#fff
    style R fill:#E91E63,color:#fff
    style S fill:#4CAF50,color:#fff
```

---

## Portfolio Tracking System

```mermaid
flowchart LR
    subgraph "User Portfolio Input"
        A[👤 User Provides<br/>Collection List] --> B[📝 Portfolio Items<br/>Model + Size + Purchase Price]
        B --> C[💾 Store in<br/>KV Store]
    end

    subgraph "Valuation Process"
        D[⏰ Scheduled Run] --> E[🔍 Load User Portfolio<br/>from KV Store]
        E --> F[🔄 For Each Item]

        F --> G[🔍 Query Current<br/>Market Price]
        G --> H[📊 Check Historical<br/>Data]

        H --> I[💵 Calculate<br/>Current Value]
        I --> J[📈 Calculate ROI<br/>profit - purchasePrice]

        J --> K{More Items?}
        K -->|Yes| F
        K -->|No| L[📊 Aggregate<br/>Portfolio Metrics]
    end

    subgraph "Portfolio Analytics"
        L --> M[💰 Total Market Value]
        L --> N[📈 Total ROI %]
        L --> O[🏆 Top Gainers<br/>Top 3 by ROI]
        L --> P[📉 Top Losers<br/>Bottom 3 by ROI]

        M --> Q[📤 Output Portfolio<br/>Summary]
        N --> Q
        O --> Q
        P --> Q
    end

    C -.->|Read Portfolio| E
    Q --> R[✉️ Optional: Email<br/>Weekly Report]

    style A fill:#E1F5FE
    style C fill:#FFF9C4
    style I fill:#C8E6C9
    style Q fill:#F8BBD0
    style R fill:#D1C4E9
```

---

## Error Handling & Retry Strategy

```mermaid
stateDiagram-v2
    [*] --> Attempt1: Start Platform Scrape

    Attempt1 --> Success: ✅ Success
    Attempt1 --> Retry2: ❌ Error (Network/Blocking)

    Retry2 --> Wait5s: Exponential Backoff
    Wait5s --> Attempt2: Retry with Delay

    Attempt2 --> Success: ✅ Success
    Attempt2 --> Retry3: ❌ Error Again

    Retry3 --> Wait10s: Exponential Backoff
    Wait10s --> Attempt3: Final Retry

    Attempt3 --> Success: ✅ Success
    Attempt3 --> GracefulFail: ❌ All Attempts Failed

    Success --> [*]: Return Data

    GracefulFail --> LogError: 📝 Log Detailed Error
    LogError --> SwitchProxy: 🔄 Switch to Residential Proxy
    SwitchProxy --> NotifyAdmin: 📧 Notify if Persistent
    NotifyAdmin --> ContinueOther: ⏭️ Continue with Other Platforms
    ContinueOther --> [*]: Partial Success

    note right of Attempt1
        Try 1: Use configured proxy
        Timeout: 30s
    end note

    note right of Attempt2
        Try 2: Wait 5s
        Switch proxy pool
    end note

    note right of Attempt3
        Try 3: Wait 10s
        Escalate to residential
    end note

    note right of GracefulFail
        Don't fail entire run
        Log error for user
        Continue with other platforms
    end note
```

---

## Apify Platform Integration

```mermaid
graph TB
    subgraph "Apify Platform Services"
        A[🎯 Sneaker Collector Actor] --> B[📦 Actor Storage]
        A --> C[🔑 Key-Value Store]
        A --> D[📊 Dataset Storage]
        A --> E[⏰ Scheduler]
        A --> F[🌐 Apify Proxy]
        A --> G[📧 Actor Integrations]

        B --> B1[(Docker Image<br/>Node.js + Code)]
        C --> C1[(KV: Watchlists)]
        C --> C2[(KV: Seen Listings)]
        D --> D1[(DS: Current Listings)]
        D --> D2[(DS: Historical Data)]
        E --> E1[⏰ Cron Scheduler<br/>Hourly/30min/15min]
        F --> F1[🏢 Datacenter Proxies]
        F --> F2[🏠 Residential Proxies]
        G --> G1[✉️ Email Notifications]
        G --> G2[💬 Slack Webhooks]
    end

    subgraph "Sub-Actor Orchestration"
        A --> SA[🔄 Call Sub-Actors<br/>Actor.call()]
        SA --> SA1[ecomscrape/stockx-scraper]
        SA --> SA2[ecomscrape/goat-scraper]
        SA --> SA3[apify/ebay-scraper]
        SA --> SA4[apify/facebook-marketplace]
        SA --> SA5[zscrape/craigslist-scraper]
    end

    subgraph "User Interface"
        UI1[🖥️ Apify Console] --> E
        UI1 --> H[▶️ Manual Run]
        UI1 --> I[📊 View Results]
        UI2[🔌 Apify API] --> J[🤖 External Automation]
    end

    H --> A
    J --> A
    I --> D

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
    style F fill:#00BCD4,color:#fff
    style G fill:#8BC34A,color:#fff
```

---

## Challenge Success Pathway

```mermaid
journey
    title Apify $1M Challenge Journey (Nov 2025 - Jan 2026)
    section Week 1-2: MVP Development
        Scaffold Actor: 3: Developer
        Integrate StockX/GOAT: 4: Developer
        Add Email Alerts: 5: Developer
        Write README: 4: Developer
        Publish to Store: 5: Developer, Users
    section Week 3-4: Platform Expansion
        Add Facebook/Craigslist: 4: Developer
        Launch Marketing: 5: Developer, Users
        First 50 Users: 5: Users
        YouTube Tutorial: 5: Developer, Users
    section Week 5-8: Feature Enhancement
        Historical Data: 5: Developer
        Portfolio Tracking: 5: Developer, Users
        Reach 200 MAUs: 5: Users
        Quality Score 75+: 5: Developer
    section Week 9-11: MAU Maximization
        Viral Marketing: 5: Developer, Users
        Discord Partnerships: 5: Users
        500-1000 MAUs: 5: Users
        Grand Prize Consideration: 5: Developer, Users
```

---

## Data Schema Relationships

```mermaid
erDiagram
    USER ||--o{ WATCHLIST_ITEM : "creates"
    USER ||--o{ PORTFOLIO_ITEM : "owns"
    USER ||--|| NOTIFICATION_CONFIG : "has"

    WATCHLIST_ITEM ||--o{ LISTING : "matches"
    WATCHLIST_ITEM {
        string id PK
        string model
        array sizes
        number maxPrice
        string minCondition
        array platforms
        datetime createdAt
        boolean active
    }

    LISTING ||--o{ ALERT_HISTORY : "triggers"
    LISTING {
        string id PK
        string platform
        string url
        string model
        string sku
        string size
        number price
        string condition
        string authenticityStatus
        datetime scrapedDate
        boolean alertTriggered
    }

    LISTING ||--o{ HISTORICAL_SNAPSHOT : "generates"
    HISTORICAL_SNAPSHOT {
        string id PK
        date date
        string sku
        string size
        string platform
        number price
        number listingsCount
        number priceChange30d
        string trend
    }

    PORTFOLIO_ITEM ||--o| LISTING : "valued_by"
    PORTFOLIO_ITEM {
        string id PK
        string model
        string size
        number purchasePrice
        date purchaseDate
        number currentMarketValue
        number roi
    }

    NOTIFICATION_CONFIG {
        string userId PK
        object email
        object slack
        object sms
    }

    ALERT_HISTORY {
        string id PK
        datetime timestamp
        string userId FK
        string watchlistItemId FK
        string listingId FK
        string channel
        string status
    }
```

---

## Proxy Strategy Decision Tree

```mermaid
flowchart TD
    Start([Platform Scrape Request]) --> CheckPlatform{Which Platform?}

    CheckPlatform -->|StockX| UseRes1[Use Residential Proxy]
    CheckPlatform -->|GOAT| UseRes2[Use Residential Proxy]
    CheckPlatform -->|Facebook| UseRes3[Use Residential Proxy]
    CheckPlatform -->|OfferUp| UseRes4[Use Residential Proxy]
    CheckPlatform -->|eBay| CheckFailures1{Previous Failures?}
    CheckPlatform -->|Craigslist| CheckFailures2{Previous Failures?}

    CheckFailures1 -->|<2| UseDC1[Use Datacenter Proxy]
    CheckFailures1 -->|≥2| UseRes5[Escalate to Residential]

    CheckFailures2 -->|<2| UseDC2[Use Datacenter Proxy]
    CheckFailures2 -->|≥2| UseRes6[Escalate to Residential]

    UseRes1 --> SetConfig1[Set apifyProxyGroups: RESIDENTIAL<br/>Country: US]
    UseRes2 --> SetConfig1
    UseRes3 --> SetConfig1
    UseRes4 --> SetConfig1
    UseRes5 --> SetConfig1
    UseRes6 --> SetConfig1

    UseDC1 --> SetConfig2[Set apifyProxyGroups: GOOGLE_SERP<br/>Country: US]
    UseDC2 --> SetConfig2

    SetConfig1 --> ExecuteScrape[Execute Scrape Request]
    SetConfig2 --> ExecuteScrape

    ExecuteScrape --> CheckResult{Success?}

    CheckResult -->|Yes| Success[✅ Return Data<br/>Cost: $0.20/1K residential<br/>or $0.01/1K datacenter]
    CheckResult -->|No| IncrementFail[Increment Failure Counter]

    IncrementFail --> CheckRetries{Retries Left?}
    CheckRetries -->|Yes| Start
    CheckRetries -->|No| Fail[❌ Log Error<br/>Continue with Other Platforms]

    Success --> End([End])
    Fail --> End

    style UseRes1 fill:#FF6B6B
    style UseRes2 fill:#FF6B6B
    style UseRes3 fill:#FF6B6B
    style UseRes4 fill:#FF6B6B
    style UseDC1 fill:#4ECDC4
    style UseDC2 fill:#4ECDC4
    style Success fill:#95E1D3
    style Fail fill:#F38181
```

---

## Complete System Context Diagram

```mermaid
C4Context
    title System Context - Sneaker Collector's Assistant

    Person(user, "Sneaker Collector/Reseller", "Tracks rare sneakers<br/>across marketplaces")

    System(actor, "Sneaker Collector's Assistant", "Apify Actor that aggregates<br/>sneaker listings and sends alerts")

    System_Ext(stockx, "StockX", "Authenticated sneaker<br/>resale marketplace")
    System_Ext(goat, "GOAT", "Authenticated sneaker<br/>resale marketplace")
    System_Ext(ebay, "eBay", "Global auction and<br/>retail marketplace")
    System_Ext(facebook, "Facebook Marketplace", "Local classified ads<br/>marketplace")
    System_Ext(craigslist, "Craigslist", "Local classified ads<br/>platform")
    System_Ext(offerup, "OfferUp", "Local buying and<br/>selling platform")

    System_Ext(sendgrid, "SendGrid", "Email delivery service")
    System_Ext(slack, "Slack", "Team communication<br/>platform")
    System_Ext(twilio, "Twilio", "SMS messaging service")

    System_Ext(apify, "Apify Platform", "Serverless automation<br/>infrastructure")

    Rel(user, actor, "Configures watchlist &<br/>receives alerts", "Apify Console/API")

    Rel(actor, stockx, "Scrapes listings", "HTTP/HTTPS via proxy")
    Rel(actor, goat, "Scrapes listings", "HTTP/HTTPS via proxy")
    Rel(actor, ebay, "Scrapes listings", "HTTP/HTTPS via proxy")
    Rel(actor, facebook, "Scrapes listings", "HTTP/HTTPS via proxy")
    Rel(actor, craigslist, "Scrapes listings", "HTTP/HTTPS via proxy")
    Rel(actor, offerup, "Scrapes listings", "HTTP/HTTPS via proxy")

    Rel(actor, sendgrid, "Sends email alerts", "SendGrid API")
    Rel(actor, slack, "Posts notifications", "Webhook")
    Rel(actor, twilio, "Sends SMS alerts", "Twilio API")

    Rel(actor, apify, "Runs on, stores data", "Apify SDK")
```

---

## Marketing Funnel Visualization

```mermaid
graph TB
    subgraph "Awareness Stage"
        A1[Reddit Posts<br/>r/Sneakers 3.8M] --> B[50,000 Views]
        A2[YouTube Tutorial<br/>Sneaker Automation] --> B
        A3[Discord Cook Groups<br/>100+ Servers] --> B
        A4[Twitter/X Posts<br/>Sneaker Community] --> B
    end

    subgraph "Interest Stage"
        B --> C[5,000 Click-Throughs<br/>10% CTR]
        C --> D[Visit Apify Store Page]
        D --> E{Compelling README<br/>+ Demo Video?}
        E -->|Yes| F[2,000 Users Interested<br/>40% Conversion]
        E -->|No| G[❌ Bounce]
    end

    subgraph "Activation Stage"
        F --> H[Create Apify Account]
        H --> I[Configure First Watchlist]
        I --> J{Setup Complete<br/>in <5 minutes?}
        J -->|Yes| K[1,200 Activated Users<br/>60% Activation]
        J -->|No| L[❌ Abandon]
    end

    subgraph "Engagement Stage"
        K --> M{Receive First Alert<br/>within 24h?}
        M -->|Yes| N[800 Engaged Users<br/>67% Engagement]
        M -->|No| O[❌ Inactive]
        N --> P[Schedule Hourly Runs]
    end

    subgraph "Retention Stage"
        P --> Q{Still Active<br/>After 30 Days?}
        Q -->|Yes| R[600 Monthly Active Users<br/>75% Retention]
        Q -->|No| S[❌ Churned]
        R --> T[🎯 Challenge MAU Target]
    end

    subgraph "Revenue Stage (Post-Challenge)"
        R --> U{Upgrade to Paid?}
        U -->|Yes| V[60-120 Paid Users<br/>10-20% Conversion]
        U -->|No| W[Continue Free Tier]
        V --> X[$540-$2,280 MRR]
    end

    style B fill:#FFF9C4
    style F fill:#C5E1A5
    style K fill:#90CAF9
    style N fill:#CE93D8
    style R fill:#A5D6A7
    style V fill:#81C784
    style X fill:#66BB6A

    style G fill:#FFCDD2
    style L fill:#FFCDD2
    style O fill:#FFCDD2
    style S fill:#FFCDD2
```

---

## Technology Stack Overview

```mermaid
mindmap
  root((Sneaker Actor<br/>Tech Stack))
    Runtime
      Apify SDK v3
      Node.js 20
      TypeScript 5
      Docker Container

    Storage
      Apify Dataset
        Current Listings
        Historical Snapshots
      Apify KV Store
        User Watchlists
        Seen Listings
        Notification Queue

    Scrapers
      Existing Actors
        ecomscrape/stockx-scraper
        ecomscrape/goat-scraper
        apify/ebay-scraper
        apify/facebook-marketplace
        zscrape/craigslist-scraper
      Custom Integration
        OfferUp Wrapper

    Networking
      Apify Proxy
        Residential Proxies
        Datacenter Proxies
      Anti-Blocking
        Rotating IPs
        User-Agent Rotation
        Rate Limiting

    Notifications
      Email
        SendGrid API
        HTML Templates
        Digest Batching
      Chat
        Slack Webhooks
        Rich Message Blocks
      SMS
        Twilio API
        160 char messages

    Data Processing
      Normalization
        Size Conversion US/UK/EU
        Price Currency Standardization
      Enrichment
        SKU Extraction
        Colorway Detection
      Deduplication
        SHA-256 Hashing
        Fuzzy Matching
      Analytics
        Historical Trends
        Deal Scoring
        ROI Calculation

    Scheduling
      Apify Scheduler
        Cron Expression
        Timezone Support
      Retry Logic
        Exponential Backoff
        Graceful Degradation
```

---

## Performance Optimization Strategy

```mermaid
flowchart TD
    Start([Actor Run Starts]) --> A1[Sequential Processing<br/>⏱️ 180s total]
    Start --> A2[❌ Large Watchlist<br/>20 items × 6 platforms = 120 calls]
    Start --> A3[❌ Slow Historical Queries<br/>365 days × 100 SKUs]

    A1 --> B1[✅ Parallel Processing<br/>Promise.all 6 platforms<br/>⏱️ 30s max]
    A2 --> B2[✅ Batch Processing<br/>Process 5 items at a time<br/>Reduce memory pressure]
    A3 --> B3[✅ In-Memory Caching<br/>Cache historical data per run<br/>Avoid redundant queries]

    B1 --> C1[💰 Cost: Same<br/>⚡ Speed: 6x faster]
    B2 --> C2[💰 Cost: Same<br/>🧠 Memory: 60% reduction]
    B3 --> C3[💰 Cost: -40%<br/>⚡ Speed: 5x faster]

    C1 --> D[Combined Optimizations]
    C2 --> D
    C3 --> D

    D --> E[Original: 180s, $1.50, 3GB RAM]
    D --> F[Optimized: 45s, $0.90, 1.2GB RAM]

    F --> G[✅ 4x Faster<br/>✅ 40% Cheaper<br/>✅ 60% Less Memory]

    style A1 fill:#FFCDD2
    style A2 fill:#FFCDD2
    style A3 fill:#FFCDD2
    style B1 fill:#C8E6C9
    style B2 fill:#C8E6C9
    style B3 fill:#C8E6C9
    style G fill:#4CAF50,color:#fff
```

---

These diagrams provide comprehensive visual documentation of the Sneaker Collector's Assistant
architecture, covering:

1. ✅ System Architecture (high-level overview)
2. ✅ Data Flow (detailed step-by-step process)
3. ✅ Marketplace Integration (sequence diagram)
4. ✅ Deduplication Strategy (3-layer approach)
5. ✅ Historical Data Tracking
6. ✅ Alert Evaluation Logic
7. ✅ Notification Dispatch Flow
8. ✅ Portfolio Tracking System
9. ✅ Error Handling & Retry Strategy
10. ✅ Apify Platform Integration
11. ✅ Challenge Success Pathway
12. ✅ Data Schema Relationships (ERD)
13. ✅ Proxy Strategy Decision Tree
14. ✅ System Context (C4 Model)
15. ✅ Marketing Funnel
16. ✅ Technology Stack (Mind Map)
17. ✅ Performance Optimization

You can render these Mermaid diagrams using:

- GitHub/GitLab (native Mermaid support)
- Mermaid Live Editor (https://mermaid.live)
- VS Code with Mermaid extension
- Documentation tools (MkDocs, Docusaurus)

All diagrams can be embedded directly in Markdown documents and will render automatically on most
modern documentation platforms.
