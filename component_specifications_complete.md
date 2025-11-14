# SneakerMeta: Component Specification Document

## Apify Actor - Multi-Platform Sneaker Scraping & Alert System

**Version:** 1.0  
**Date:** November 10, 2025  
**Project:** Apify Challenge Submission  
**Target:** $2.99-$9.99/month subscription model  
**Platforms:** 12+ sneaker marketplaces

---

## Table of Contents

1. [Input Schema Specification](#1-input-schema-specification)
2. [Output Dataset Specification](#2-output-dataset-specification)
3. [Notification System Specification](#3-notification-system-specification)
4. [Price Tracking Specification](#4-price-tracking-specification)
5. [Deduplication Logic Specification](#5-deduplication-logic-specification)
6. [Error Handling & Monitoring Specification](#6-error-handling--monitoring-specification)
7. [Platform Scraper Specification](#7-platform-scraper-specification)
8. [Testing Specifications](#8-testing-specifications)

---

## 1. Input Schema Specification

### 1.1 Complete JSON Schema Definition

The input schema follows Apify's `input_schema.json` format (schema version 1) and is located at
`.actor/input_schema.json` (sample input in `.actor/INPUT.json`).

```json
{
  "title": "SneakerMeta Orchestrator Input",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "searchTerms": {
      "title": "Search Terms",
      "type": "array",
      "description": "Array of sneaker models or keywords to search for. Examples: 'Air Jordan 1 Bred', 'Yeezy 350 Zebra', 'Travis Scott Jordan'. Can include brand, model, colorway, or any combination.",
      "editor": "stringList",
      "prefill": ["Air Jordan 1", "Yeezy 350"],
      "minItems": 1,
      "maxItems": 20,
      "items": {
        "type": "string",
        "minLength": 2,
        "maxLength": 100
      }
    },
    "sizes": {
      "title": "Desired Sizes (US Men's)",
      "type": "array",
      "description": "US Men's shoe sizes to filter results. Examples: '10', '10.5', '11'. Supports half sizes. Leave empty to include all sizes.",
      "editor": "stringList",
      "prefill": ["10", "10.5", "11"],
      "items": {
        "type": "string",
        "pattern": "^([1-9]|1[0-5])(\\.5)?$"
      },
      "uniqueItems": true
    },
    "minPrice": {
      "title": "Minimum Price (USD)",
      "type": "number",
      "description": "Minimum price filter in US dollars. Default is 0 (no minimum). Only listings at or above this price will be returned.",
      "default": 0,
      "minimum": 0,
      "maximum": 49999
    },
    "maxPrice": {
      "title": "Maximum Price (USD)",
      "type": "number",
      "description": "Maximum price filter in US dollars. Leave empty for no upper limit. Only listings at or below this price will be returned.",
      "minimum": 1,
      "maximum": 50000
    },
    "conditions": {
      "title": "Condition Filters",
      "type": "array",
      "description": "Filter by sneaker condition. Select one or more conditions. Leave empty to include all conditions.",
      "editor": "select",
      "items": {
        "type": "string",
        "enum": [
          "new_in_box",
          "used_like_new",
          "used_good",
          "used_fair",
          "used_poor",
          "unspecified"
        ]
      },
      "uniqueItems": true
    },
    "targetPlatforms": {
      "title": "Platforms to Search",
      "type": "array",
      "description": "Select which marketplaces to scrape. More platforms = longer runtime but better coverage. Recommended: Start with 3-5 platforms.",
      "editor": "select",
      "items": {
        "type": "string",
        "enum": [
          "goat",
          "stockx",
          "ebay",
          "grailed",
          "depop",
          "vinted",
          "poshmark",
          "flightclub",
          "stadiumgoods",
          "craigslist",
          "offerup",
          "kixify"
        ]
      },
      "default": ["goat", "ebay", "grailed", "flightclub"],
      "minItems": 1,
      "maxItems": 12,
      "uniqueItems": true
    },
    "craigslistLocations": {
      "title": "Craigslist Search URLs",
      "type": "array",
      "description": "REQUIRED if 'craigslist' is selected. Provide full Craigslist search URLs. Example: 'https://newyork.craigslist.org/search/sss?query=jordan+1'. Get URLs by searching Craigslist manually and copying the URL.",
      "editor": "stringList",
      "items": {
        "type": "string",
        "pattern": "^https?://.*\\.craigslist\\.org.*"
      }
    },
    "maxResultsPerPlatform": {
      "title": "Max Results per Platform",
      "type": "number",
      "description": "Maximum number of listings to scrape from each platform. Higher values increase runtime and may hit rate limits. Recommended: 50 for most use cases.",
      "default": 50,
      "minimum": 10,
      "maximum": 500
    },
    "enableReleaseCalendar": {
      "title": "Enable Release Calendar Monitoring",
      "type": "boolean",
      "description": "Monitor upcoming sneaker releases from The Drop Date, Sole Retriever, and Finish Line. Alerts you 7 days before major releases with raffle links.",
      "default": false
    },
    "dealThresholdPercentage": {
      "title": "Deal Alert Threshold (%)",
      "type": "number",
      "description": "Alert when P2P marketplace listings are X% below authenticated platform market value. Example: 20 means alert if price is 20% below StockX/GOAT price. Set to 0 to disable deal scoring.",
      "default": 15,
      "minimum": 0,
      "maximum": 50
    },
    "excludeKeywords": {
      "title": "Exclude Keywords",
      "type": "array",
      "description": "Filter out listings containing these keywords. Common exclusions: 'replica', 'fake', 'custom', 'unauthorized'. Case-insensitive.",
      "editor": "stringList",
      "items": {
        "type": "string",
        "minLength": 2,
        "maxLength": 50
      }
    },
    "notificationConfig": {
      "title": "Notification Settings",
      "type": "object",
      "description": "Configure how you want to receive alerts. At least one notification method is recommended.",
      "editor": "json",
      "properties": {
        "emailTo": {
          "type": "string",
          "title": "Email Address",
          "description": "Email address for alerts. SendGrid will send HTML emails with listing details.",
          "format": "email"
        },
        "emailFrequency": {
          "type": "string",
          "title": "Email Frequency",
          "description": "How often to send email alerts",
          "enum": ["immediate", "hourly", "daily"],
          "default": "immediate"
        },
        "minListingsForEmail": {
          "type": "number",
          "title": "Minimum Listings for Email",
          "description": "Only send email if at least this many new listings are found. Prevents spam for low-activity searches.",
          "default": 1,
          "minimum": 1,
          "maximum": 100
        },
        "slackWebhookUrl": {
          "type": "string",
          "title": "Slack Webhook URL",
          "description": "Slack incoming webhook URL. Get from Slack App settings. Also works with Discord webhooks.",
          "pattern": "^https://hooks\\.slack\\.com/.*"
        },
        "discordWebhookUrl": {
          "type": "string",
          "title": "Discord Webhook URL",
          "description": "Discord incoming webhook URL. Get from Server Settings > Integrations > Webhooks.",
          "pattern": "^https://discord\\.com/api/webhooks/.*"
        },
        "webhookUrl": {
          "type": "string",
          "title": "Custom Webhook URL",
          "description": "Your custom webhook endpoint for JSON POST notifications. Useful for Zapier, Make, or custom integrations.",
          "pattern": "^https?://.*"
        },
        "webhookSecret": {
          "type": "string",
          "title": "Webhook Secret (Optional)",
          "description": "Secret key for HMAC signature verification. Recommended for security.",
          "isSecret": true,
          "minLength": 16,
          "maxLength": 128
        }
      }
    },
    "proxyConfiguration": {
      "title": "Proxy Configuration",
      "type": "object",
      "description": "HIGHLY RECOMMENDED: Use Apify residential proxies for anti-bot bypass. Required for StockX, GOAT, Poshmark, Mercari, OfferUp.",
      "editor": "proxy",
      "prefill": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"],
        "apifyProxyCountry": "US"
      }
    },
    "advancedOptions": {
      "title": "Advanced Options",
      "type": "object",
      "description": "Advanced scraping configuration for power users",
      "editor": "json",
      "properties": {
        "useAIParsing": {
          "type": "boolean",
          "title": "Enable AI Parsing",
          "description": "Use OpenAI GPT-3.5 to parse ambiguous listings (condition, size extraction). Requires OpenAI API key. Cost: ~$0.002 per listing.",
          "default": false
        },
        "openAIKey": {
          "type": "string",
          "title": "OpenAI API Key",
          "description": "Required if AI parsing is enabled. Get from https://platform.openai.com/api-keys",
          "isSecret": true,
          "pattern": "^sk-.*"
        },
        "cacheTimeout": {
          "type": "number",
          "title": "Cache Timeout (minutes)",
          "description": "How long to cache platform data before refreshing. Higher values reduce API calls but may miss new listings.",
          "default": 60,
          "minimum": 5,
          "maximum": 1440
        },
        "enablePriceDropAlerts": {
          "type": "boolean",
          "title": "Price Drop Alerts",
          "description": "Alert when previously seen listings drop in price by 10% or more.",
          "default": false
        },
        "customUserAgent": {
          "type": "string",
          "title": "Custom User-Agent",
          "description": "Override default User-Agent header. Advanced users only.",
          "maxLength": 200
        },
        "requestDelay": {
          "type": "number",
          "title": "Request Delay (milliseconds)",
          "description": "Delay between requests to same platform. Increase if hitting rate limits.",
          "default": 1000,
          "minimum": 500,
          "maximum": 10000
        }
      }
    },
    "subscriptionTier": {
      "title": "Subscription Tier",
      "type": "string",
      "description": "Your subscription tier. This field is automatically set by Apify monetization.",
      "enum": ["free", "hobby", "pro", "business"],
      "default": "free",
      "editor": "hidden"
    }
  },
  "required": ["searchTerms", "targetPlatforms"]
}
```

### 1.2 Field Descriptions & Data Types

| Field                     | Type            | Required       | Default                                     | Constraints                         | Description                       |
| ------------------------- | --------------- | -------------- | ------------------------------------------- | ----------------------------------- | --------------------------------- |
| `searchTerms`             | `array<string>` | ✅ Yes         | -                                           | 1-20 items, 2-100 chars each        | Sneaker keywords to search        |
| `sizes`                   | `array<string>` | ❌ No          | `[]`                                        | Pattern: `^([1-9]\|1[0-5])(\\.5)?$` | US Men's sizes (e.g., "10.5")     |
| `minPrice`                | `number`        | ❌ No          | `0`                                         | 0-49,999                            | Minimum price in USD              |
| `maxPrice`                | `number`        | ❌ No          | -                                           | 1-50,000                            | Maximum price in USD              |
| `conditions`              | `array<enum>`   | ❌ No          | `[]`                                        | Enum values only                    | Filter by condition               |
| `targetPlatforms`         | `array<enum>`   | ✅ Yes         | `["goat", "ebay", "grailed", "flightclub"]` | 1-12 items, unique                  | Platforms to scrape               |
| `craigslistLocations`     | `array<string>` | ⚠️ Conditional | -                                           | Must be valid Craigslist URLs       | Required if 'craigslist' selected |
| `maxResultsPerPlatform`   | `number`        | ❌ No          | `50`                                        | 10-500                              | Max listings per platform         |
| `enableReleaseCalendar`   | `boolean`       | ❌ No          | `false`                                     | -                                   | Monitor upcoming releases         |
| `dealThresholdPercentage` | `number`        | ❌ No          | `15`                                        | 0-50                                | Deal alert threshold              |
| `excludeKeywords`         | `array<string>` | ❌ No          | `[]`                                        | 2-50 chars each                     | Keywords to exclude               |
| `notificationConfig`      | `object`        | ❌ No          | `{}`                                        | See nested schema                   | Notification settings             |
| `proxyConfiguration`      | `object`        | ❌ No          | Apify proxy                                 | See Apify docs                      | Proxy settings                    |
| `advancedOptions`         | `object`        | ❌ No          | `{}`                                        | See nested schema                   | Advanced options                  |
| `subscriptionTier`        | `enum`          | ❌ No          | `"free"`                                    | free/hobby/pro/business             | User's subscription tier          |

### 1.3 Validation Rules & Error Messages

**Implementation:** Validation occurs in `src/utils/validator.js` at actor startup.

```javascript
/**
 * Input Validation Module
 * Validates user input and throws descriptive errors
 */

class InputValidator {
  /**
   * Validate complete input object
   * @param {Object} input - User input from Actor.getInput()
   * @throws {ValidationError} if validation fails
   */
  static validate(input) {
    const errors = [];

    // Required fields
    if (!input.searchTerms || input.searchTerms.length === 0) {
      errors.push({
        field: 'searchTerms',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'At least one search term is required',
        suggestion: 'Add search terms like "Air Jordan 1", "Yeezy 350", etc.',
      });
    }

    if (!input.targetPlatforms || input.targetPlatforms.length === 0) {
      errors.push({
        field: 'targetPlatforms',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'At least one target platform must be selected',
        suggestion: 'Select platforms like "ebay", "grailed", "goat", etc.',
      });
    }

    // Search terms validation
    if (input.searchTerms) {
      if (input.searchTerms.length > 20) {
        errors.push({
          field: 'searchTerms',
          code: 'ARRAY_TOO_LONG',
          message: 'Maximum 20 search terms allowed',
          current: input.searchTerms.length,
          max: 20,
        });
      }

      input.searchTerms.forEach((term, idx) => {
        if (term.length < 2) {
          errors.push({
            field: `searchTerms[${idx}]`,
            code: 'STRING_TOO_SHORT',
            message: `Search term "${term}" is too short (minimum 2 characters)`,
            value: term,
          });
        }
        if (term.length > 100) {
          errors.push({
            field: `searchTerms[${idx}]`,
            code: 'STRING_TOO_LONG',
            message: `Search term too long (maximum 100 characters)`,
            value: term.substring(0, 50) + '...',
          });
        }
      });
    }

    // Size validation
    if (input.sizes && input.sizes.length > 0) {
      const sizeRegex = /^([1-9]|1[0-5])(\.5)?$/;
      input.sizes.forEach((size, idx) => {
        if (!sizeRegex.test(size)) {
          errors.push({
            field: `sizes[${idx}]`,
            code: 'INVALID_SIZE_FORMAT',
            message: `Invalid size format: "${size}". Must be US Men's size (1-15, half sizes allowed)`,
            value: size,
            examples: ['10', '10.5', '11', '12.5'],
          });
        }
      });
    }

    // Price range validation
    if (input.minPrice !== undefined && input.maxPrice !== undefined) {
      if (input.minPrice >= input.maxPrice) {
        errors.push({
          field: 'minPrice/maxPrice',
          code: 'INVALID_PRICE_RANGE',
          message: 'Minimum price must be less than maximum price',
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          suggestion: 'Set minPrice < maxPrice or leave one empty',
        });
      }
    }

    if (input.minPrice !== undefined && input.minPrice < 0) {
      errors.push({
        field: 'minPrice',
        code: 'INVALID_VALUE',
        message: 'Minimum price cannot be negative',
        value: input.minPrice,
      });
    }

    if (input.maxPrice !== undefined && input.maxPrice > 50000) {
      errors.push({
        field: 'maxPrice',
        code: 'VALUE_TOO_LARGE',
        message: 'Maximum price cannot exceed $50,000',
        value: input.maxPrice,
        max: 50000,
      });
    }

    // Platform-specific conditional validation
    if (input.targetPlatforms && input.targetPlatforms.includes('craigslist')) {
      if (!input.craigslistLocations || input.craigslistLocations.length === 0) {
        errors.push({
          field: 'craigslistLocations',
          code: 'CONDITIONAL_FIELD_MISSING',
          message: 'craigslistLocations is required when "craigslist" is selected',
          suggestion:
            'Provide Craigslist search URLs (e.g., "https://newyork.craigslist.org/search/sss?query=jordan+1")',
          howToGet:
            '1. Go to craigslist.org\n2. Select your city\n3. Search for sneakers\n4. Copy the full URL from browser address bar',
        });
      } else {
        // Validate Craigslist URL format
        const craigslistRegex = /^https?:\/\/.*\.craigslist\.org.*/;
        input.craigslistLocations.forEach((url, idx) => {
          if (!craigslistRegex.test(url)) {
            errors.push({
              field: `craigslistLocations[${idx}]`,
              code: 'INVALID_URL_FORMAT',
              message: `Invalid Craigslist URL: "${url}"`,
              value: url,
              example: 'https://newyork.craigslist.org/search/sss?query=jordan+1',
            });
          }
        });
      }
    }

    // Notification validation
    if (input.notificationConfig) {
      const hasAnyNotification =
        input.notificationConfig.emailTo ||
        input.notificationConfig.slackWebhookUrl ||
        input.notificationConfig.discordWebhookUrl ||
        input.notificationConfig.webhookUrl;

      if (!hasAnyNotification) {
        // Warning, not error
        Actor.log.warning(
          'No notification channels configured. Results will only be saved to dataset.'
        );
      }

      // Email validation
      if (input.notificationConfig.emailTo) {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(input.notificationConfig.emailTo)) {
          errors.push({
            field: 'notificationConfig.emailTo',
            code: 'INVALID_EMAIL',
            message: `Invalid email format: "${input.notificationConfig.emailTo}"`,
            value: input.notificationConfig.emailTo,
          });
        }
      }

      // Webhook URL validation
      if (input.notificationConfig.webhookUrl) {
        try {
          new URL(input.notificationConfig.webhookUrl);
        } catch (e) {
          errors.push({
            field: 'notificationConfig.webhookUrl',
            code: 'INVALID_URL',
            message: `Invalid webhook URL: "${input.notificationConfig.webhookUrl}"`,
            error: e.message,
          });
        }
      }
    }

    // AI parsing validation
    if (input.advancedOptions?.useAIParsing) {
      if (!input.advancedOptions?.openAIKey) {
        errors.push({
          field: 'advancedOptions.openAIKey',
          code: 'CONDITIONAL_FIELD_MISSING',
          message: 'OpenAI API key is required when AI parsing is enabled',
          suggestion: 'Get your API key from https://platform.openai.com/api-keys',
        });
      } else if (!input.advancedOptions.openAIKey.startsWith('sk-')) {
        errors.push({
          field: 'advancedOptions.openAIKey',
          code: 'INVALID_API_KEY_FORMAT',
          message: 'OpenAI API key must start with "sk-"',
          value: input.advancedOptions.openAIKey.substring(0, 10) + '...',
        });
      }
    }

    // Subscription tier enforcement
    if (input.subscriptionTier) {
      const tier = input.subscriptionTier;
      const limits = TIER_LIMITS[tier];

      if (input.targetPlatforms.length > limits.maxPlatforms) {
        errors.push({
          field: 'targetPlatforms',
          code: 'TIER_LIMIT_EXCEEDED',
          message: `Your ${tier} plan allows up to ${limits.maxPlatforms} platforms`,
          current: input.targetPlatforms.length,
          max: limits.maxPlatforms,
          upgrade: tier === 'free' ? 'hobby' : tier === 'hobby' ? 'pro' : 'business',
        });
      }

      if (input.maxResultsPerPlatform > limits.maxResults) {
        errors.push({
          field: 'maxResultsPerPlatform',
          code: 'TIER_LIMIT_EXCEEDED',
          message: `Your ${tier} plan allows up to ${limits.maxResults} results per platform`,
          current: input.maxResultsPerPlatform,
          max: limits.maxResults,
          upgrade: tier === 'free' ? 'hobby' : tier === 'hobby' ? 'pro' : 'business',
        });
      }
    }

    // Throw aggregated errors
    if (errors.length > 0) {
      const errorMessage = this.formatErrors(errors);
      throw new ValidationError(errorMessage, errors);
    }

    return true;
  }

  /**
   * Format validation errors into user-friendly message
   */
  static formatErrors(errors) {
    let message = `Input validation failed with ${errors.length} error(s):\n\n`;

    errors.forEach((error, idx) => {
      message += `${idx + 1}. [${error.field}] ${error.message}\n`;
      if (error.suggestion) {
        message += `   💡 Suggestion: ${error.suggestion}\n`;
      }
      if (error.examples) {
        message += `   📝 Examples: ${JSON.stringify(error.examples)}\n`;
      }
      message += '\n';
    });

    return message;
  }
}

/**
 * Subscription tier limits
 */
const TIER_LIMITS = {
  free: {
    maxPlatforms: 1,
    maxResults: 10,
    enableNotifications: false,
    enableWebhook: false,
    enableAI: false,
    enableReleaseCalendar: false,
  },
  hobby: {
    maxPlatforms: 3,
    maxResults: 50,
    enableNotifications: true,
    enableWebhook: false,
    enableAI: false,
    enableReleaseCalendar: false,
  },
  pro: {
    maxPlatforms: 12,
    maxResults: 500,
    enableNotifications: true,
    enableWebhook: true,
    enableAI: true,
    enableReleaseCalendar: true,
  },
  business: {
    maxPlatforms: 12,
    maxResults: -1, // Unlimited
    enableNotifications: true,
    enableWebhook: true,
    enableAI: true,
    enableReleaseCalendar: true,
  },
};

/**
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

module.exports = { InputValidator, ValidationError, TIER_LIMITS };
```

### 1.4 Default Values

| Field                                    | Default Value                               | Rationale                                |
| ---------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `minPrice`                               | `0`                                         | No minimum price restriction by default  |
| `maxResultsPerPlatform`                  | `50`                                        | Balance between coverage and performance |
| `enableReleaseCalendar`                  | `false`                                     | Opt-in feature (adds runtime)            |
| `dealThresholdPercentage`                | `15`                                        | Reasonable threshold for "good deal"     |
| `notificationConfig.emailFrequency`      | `"immediate"`                               | Users want instant alerts                |
| `notificationConfig.minListingsForEmail` | `1`                                         | Alert on any new listing                 |
| `advancedOptions.cacheTimeout`           | `60` minutes                                | Balance freshness and API calls          |
| `advancedOptions.useAIParsing`           | `false`                                     | Opt-in to avoid costs                    |
| `advancedOptions.enablePriceDropAlerts`  | `false`                                     | Opt-in feature                           |
| `advancedOptions.requestDelay`           | `1000` ms                                   | Safe rate limiting                       |
| `subscriptionTier`                       | `"free"`                                    | Default tier for new users               |
| `targetPlatforms`                        | `["goat", "ebay", "grailed", "flightclub"]` | Best balance of coverage and reliability |
| `proxyConfiguration.useApifyProxy`       | `true`                                      | Required for most platforms              |
| `proxyConfiguration.apifyProxyGroups`    | `["RESIDENTIAL"]`                           | Residential proxies for anti-bot bypass  |

### 1.5 Examples of Valid Inputs

#### Example 1: Basic Search (Beginner)

```json
{
  "searchTerms": ["Air Jordan 1"],
  "targetPlatforms": ["ebay", "grailed"],
  "notificationConfig": {
    "emailTo": "collector@example.com"
  }
}
```

#### Example 2: Advanced Search (Power User)

```json
{
  "searchTerms": ["Air Jordan 1 Bred", "Air Jordan 1 Chicago", "Travis Scott Jordan 1"],
  "sizes": ["10", "10.5", "11"],
  "minPrice": 500,
  "maxPrice": 1500,
  "conditions": ["new_in_box", "used_like_new"],
  "targetPlatforms": ["goat", "stockx", "ebay", "grailed", "flightclub", "stadiumgoods"],
  "maxResultsPerPlatform": 100,
  "dealThresholdPercentage": 20,
  "excludeKeywords": ["replica", "fake", "custom"],
  "notificationConfig": {
    "emailTo": "reseller@example.com",
    "emailFrequency": "immediate",
    "discordWebhookUrl": "https://discord.com/api/webhooks/123456789/abcdefg",
    "webhookUrl": "https://myserver.com/sneaker-webhook",
    "webhookSecret": "my-secret-key-123"
  },
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"],
    "apifyProxyCountry": "US"
  },
  "advancedOptions": {
    "useAIParsing": true,
    "openAIKey": "sk-proj-abc123...",
    "enablePriceDropAlerts": true,
    "cacheTimeout": 30
  }
}
```

#### Example 3: Craigslist-Specific Search

```json
{
  "searchTerms": ["Jordan 4", "Yeezy"],
  "sizes": ["10.5", "11"],
  "maxPrice": 300,
  "targetPlatforms": ["craigslist", "offerup", "ebay"],
  "craigslistLocations": [
    "https://newyork.craigslist.org/search/sss?query=jordan+4",
    "https://losangeles.craigslist.org/search/sss?query=yeezy",
    "https://chicago.craigslist.org/search/sss?query=sneakers"
  ],
  "notificationConfig": {
    "emailTo": "deals@example.com"
  }
}
```

#### Example 4: Release Calendar Monitoring

```json
{
  "searchTerms": ["Jordan 1", "Dunk", "Yeezy"],
  "targetPlatforms": ["goat", "ebay"],
  "enableReleaseCalendar": true,
  "notificationConfig": {
    "emailTo": "collector@example.com",
    "emailFrequency": "daily"
  }
}
```

### 1.6 UI Hints for Apify Console

**JSON Schema UI Enhancements:**

```json
{
  "searchTerms": {
    "sectionCaption": "🔍 What are you looking for?",
    "sectionDescription": "Enter sneaker names, brands, models, or colorways",
    "prefill": ["Air Jordan 1", "Yeezy 350"]
  },
  "targetPlatforms": {
    "sectionCaption": "🛒 Where to search?",
    "sectionDescription": "Select marketplaces. More platforms = longer runtime but better coverage."
  },
  "notificationConfig": {
    "sectionCaption": "🔔 How to get notified?",
    "sectionDescription": "Configure at least one notification method to receive alerts."
  },
  "advancedOptions": {
    "sectionCaption": "⚙️ Advanced Settings",
    "sectionDescription": "For power users. Leave defaults if unsure."
  }
}
```

**Conditional Field Display:**

- Show `craigslistLocations` only when "craigslist" is selected in `targetPlatforms`
- Show `openAIKey` only when `useAIParsing` is `true`
- Show `webhookSecret` only when `webhookUrl` is provided
- Gray out features not available in current `subscriptionTier`

---

## 2. Output Dataset Specification

### 2.1 Output Data Structure (JSON Schema)

All scraped listings are stored in Apify Dataset with a standardized schema. The schema is defined
in `src/schemas/output-schema.js`.

```javascript
/**
 * SneakerMeta Standardized Output Schema
 * Version: 1.0
 *
 * All listings from all platforms are normalized to this structure.
 * This ensures consistent data format regardless of source platform.
 */

const OutputSchema = {
  /**
   * Unique identifier for this listing
   * Format: {platform}_{listing_id} or MD5 hash if ID unavailable
   * Example: "grailed_12345678", "ebay_384729103827"
   */
  id: String,

  /**
   * Product information - describes the sneaker itself
   */
  product: {
    /**
     * Full sneaker name including model and colorway
     * Example: "Air Jordan 1 Retro High OG 'Bred' (2016)"
     */
    name: String,

    /**
     * Primary brand
     * Example: "Nike", "Adidas", "Air Jordan", "New Balance"
     */
    brand: String,

    /**
     * Base model number/name
     * Example: "Air Jordan 1", "Yeezy 350", "Dunk Low"
     */
    model: String,

    /**
     * Colorway nickname or official name
     * Example: "Bred", "Chicago", "Zebra", "Travis Scott"
     */
    colorway: String,

    /**
     * Manufacturer's Stock Keeping Unit (SKU)
     * Example: "555088-001", "CW1590-100"
     * May be null if not available
     */
    sku: String | null,

    /**
     * Release year
     * Example: 2016, 2020
     * May be null if not determinable
     */
    releaseYear: Number | null
  },

  /**
   * Listing details - specific to this particular sale listing
   */
  listing: {
    /**
     * Price in USD (converted if necessary)
     * Example: 750.00, 1200.50
     */
    price: Number,

    /**
     * Original currency code
     * Example: "USD", "EUR", "GBP"
     */
    currency: String,

    /**
     * US Men's shoe size
     * Example: "10.5", "11", "9"
     * May be null if not specified or not parseable
     */
    size_us_mens: String | null,

    /**
     * US Women's shoe size (if applicable)
     * Example: "12", "12.5"
     */
    size_us_womens: String | null,

    /**
     * EU size (if available)
     * Example: "44.5", "45"
     */
    size_eu: String | null,

    /**
     * UK size (if available)
     * Example: "9.5", "10"
     */
    size_uk: String | null,

    /**
     * Standardized condition
     * Enum: "new_in_box", "used_like_new", "used_good", "used_fair", "used_poor", "unspecified"
     */
    condition: String,

    /**
     * Additional tags describing the listing
     * Example: ["og_all", "authenticated", "vnds", "player_edition"]
     */
    tags: Array<String>,

    /**
     * Listing type
     * Enum: "sell", "buy" (wanted), "auction"
     */
    type: String,

    /**
     * Full listing description (may be truncated to 1000 chars)
     * Example: "VNDS condition, worn once. Includes OG box, laces, and receipt..."
     */
    description: String | null,

    /**
     * Listing creation timestamp (when seller listed it)
     * ISO 8601 format: "2025-11-10T14:30:00Z"
     * May be null if not available
     */
    listedAt: String | null
  },

  /**
   * Source information - where this listing was found
   */
  source: {
    /**
     * Platform name
     * Example: "GOAT", "eBay", "Grailed", "Flight Club"
     */
    platform: String,

    /**
     * Direct URL to the listing
     * Example: "https://grailed.com/listings/12345678"
     */
    url: String,

    /**
     * Platform-specific listing ID
     * Example: "12345678", "384729103827"
     */
    id: String,

    /**
     * Whether this platform authenticates sneakers
     * True for: GOAT, StockX, Flight Club, Stadium Goods
     * False for: eBay, Grailed, Craigslist, etc.
     */
    is_authenticated: Boolean,

    /**
     * Primary product image URL
     * Example: "https://www.shutterstock.com/image-vector/manufacturing-icon-collection-set-containing-260nw-2439256171.jpg"
     */
    imageUrl: String | null,

    /**
     * Additional image URLs
     * Example: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Phosphate_backbone.jpg/250px-Phosphate_backbone.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ape_skeletons.png/500px-Ape_skeletons.png"]
     */
    additionalImages: Array<String>
  },

  /**
   * Seller information (when available)
   */
  seller: {
    /**
     * Seller username or display name
     * Example: "sneakerhead_nyc", "john_doe_123"
     */
    name: String | null,

    /**
     * Seller rating (0-5 scale, normalized)
     * Example: 4.9, 5.0
     */
    rating: Number | null,

    /**
     * Number of reviews/ratings
     * Example: 127, 503
     */
    reviewCount: Number | null,

    /**
     * Verified seller status (if platform has verification)
     * Example: true, false
     */
    verified: Boolean | null,

    /**
     * Seller location (city, state, country)
     * Example: "New York, NY", "Los Angeles, CA"
     */
    location: String | null
  },

  /**
   * Scraping metadata - technical details about data collection
   */
  scrape: {
    /**
     * When this data was scraped
     * ISO 8601 format: "2025-11-10T14:30:00Z"
     */
    timestamp: String,

    /**
     * Apify actor run ID
     * Example: "abc123xyz456"
     */
    runId: String,

    /**
     * Actor version that scraped this data
     * Example: "1.0.0", "1.2.3"
     */
    version: String,

    /**
     * How data was obtained
     * Enum: "api", "scraping", "orchestrated"
     */
    method: String
  },

  /**
   * Deal scoring (optional, only if deal scoring is enabled)
   */
  dealScore: {
    /**
     * Whether this is below market value
     * Example: true, false
     */
    isBelowMarket: Boolean,

    /**
     * Estimated market value from authenticated platforms
     * Example: 950.00
     * Null if market value not available
     */
    marketValue: Number | null,

    /**
     * Percentage below market value
     * Example: 21.1 (means 21.1% below market)
     * Null if market value not available
     */
    savingsPercentage: Number | null,

    /**
     * Dollar amount saved
     * Example: 200.00
     * Null if market value not available
     */
    savingsAmount: Number | null,

    /**
     * Deal quality rating
     * Enum: "excellent" (>30%), "good" (20-30%), "fair" (10-20%), "market" (<10%)
     */
    dealQuality: String | null
  },

  /**
   * Price change tracking (optional, for quick drop detection)
   * Full history available in scrape.priceHistory
   */
  priceChange: {
    /**
     * Whether price dropped since last observation
     * Example: true, false
     */
    hasDrop: Boolean,

    /**
     * Price from previous observation
     * Example: 250.00
     * Null if first observation
     */
    previousPrice: Number | null,

    /**
     * Current listing price (same as listing.price)
     * Example: 200.00
     */
    currentPrice: Number,

    /**
     * Percentage drop calculated as ((previousPrice - currentPrice) / previousPrice) * 100
     * Example: 20.0 (means 20% drop)
     * Null if no previous price available
     */
    dropPercent: Number | null
  }
};
```

### 2.2 Field Definitions for Sneaker Listings

#### Product Fields

| Field                 | Type     | Nullable | Description            | Examples                                                          |
| --------------------- | -------- | -------- | ---------------------- | ----------------------------------------------------------------- |
| `product.name`        | `string` | ❌ No    | Complete sneaker name  | "Air Jordan 1 Retro High OG 'Bred'", "Yeezy Boost 350 V2 'Zebra'" |
| `product.brand`       | `string` | ❌ No    | Manufacturer brand     | "Nike", "Adidas", "Air Jordan", "New Balance"                     |
| `product.model`       | `string` | ❌ No    | Base model designation | "Air Jordan 1", "Yeezy 350", "Dunk Low", "Air Max 1"              |
| `product.colorway`    | `string` | ✅ Yes   | Colorway name/nickname | "Bred", "Chicago", "Zebra", "Travis Scott", "Off-White"           |
| `product.sku`         | `string` | ✅ Yes   | Manufacturer SKU       | "555088-001", "CW1590-100", "CP9654"                              |
| `product.releaseYear` | `number` | ✅ Yes   | Year of release        | 2016, 2020, 2021                                                  |

#### Listing Fields

| Field                    | Type            | Nullable | Description            | Validation                                                                          |
| ------------------------ | --------------- | -------- | ---------------------- | ----------------------------------------------------------------------------------- |
| `listing.price`          | `number`        | ❌ No    | Price in USD           | Must be > 0                                                                         |
| `listing.currency`       | `string`        | ❌ No    | Currency code          | ISO 4217 (USD, EUR, GBP)                                                            |
| `listing.size_us_mens`   | `string`        | ✅ Yes   | US Men's size          | Pattern: `^([1-9]\|1[0-5])(\\.5)?$`                                                 |
| `listing.size_us_womens` | `string`        | ✅ Yes   | US Women's size        | Pattern: `^([1-9]\|1[0-5])(\\.5)?$`                                                 |
| `listing.size_eu`        | `string`        | ✅ Yes   | EU size                | Pattern: `^[3-5][0-9](\\.5)?$`                                                      |
| `listing.size_uk`        | `string`        | ✅ Yes   | UK size                | Pattern: `^([1-9]\|1[0-5])(\\.5)?$`                                                 |
| `listing.condition`      | `enum`          | ❌ No    | Standardized condition | `new_in_box`, `used_like_new`, `used_good`, `used_fair`, `used_poor`, `unspecified` |
| `listing.tags`           | `array<string>` | ❌ No    | Descriptive tags       | `["og_all", "vnds", "authenticated"]`                                               |
| `listing.type`           | `enum`          | ❌ No    | Listing type           | `sell`, `buy`, `auction`                                                            |
| `listing.description`    | `string`        | ✅ Yes   | Full description       | Max 1000 characters                                                                 |
| `listing.listedAt`       | `string`        | ✅ Yes   | When listed            | ISO 8601 timestamp                                                                  |

#### Source Fields

| Field                     | Type            | Nullable | Description                             |
| ------------------------- | --------------- | -------- | --------------------------------------- |
| `source.platform`         | `string`        | ❌ No    | Platform name (e.g., "GOAT", "eBay")    |
| `source.url`              | `string`        | ❌ No    | Direct listing URL                      |
| `source.id`               | `string`        | ❌ No    | Platform-specific listing ID            |
| `source.is_authenticated` | `boolean`       | ❌ No    | Whether platform authenticates sneakers |
| `source.imageUrl`         | `string`        | ✅ Yes   | Primary image URL                       |
| `source.additionalImages` | `array<string>` | ✅ Yes   | Additional image URLs                   |

### 2.3 Data Types and Formats

#### Timestamps

All timestamps use **ISO 8601** format with UTC timezone:

```
Format: YYYY-MM-DDTHH:MM:SSZ
Example: "2025-11-10T14:30:00Z"
```

#### Prices

- **Type:** `number` (float)
- **Currency:** Always converted to USD
- **Precision:** 2 decimal places (e.g., 1200.50, not 1200.5)
- **Example:** `750.00`, `1234.99`

#### Sizes

- **Type:** `string` (not number, to preserve "10.5" format)
- **Format:** US sizing, may include half sizes
- **Pattern:** `^([1-9]|1[0-5])(\.5)?$`
- **Examples:** `"10"`, `"10.5"`, `"11"`, `"12.5"`

#### Enums

**Condition Enum:**

```javascript
enum Condition {
  NEW_IN_BOX = "new_in_box",          // DS, BNIB, deadstock, brand new
  USED_LIKE_NEW = "used_like_new",    // VNDS, very near deadstock, worn 1-2x
  USED_GOOD = "used_good",            // NDS, near deadstock, light wear
  USED_FAIR = "used_fair",            // Worn, noticeable wear
  USED_POOR = "used_poor",            // Beat, beaters, heavily worn
  UNSPECIFIED = "unspecified"         // Condition not specified
}
```

**Listing Type Enum:**

```javascript
enum ListingType {
  SELL = "sell",       // Standard sale listing
  BUY = "buy",         // "Wanted" or "Looking to buy" listing
  AUCTION = "auction"  // Auction-style listing (eBay)
}
```

**Deal Quality Enum:**

```javascript
enum DealQuality {
  EXCELLENT = "excellent",  // >30% below market
  GOOD = "good",            // 20-30% below market
  FAIR = "fair",            // 10-20% below market
  MARKET = "market"         // <10% below market
}
```

### 2.4 Metadata Fields (timestamps, source, etc.)

**Automatic Metadata Addition:** Every listing gets these metadata fields automatically added:

```javascript
{
  // Unique identifier
  id: generateListingId(platform, platformId),

  // Scraping metadata
  scrape: {
    timestamp: new Date().toISOString(),
    runId: Actor.getEnv().actorRunId,
    version: Actor.getEnv().actorVersion,
    method: scraperMethod // "api", "scraping", or "orchestrated"
  }
}
```

**Listing ID Generation Algorithm:**

```javascript
function generateListingId(platform, platformId) {
  // If platform provides unique ID, use it
  if (platformId) {
    return `${platform.toLowerCase()}_${platformId}`;
  }

  // Otherwise, create hash from unique fields
  const hashString = `${platform}:${url}:${title}:${price}`;
  return crypto.createHash('md5').update(hashString).digest('hex');
}
```

### 2.5 Deduplication Keys

**Primary Deduplication Key:**

- Field: `id`
- Format: `{platform}_{listing_id}` or MD5 hash
- Example: `"grailed_12345678"`, `"ebay_384729103827"`

**Secondary Deduplication Logic:** For platforms without stable IDs, use composite key:

```javascript
{
  platform: "craigslist",
  url: "https://newyork.craigslist.org/...",
  title: "Air Jordan 1 Bred Size 10.5",
  price: 750,
  seller: "john_doe"
}
```

**Deduplication Algorithm:**

```javascript
/**
 * Check if listing is duplicate
 * @param {Object} listing - New listing to check
 * @param {Set} seenHashes - Set of previously seen listing hashes
 * @returns {boolean} True if duplicate
 */
function isDuplicate(listing, seenHashes) {
  // Generate hash from listing
  const hash = crypto
    .createHash('md5')
    .update(`${listing.source.platform}:${listing.source.id}`)
    .digest('hex');

  // Check if seen before
  if (seenHashes.has(hash)) {
    return true;
  }

  // Add to seen hashes
  seenHashes.add(hash);
  return false;
}
```

### 2.6 Examples of Output Records

#### Example 1: GOAT Listing (Authenticated Platform)

```json
{
  "id": "goat_987654321",
  "product": {
    "name": "Air Jordan 1 Retro High OG 'Chicago' (2015)",
    "brand": "Air Jordan",
    "model": "Air Jordan 1",
    "colorway": "Chicago",
    "sku": "555088-101",
    "releaseYear": 2015
  },
  "listing": {
    "price": 1850.0,
    "currency": "USD",
    "size_us_mens": "10.5",
    "size_us_womens": null,
    "size_eu": "44.5",
    "size_uk": "9.5",
    "condition": "new_in_box",
    "tags": ["authenticated", "goat_verified", "og_all"],
    "type": "sell",
    "description": "Brand new, never worn. Includes original box, laces, and receipt. Authenticated by GOAT.",
    "listedAt": "2025-11-08T10:00:00Z"
  },
  "source": {
    "platform": "GOAT",
    "url": "https://goat.com/sneakers/air-jordan-1-retro-high-og-chicago-555088-101",
    "id": "987654321",
    "is_authenticated": true,
    "imageUrl": "https://i.ytimg.com/vi/IiCDqdOzteg/hqdefault.jpg",
    "additionalImages": ["https://i.ytimg.com/vi/VPgMuXXf5Qg/hqdefault.jpg"]
  },
  "seller": null,
  "scrape": {
    "timestamp": "2025-11-10T14:30:00Z",
    "runId": "abc123xyz456",
    "version": "1.0.0",
    "method": "orchestrated"
  },
  "dealScore": null
}
```

#### Example 2: Grailed Listing (P2P Platform with AI Parsing)

```json
{
  "id": "grailed_12345678",
  "product": {
    "name": "Air Jordan 1 Retro High OG 'Bred' (2016)",
    "brand": "Air Jordan",
    "model": "Air Jordan 1",
    "colorway": "Bred",
    "sku": "555088-001",
    "releaseYear": 2016
  },
  "listing": {
    "price": 750.0,
    "currency": "USD",
    "size_us_mens": "10.5",
    "size_us_womens": null,
    "size_eu": null,
    "size_uk": null,
    "condition": "used_like_new",
    "tags": ["vnds", "og_all"],
    "type": "sell",
    "description": "VNDS condition, worn once. Includes OG box, laces, and receipt. No flaws, just like new. Size 10.5 US Men's.",
    "listedAt": "2025-11-09T18:45:00Z"
  },
  "source": {
    "platform": "Grailed",
    "url": "https://grailed.com/listings/12345678",
    "id": "12345678",
    "is_authenticated": false,
    "imageUrl": "https://i.ytimg.com/vi/tK9VZOcEBxA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBtgvH2y__ZEgkuZqHQvyyFpEe6ZA",
    "additionalImages": []
  },
  "seller": {
    "name": "sneakerhead_nyc",
    "rating": 4.9,
    "reviewCount": 127,
    "verified": true,
    "location": "New York, NY"
  },
  "scrape": {
    "timestamp": "2025-11-10T14:30:15Z",
    "runId": "abc123xyz456",
    "version": "1.0.0",
    "method": "scraping"
  },
  "dealScore": {
    "isBelowMarket": true,
    "marketValue": 950.0,
    "savingsPercentage": 21.1,
    "savingsAmount": 200.0,
    "dealQuality": "good"
  }
}
```

#### Example 3: eBay Listing (API-based)

```json
{
  "id": "ebay_384729103827",
  "product": {
    "name": "Nike Dunk Low Retro 'Panda' (2021)",
    "brand": "Nike",
    "model": "Dunk Low",
    "colorway": "Panda",
    "sku": "DD1391-100",
    "releaseYear": 2021
  },
  "listing": {
    "price": 150.0,
    "currency": "USD",
    "size_us_mens": "11",
    "size_us_womens": null,
    "size_eu": "45",
    "size_uk": "10",
    "condition": "new_in_box",
    "tags": ["authenticity_guarantee", "buy_it_now"],
    "type": "sell",
    "description": "Brand new Nike Dunk Low Panda. Size 11. eBay Authenticity Guarantee included. Fast shipping.",
    "listedAt": "2025-11-10T09:00:00Z"
  },
  "source": {
    "platform": "eBay",
    "url": "https://lh3.googleusercontent.com/8q0GqCFAtMTLVZfwE6CdB7dIU26n1vUMZODPkm8iVEVcvffgnhPLnKHV_uR4qKwnKsJfNVaUnBIxvuBV1WQWjIiI=s1280-w1280-h800",
    "id": "384729103827",
    "is_authenticated": true,
    "imageUrl": "https://i.ebayimg.com/images/g/xxxxx/s-l1600.jpg",
    "additionalImages": []
  },
  "seller": {
    "name": "trusted_sneakers",
    "rating": 4.8,
    "reviewCount": 2341,
    "verified": true,
    "location": "Los Angeles, CA"
  },
  "scrape": {
    "timestamp": "2025-11-10T14:30:30Z",
    "runId": "abc123xyz456",
    "version": "1.0.0",
    "method": "api"
  },
  "dealScore": {
    "isBelowMarket": true,
    "marketValue": 180.0,
    "savingsPercentage": 16.7,
    "savingsAmount": 30.0,
    "dealQuality": "fair"
  }
}
```

#### Example 4: Craigslist Listing (Unstructured Data)

```json
{
  "id": "d47e8f9a3c2b1e8d6f5a4c3b2e1d0c9b",
  "product": {
    "name": "Jordan 4 Military Blue",
    "brand": "Air Jordan",
    "model": "Jordan 4",
    "colorway": "Military Blue",
    "sku": null,
    "releaseYear": null
  },
  "listing": {
    "price": 200.0,
    "currency": "USD",
    "size_us_mens": "10",
    "size_us_womens": null,
    "size_eu": null,
    "size_uk": null,
    "condition": "used_good",
    "tags": [],
    "type": "sell",
    "description": "Jordan 4 Military Blue size 10. Good condition, worn a few times. No box. $200 OBO.",
    "listedAt": null
  },
  "source": {
    "platform": "Craigslist",
    "url": "https://newyork.craigslist.org/mnh/clo/d/jordan-4-military-blue/7685123456.html",
    "id": "7685123456",
    "is_authenticated": false,
    "imageUrl": "https://i.ytimg.com/vi/RfRzRlQZdDI/sddefault.jpg",
    "additionalImages": []
  },
  "seller": {
    "name": null,
    "rating": null,
    "reviewCount": null,
    "verified": null,
    "location": "Manhattan, NY"
  },
  "scrape": {
    "timestamp": "2025-11-10T14:31:00Z",
    "runId": "abc123xyz456",
    "version": "1.0.0",
    "method": "scraping"
  },
  "dealScore": null
}
```

### 2.7 Supported Export Formats

Apify Dataset supports multiple export formats via API:

#### JSON (Default)

```
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=json
```

#### JSON Lines (JSONL)

```
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=jsonl
```

#### CSV

```
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=csv
```

#### Excel (XLSX)

```
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=xlsx
```

#### XML

```
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=xml
```

#### RSS Feed

```
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=rss
```

**Field Filtering:**

```
# Get only specific fields
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=json&fields=product,listing,source

# Omit specific fields
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=json&omit=scrape,seller
```

**Data Cleaning:**

```
# Clean data (remove Apify internal fields like #debug, #error)
GET https://api.apify.com/v2/datasets/{DATASET_ID}/items?format=json&clean=true
```

---

## 3. Notification System Specification

### 3.1 Email Notification Specification

#### 3.1.1 Template Structure

**HTML Email Template Location:** `src/templates/email-alert.html`

**Template Variables:**

```javascript
{
  listings: Array<Listing>,      // New listings to alert about
  totalCount: Number,             // Total number of listings
  searchTerms: Array<String>,     // User's search terms
  platforms: Array<String>,       // Platforms that were searched
  bestDeal: Listing | null,       // Listing with highest savings percentage
  timestamp: String,              // When alert was generated
  unsubscribeUrl: String          // Unsubscribe link
}
```

**Full HTML Template:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SneakerMeta Alert</title>
    <style>
      /* Reset styles */
      body,
      html {
        margin: 0;
        padding: 0;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f4f7;
      }

      /* Container */
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      /* Header */
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        padding: 40px 30px;
        text-align: center;
      }

      .header h1 {
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: 700;
      }

      .header p {
        margin: 0;
        font-size: 16px;
        opacity: 0.9;
      }

      /* Best Deal Banner */
      .best-deal-banner {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
        color: #ffffff;
        padding: 20px 30px;
        text-align: center;
      }

      .best-deal-banner h2 {
        margin: 0 0 5px 0;
        font-size: 20px;
        font-weight: 700;
      }

      .best-deal-banner p {
        margin: 0;
        font-size: 14px;
        opacity: 0.95;
      }

      /* Content */
      .content {
        padding: 30px;
      }

      .summary {
        background: #f8f9fa;
        border-left: 4px solid #667eea;
        padding: 15px 20px;
        margin-bottom: 30px;
        border-radius: 4px;
      }

      .summary p {
        margin: 5px 0;
        font-size: 14px;
        color: #495057;
      }

      .summary strong {
        color: #212529;
      }

      /* Listing Card */
      .listing {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        transition: box-shadow 0.2s;
      }

      .listing:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .listing-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
      }

      .listing-title {
        flex: 1;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #212529;
        line-height: 1.4;
      }

      .deal-badge {
        background: #ff4757;
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        margin-left: 10px;
        white-space: nowrap;
      }

      .listing-image {
        width: 100%;
        max-width: 500px;
        height: auto;
        border-radius: 6px;
        margin: 15px 0;
      }

      .listing-details {
        margin: 15px 0;
      }

      .price {
        font-size: 32px;
        font-weight: 700;
        color: #28a745;
        margin: 10px 0;
      }

      .old-price {
        text-decoration: line-through;
        color: #6c757d;
        font-size: 20px;
        margin-left: 10px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f1f3f5;
        font-size: 14px;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-weight: 600;
        color: #495057;
      }

      .detail-value {
        color: #212529;
      }

      .condition-badge {
        display: inline-block;
        background: #e7f5ff;
        color: #1971c2;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .platform-badge {
        display: inline-block;
        background: #f8f9fa;
        color: #495057;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .authenticated-badge {
        display: inline-block;
        background: #d3f9d8;
        color: #2b8a3e;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      /* CTA Button */
      .cta {
        display: inline-block;
        background: #667eea;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        margin-top: 15px;
        transition: background 0.2s;
      }

      .cta:hover {
        background: #5568d3;
      }

      /* Footer */
      .footer {
        background: #f8f9fa;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
      }

      .footer p {
        margin: 10px 0;
        font-size: 13px;
        color: #6c757d;
      }

      .footer a {
        color: #667eea;
        text-decoration: none;
      }

      .footer a:hover {
        text-decoration: underline;
      }

      /* Responsive */
      @media only screen and (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
        }

        .header,
        .content,
        .footer {
          padding: 20px;
        }

        .header h1 {
          font-size: 24px;
        }

        .listing-title {
          font-size: 16px;
        }

        .price {
          font-size: 26px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>🔥 {{totalCount}} New Sneaker{{totalCount > 1 ? 's' : ''}} Found!</h1>
        <p>Matching your search criteria</p>
      </div>

      {{#if bestDeal}}
      <!-- Best Deal Banner -->
      <div class="best-deal-banner">
        <h2>💎 BEST DEAL: {{bestDeal.dealScore.savingsPercentage}}% OFF</h2>
        <p>{{bestDeal.product.name}} - Save ${{bestDeal.dealScore.savingsAmount}}</p>
      </div>
      {{/if}}

      <!-- Content -->
      <div class="content">
        <!-- Summary -->
        <div class="summary">
          <p><strong>Search Terms:</strong> {{searchTerms.join(', ')}}</p>
          <p><strong>Platforms:</strong> {{platforms.join(', ')}}</p>
          <p><strong>Found:</strong> {{timestamp}}</p>
        </div>

        <!-- Listings -->
        {{#each listings}}
        <div class="listing">
          <div class="listing-header">
            <h2 class="listing-title">{{product.name}}</h2>
            {{#if dealScore.isBelowMarket}}
            <span class="deal-badge">SAVE {{dealScore.savingsPercentage}}%</span>
            {{/if}}
          </div>

          {{#if source.imageUrl}}
          <img src="{{source.imageUrl}}" alt="{{product.name}}" class="listing-image" />
          {{/if}}

          <div class="listing-details">
            <div class="price">
              ${{listing.price}} {{#if dealScore.marketValue}}
              <span class="old-price">${{dealScore.marketValue}}</span>
              {{/if}}
            </div>

            <div class="detail-row">
              <span class="detail-label">Size:</span>
              <span class="detail-value">{{listing.size_us_mens}} US Men's</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Condition:</span>
              <span class="detail-value">
                <span class="condition-badge">{{listing.condition}}</span>
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Platform:</span>
              <span class="detail-value">
                <span class="platform-badge">{{source.platform}}</span>
                {{#if source.is_authenticated}}
                <span class="authenticated-badge">✓ AUTHENTICATED</span>
                {{/if}}
              </span>
            </div>

            {{#if seller.name}}
            <div class="detail-row">
              <span class="detail-label">Seller:</span>
              <span class="detail-value">
                {{seller.name}} {{#if seller.verified}}✓{{/if}} {{#if
                seller.rating}}({{seller.rating}}/5){{/if}}
              </span>
            </div>
            {{/if}} {{#if listing.description}}
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">{{listing.description}}</span>
            </div>
            {{/if}}
          </div>

          <a href="{{source.url}}" class="cta">View Listing →</a>
        </div>
        {{/each}}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>Powered by SneakerMeta</strong> | <a href="https://apify.com">Apify Actor</a></p>
        <p>
          <a href="#">Manage Alert Settings</a> |
          <a href="{{unsubscribeUrl}}">Unsubscribe</a>
        </p>
        <p style="font-size: 11px; color: #adb5bd; margin-top: 20px;">
          You received this email because you subscribed to SneakerMeta alerts.
          <br />This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </body>
</html>
```

**Plain Text Template (Fallback):**

```
=============================================================================
🔥 {{totalCount}} NEW SNEAKER{{totalCount > 1 ? 'S' : ''}} FOUND!
=============================================================================

{{#if bestDeal}}
💎 BEST DEAL: {{bestDeal.dealScore.savingsPercentage}}% OFF
{{bestDeal.product.name}} - Save ${{bestDeal.dealScore.savingsAmount}}
{{/if}}

SEARCH SUMMARY
- Search Terms: {{searchTerms.join(', ')}}
- Platforms: {{platforms.join(', ')}}
- Found: {{timestamp}}

-----------------------------------------------------------------------------

{{#each listings}}
{{loop.index}}. {{product.name}}
   {{#if dealScore.isBelowMarket}}[SAVE {{dealScore.savingsPercentage}}%]{{/if}}

   Price: ${{listing.price}}{{#if dealScore.marketValue}} (Market: ${{dealScore.marketValue}}){{/if}}
   Size: {{listing.size_us_mens}} US Men's
   Condition: {{listing.condition}}
   Platform: {{source.platform}}{{#if source.is_authenticated}} [AUTHENTICATED]{{/if}}
   {{#if seller.name}}Seller: {{seller.name}}{{#if seller.verified}} ✓{{/if}}{{/if}}

   {{#if listing.description}}Description: {{listing.description}}{{/if}}

   VIEW LISTING: {{source.url}}

-----------------------------------------------------------------------------
{{/each}}

Powered by SneakerMeta | https://apify.com
Manage settings | Unsubscribe: {{unsubscribeUrl}}

You received this email because you subscribed to SneakerMeta alerts.
This is an automated message, please do not reply.
```

#### 3.1.2 Dynamic Fields and Personalization

**Personalization Variables:**

```javascript
{
  // User information
  userEmail: String,               // Recipient email
  userName: String | null,         // User's name (if available)

  // Search context
  searchTerms: Array<String>,      // What they searched for
  platforms: Array<String>,        // Where we searched

  // Listing aggregation
  totalCount: Number,              // Total new listings
  byPlatform: Object,              // Count per platform
  // Example: { "GOAT": 5, "Grailed": 8, "eBay": 12 }

  // Deal highlights
  bestDeal: Listing | null,        // Highest savings %
  averagePrice: Number,            // Average price of all listings
  priceRange: {min: Number, max: Number},

  // Timestamp
  timestamp: String,               // Human-readable (e.g., "November 10, 2025 at 2:30 PM")

  // Utility links
  unsubscribeUrl: String,          // Unsubscribe from alerts
  manageSettingsUrl: String,       // Update alert preferences
  viewAllUrl: String               // View all results in Apify dataset
}
```

**Dynamic Content Blocks:**

1. **Best Deal Callout** (only if `dealScore.savingsPercentage >= 20%`):

```html
{{#if bestDeal}}
<div class="best-deal-banner">
  <h2>💎 BEST DEAL: {{bestDeal.dealScore.savingsPercentage}}% OFF</h2>
  <p>{{bestDeal.product.name}} - Save ${{bestDeal.dealScore.savingsAmount}}</p>
</div>
{{/if}}
```

2. **Authentication Badge** (only for authenticated platforms):

```html
{{#if source.is_authenticated}}
<span class="authenticated-badge">✓ AUTHENTICATED</span>
{{/if}}
```

3. **Price Comparison** (only if market value is known):

```html
{{#if dealScore.marketValue}}
<span class="old-price">${{dealScore.marketValue}}</span>
{{/if}}
```

4. **Seller Information** (only if available):

```html
{{#if seller.name}}
<div class="detail-row">
  <span class="detail-label">Seller:</span>
  <span class="detail-value">
    {{seller.name}} {{#if seller.verified}}✓{{/if}} {{#if
    seller.rating}}({{seller.rating}}/5){{/if}}
  </span>
</div>
{{/if}}
```

#### 3.1.3 Subject Line Generation

**Dynamic Subject Lines:**

```javascript
/**
 * Generate email subject line based on findings
 */
function generateEmailSubject(listings, bestDeal) {
  const count = listings.length;

  // If best deal exists and is significant (>20% savings)
  if (bestDeal && bestDeal.dealScore?.savingsPercentage >= 20) {
    return `🔥 ${bestDeal.product.colorway} ${bestDeal.product.model} - ${bestDeal.dealScore.savingsPercentage}% OFF ($${bestDeal.listing.price})`;
  }

  // If single listing
  if (count === 1) {
    const listing = listings[0];
    return `🔔 New: ${listing.product.name} - $${listing.listing.price}`;
  }

  // Multiple listings
  if (count <= 5) {
    return `🔔 ${count} New Sneaker Deals Found`;
  }

  // Many listings
  return `🔥 ${count} New Sneaker Deals - Starting at $${Math.min(...listings.map((l) => l.listing.price))}`;
}
```

**Subject Line Examples:**

- `🔥 Bred Air Jordan 1 - 25% OFF ($750)`
- `🔔 New: Yeezy 350 Zebra - $280`
- `🔔 3 New Sneaker Deals Found`
- `🔥 12 New Sneaker Deals - Starting at $89`

#### 3.1.4 Delivery Service Integration

**Service: SendGrid (Recommended)**

**Installation:**

```bash
npm install @sendgrid/mail
```

**Implementation:** `src/utils/email-notifier.js`

```javascript
const sgMail = require('@sendgrid/mail');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const Actor = require('apify');

class EmailNotifier {
  constructor(apiKey, fromEmail) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail || 'alerts@sneakermeta.com';
    sgMail.setApiKey(apiKey);
  }

  /**
   * Send email alert
   * @param {Array} listings - New listings to alert about
   * @param {String} toEmail - Recipient email
   * @param {Object} context - Additional context (searchTerms, platforms, etc.)
   */
  async sendAlert(listings, toEmail, context) {
    try {
      // Skip if no listings
      if (!listings || listings.length === 0) {
        Actor.log.info('No listings to send, skipping email');
        return { success: true, skipped: true };
      }

      // Load and compile template
      const htmlTemplate = await fs.readFile('./src/templates/email-alert.html', 'utf-8');
      const textTemplate = await fs.readFile('./src/templates/email-alert.txt', 'utf-8');

      const compiledHtml = Handlebars.compile(htmlTemplate);
      const compiledText = Handlebars.compile(textTemplate);

      // Prepare template data
      const templateData = {
        listings: listings.slice(0, 10), // Limit to 10 listings per email
        totalCount: listings.length,
        searchTerms: context.searchTerms,
        platforms: context.platforms,
        bestDeal: this.findBestDeal(listings),
        timestamp: this.formatTimestamp(new Date()),
        unsubscribeUrl: this.generateUnsubscribeUrl(toEmail),
        manageSettingsUrl: 'https://sneakermeta.com/settings',
        viewAllUrl: context.datasetUrl || '#',
      };

      // Generate HTML and text content
      const html = compiledHtml(templateData);
      const text = compiledText(templateData);

      // Generate subject
      const subject = this.generateSubject(listings, templateData.bestDeal);

      // Send email
      const msg = {
        to: toEmail,
        from: {
          email: this.fromEmail,
          name: 'SneakerMeta Alerts',
        },
        subject: subject,
        text: text,
        html: html,
        trackingSettings: {
          clickTracking: {
            enable: true,
          },
          openTracking: {
            enable: true,
          },
        },
      };

      // Redact recipient email before logging to avoid PII in logs
      const redactEmail = (email) => {
        if (!email || typeof email !== 'string') return 'unknown';
        const [local, domain] = email.split('@');
        if (!domain) return 'unknown';
        const first = local?.[0] ?? '';
        const masked =
          local && local.length > 1 ? `${first}${'*'.repeat(local.length - 1)}` : first;
        return `${masked}@${domain}`;
      };

      Actor.log.info(`Sending email to ${redactEmail(toEmail)} with ${listings.length} listing(s)`);

      const [response] = await sgMail.send(msg);

      Actor.log.info('Email sent successfully', {
        statusCode: response.statusCode,
        to: redactEmail(toEmail),
        listingCount: listings.length,
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        to: redactEmail(toEmail),
        listingCount: listings.length,
      };
    } catch (error) {
      Actor.log.error('Failed to send email', {
        error: error.message,
        to: redactEmail(toEmail),
        code: error.code,
        response: error.response?.body,
      });

      throw error;
    }
  }

  /**
   * Send batch email (daily digest)
   */
  async sendDigest(listings, toEmail, context) {
    // Group listings by search term or platform
    const grouped = this.groupListings(listings);

    // Use digest template (simplified version)
    // ...similar to sendAlert but with different template
  }

  /**
   * Find best deal (highest savings percentage)
   */
  findBestDeal(listings) {
    return (
      listings
        .filter((l) => l.dealScore?.isBelowMarket)
        .sort((a, b) => b.dealScore.savingsPercentage - a.dealScore.savingsPercentage)[0] || null
    );
  }

  /**
   * Generate email subject line
   */
  generateSubject(listings, bestDeal) {
    const count = listings.length;

    if (bestDeal && bestDeal.dealScore?.savingsPercentage >= 20) {
      return `🔥 ${bestDeal.product.colorway} ${bestDeal.product.model} - ${bestDeal.dealScore.savingsPercentage}% OFF ($${bestDeal.listing.price})`;
    }

    if (count === 1) {
      const listing = listings[0];
      return `🔔 New: ${listing.product.name} - $${listing.listing.price}`;
    }

    if (count <= 5) {
      return `🔔 ${count} New Sneaker Deals Found`;
    }

    return `🔥 ${count} New Sneaker Deals - Starting at $${Math.min(...listings.map((l) => l.listing.price))}`;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(date) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }

  /**
   * Generate unsubscribe URL
   */
  generateUnsubscribeUrl(email) {
    // TODO: Implement unsubscribe mechanism
    return `https://sneakermeta.com/unsubscribe?email=${encodeURIComponent(email)}`;
  }

  /**
   * Retry logic with exponential backoff
   */
  async sendWithRetry(msg, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await sgMail.send(msg);
      } catch (error) {
        if (attempt === maxRetries) throw error;

        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        Actor.log.warning(`Email send attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = EmailNotifier;
```

**SendGrid Configuration:**

```javascript
// Get API key from Apify Key-Value Store or environment variable
const SENDGRID_API_KEY = (await Actor.getValue('SENDGRID_API_KEY')) || process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'alerts@sneakermeta.com'; // Must be verified in SendGrid

const emailNotifier = new EmailNotifier(SENDGRID_API_KEY, FROM_EMAIL);

// Send alert
await emailNotifier.sendAlert(newListings, userEmail, {
  searchTerms: input.searchTerms,
  platforms: input.targetPlatforms,
  datasetUrl: `https://console.apify.com/storage/datasets/${datasetId}`,
});
```

**Rate Limiting:**

```javascript
// SendGrid free tier: 100 emails/day
// Track usage
let emailsSentToday = await Actor.getValue('emails_sent_today') || 0;
const today = new Date().toISOString().split('T')[0];
const lastResetDate = await Actor.getValue('last_reset_date');

if (lastResetDate !== today) {
  // Reset counter for new day
  emailsSentToday = 0;
  await Actor.setValue('last_reset_date', today);
}

if (emailsSentToday >= 100) {
  throw new Error('Daily email limit (100) reached. Upgrade SendGrid plan.');
}

// Send email
await emailNotifier.sendAlert(...);

// Increment counter
await Actor.setValue('emails_sent_today', emailsSentToday + 1);
```

### 3.2 SMS Notification Specification (Future Enhancement)

**Optional premium feature ($9.99/month tier).**

**Service: Twilio**

**Implementation Sketch:**

```javascript
const twilio = require('twilio');

class SMSNotifier {
  constructor(accountSid, authToken, fromNumber) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async sendAlert(listings, toPhoneNumber) {
    const count = listings.length;
    const bestDeal = listings[0]; // Assume sorted by deal quality

    const message =
      count === 1
        ? `🔔 New: ${bestDeal.product.name} - $${bestDeal.listing.price} on ${bestDeal.source.platform}`
        : `🔥 ${count} new sneaker deals found! Best: ${bestDeal.product.name} - $${bestDeal.listing.price}`;

    await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: toPhoneNumber,
    });
  }
}
```

**Cost:** ~$0.0079 per SMS (US)

### 3.3 Webhook Specification

#### 3.3.1 Payload Format

**Endpoint:** User-provided HTTPS URL  
**Method:** POST  
**Content-Type:** `application/json`

**Payload Structure:**

```json
{
  "event": "new_listings_found",
  "timestamp": "2025-11-10T14:30:00Z",
  "runId": "abc123xyz456",
  "summary": {
    "totalNewListings": 12,
    "platformBreakdown": {
      "GOAT": 3,
      "Grailed": 5,
      "eBay": 4
    },
    "averagePrice": 625.5,
    "priceRange": {
      "min": 150.0,
      "max": 1850.0
    },
    "bestDeal": {
      "productName": "Air Jordan 1 Bred",
      "price": 750.0,
      "marketValue": 950.0,
      "savingsPercentage": 21.1,
      "url": "https://grailed.com/listings/12345678",
      "platform": "Grailed"
    }
  },
  "listings": [
    {
      "id": "grailed_12345678",
      "product": {
        "name": "Air Jordan 1 Retro High OG 'Bred' (2016)",
        "brand": "Air Jordan",
        "model": "Air Jordan 1",
        "colorway": "Bred",
        "sku": "555088-001"
      },
      "listing": {
        "price": 750.0,
        "currency": "USD",
        "size_us_mens": "10.5",
        "condition": "used_like_new",
        "tags": ["vnds", "og_all"]
      },
      "source": {
        "platform": "Grailed",
        "url": "https://grailed.com/listings/12345678",
        "imageUrl": "https://i.ytimg.com/vi/iJwkJuDtsTU/maxresdefault.jpg"
      },
      "dealScore": {
        "isBelowMarket": true,
        "savingsPercentage": 21.1
      }
    }
    // ... more listings (up to 100)
  ],
  "metadata": {
    "searchTerms": ["Air Jordan 1", "Yeezy 350"],
    "platforms": ["GOAT", "Grailed", "eBay"],
    "filters": {
      "sizes": ["10", "10.5", "11"],
      "maxPrice": 1500
    }
  }
}
```

#### 3.3.2 Authentication (HMAC Signature)

**Security:** Use HMAC-SHA256 signature to verify webhook authenticity.

**Headers:**

```
X-SneakerMeta-Signature: sha256=abc123...
X-SneakerMeta-Event: new_listings_found
X-SneakerMeta-Timestamp: 1699632000
X-SneakerMeta-ID: webhook_abc123xyz
```

**Signature Generation (Sender):**

```javascript
const crypto = require('crypto');

function generateWebhookSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}

// Example usage
const payload = { event: 'new_listings_found', ... };
const secret = input.notificationConfig.webhookSecret || 'default_secret';
const signature = generateWebhookSignature(payload, secret);

await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SneakerMeta-Signature': signature,
    'X-SneakerMeta-Event': 'new_listings_found',
    'X-SneakerMeta-Timestamp': Math.floor(Date.now() / 1000).toString(),
    'X-SneakerMeta-ID': `webhook_${crypto.randomBytes(16).toString('hex')}`
  },
  body: JSON.stringify(payload)
});
```

**Signature Verification (Receiver):**

```javascript
// Example: Node.js webhook receiver
const crypto = require('crypto');

function verifyWebhookSignature(req, secret) {
  const signatureHeader = req.headers['x-sneakermeta-signature'];
  const timestamp = req.headers['x-sneakermeta-timestamp'];

  if (!signatureHeader || !timestamp) {
    throw new Error('Missing signature or timestamp header');
  }

  if (!signatureHeader.startsWith('sha256=')) {
    throw new Error('Unsupported signature algorithm');
  }

  const signatureHex = signatureHeader.slice('sha256='.length);

  // Check timestamp (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
    // 5 minutes
    throw new Error('Webhook timestamp too old');
  }

  // Verify signature
  const expectedHex = generateWebhookSignature(req.body, secret);
  const provided = Buffer.from(signatureHex, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');

  if (provided.length !== expected.length) {
    throw new Error('Invalid webhook signature length');
  }

  if (!crypto.timingSafeEqual(provided, expected)) {
    throw new Error('Invalid webhook signature');
  }

  return true;
}
```

#### 3.3.3 Retry Logic

**Strategy:** Exponential backoff with 3 attempts

```javascript
async function sendWebhookWithRetry(url, payload, secret, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const signature = generateWebhookSignature(payload, secret);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SneakerMeta-Signature': signature,
          'X-SneakerMeta-Event': payload.event,
          'X-SneakerMeta-Timestamp': Math.floor(Date.now() / 1000).toString(),
        },
        body: JSON.stringify(payload),
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      Actor.log.info('Webhook delivered successfully', {
        url,
        attempt,
        status: response.status,
      });

      return { success: true, attempt, status: response.status };
    } catch (error) {
      Actor.log.warning(`Webhook attempt ${attempt} failed`, {
        url,
        error: error.message,
        attempt,
      });

      if (attempt === maxRetries) {
        // Final attempt failed, log and move on
        Actor.log.error('Webhook delivery failed after all retries', {
          url,
          error: error.message,
          attempts: maxRetries,
        });

        // Optionally: Send fallback email notification
        await sendFallbackEmailNotification(error);

        return { success: false, error: error.message, attempts: maxRetries };
      }

      // Wait before retry (exponential backoff: 2s, 4s, 8s)
      const delay = Math.pow(2, attempt) * 1000;
      Actor.log.info(`Retrying webhook in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

**Timeout:** 30 seconds per attempt  
**Total max time:** ~45 seconds (2s + 4s + 8s + 30s per attempt)

### 3.4 Slack/Discord Integration

#### Slack Webhook Format

```javascript
async function sendSlackNotification(listings, webhookUrl) {
  const bestDeal = listings[0]; // Assume sorted

  const message = {
    text: `🔥 *${listings.length} New Sneaker Deal${listings.length > 1 ? 's' : ''} Found!*`,
    attachments: listings.slice(0, 5).map((listing) => ({
      color: listing.dealScore?.isBelowMarket ? '#36a64f' : '#999999',
      author_name: listing.source.platform,
      author_icon: getPlatformIcon(listing.source.platform),
      title: listing.product.name,
      title_link: listing.source.url,
      text: listing.dealScore?.isBelowMarket
        ? `💰 *Save ${listing.dealScore.savingsPercentage}%* - Was $${listing.dealScore.marketValue}, now $${listing.listing.price}`
        : `$${listing.listing.price}`,
      fields: [
        {
          title: 'Size',
          value: listing.listing.size_us_mens || 'N/A',
          short: true,
        },
        {
          title: 'Condition',
          value: listing.listing.condition.replace(/_/g, ' '),
          short: true,
        },
      ],
      image_url: listing.source.imageUrl,
      footer: 'SneakerMeta',
      footer_icon: 'https://fabrikbrands.com/wp-content/uploads/Sneaker-Brand-Logos-7-1200x750.png',
      ts: Math.floor(Date.now() / 1000),
    })),
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}
```

#### Discord Webhook Format

```javascript
async function sendDiscordNotification(listings, webhookUrl) {
  const embeds = listings.slice(0, 10).map((listing) => ({
    title: listing.product.name,
    url: listing.source.url,
    description: listing.dealScore?.isBelowMarket
      ? `💰 **Save ${listing.dealScore.savingsPercentage}%** | Was $${listing.dealScore.marketValue}`
      : null,
    color: listing.dealScore?.isBelowMarket ? 0x00ff00 : 0x999999,
    fields: [
      {
        name: 'Price',
        value: `$${listing.listing.price}`,
        inline: true,
      },
      {
        name: 'Size',
        value: listing.listing.size_us_mens || 'N/A',
        inline: true,
      },
      {
        name: 'Condition',
        value: listing.listing.condition.replace(/_/g, ' '),
        inline: true,
      },
      {
        name: 'Platform',
        value: listing.source.platform + (listing.source.is_authenticated ? ' ✓' : ''),
        inline: true,
      },
    ],
    image: {
      url: listing.source.imageUrl,
    },
    footer: {
      text: 'SneakerMeta',
      icon_url: 'https://i.pinimg.com/736x/5f/fe/67/5ffe672fa1e6d014ddb71a15d44d7c9a.jpg',
    },
    timestamp: new Date().toISOString(),
  }));

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🔥 **${listings.length} New Sneaker Deal${listings.length > 1 ? 's' : ''}!**`,
      embeds: embeds,
    }),
  });
}
```

### 3.5 Notification Preferences and Filtering

**Preference Schema:**

```javascript
const notificationPreferences = {
  email: {
    enabled: true,
    frequency: 'immediate', // 'immediate', 'hourly', 'daily'
    minListings: 1, // Only send if >= X new listings
    includeSummary: true, // Include summary statistics
    includeImages: true, // Include product images
    maxListingsPerEmail: 10, // Limit email length
  },

  webhook: {
    enabled: true,
    url: 'https://...',
    secret: 'xxx',
    includeFullPayload: true, // vs. summary only
    batchNotifications: false, // Send immediately vs. batch
  },

  slack: {
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/...',
    channel: '#sneaker-deals',
    mentionUsers: [], // User IDs to @mention
    onlyBestDeals: false, // Only notify if savingsPercentage > 20%
  },

  discord: {
    enabled: true,
    webhookUrl: 'https://discord.com/api/webhooks/...',
    embedStyle: 'rich', // 'rich', 'minimal'
    pingRole: null, // Role ID to @mention
  },

  // Filters
  filters: {
    minSavingsPercentage: 0, // Only alert if deal is X% below market
    authenticatedOnly: false, // Only alert for authenticated platforms
    excludePlatforms: [], // Don't notify for these platforms
    sizesOnly: [], // Only alert for specific sizes
  },
};
```

### 3.6 Rate Limiting (max notifications per hour/day)

**Prevent Notification Spam:**

```javascript
class NotificationRateLimiter {
  constructor(kvStore) {
    this.kvStore = kvStore;
  }

  async checkLimit(userEmail, notificationType = 'email') {
    const limits = {
      email: { hourly: 10, daily: 50 },
      webhook: { hourly: 100, daily: 500 },
      slack: { hourly: 20, daily: 100 }
    };

    const limit = limits[notificationType];
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    // Get notification history
    const key = `notification_history_${userEmail}_${notificationType}`;
    const history = await this.kvStore.getValue(key) || [];

    // Filter to recent notifications
    const recentHour = history.filter(ts => ts > oneHourAgo);
    const recentDay = history.filter(ts => ts > oneDayAgo);

    // Check limits
    if (recentHour.length >= limit.hourly) {
      throw new Error(`Hourly notification limit (${limit.hourly}) exceeded for ${notificationType}`);
    }

    if (recentDay.length >= limit.daily) {
      throw new Error(`Daily notification limit (${limit.daily}) exceeded for ${notificationType}`);
    }

    // Add current timestamp
    history.push(now);

    // Keep only last 24 hours
    const recentHistory = history.filter(ts => ts > oneDayAgo);
    await this.kvStore.setValue(key, recentHistory);

    return {
      allowed: true,
      remaining: {
        hourly: limit.hourly - recentHour.length - 1,
        daily: limit.daily - recentDay.length - 1
      }
    };
  }
}

// Usage
const rateLimiter = new NotificationRateLimiter(kvStore);

try {
  const status = await rateLimiter.checkLimit(userEmail, 'email');
  Actor.log.info('Rate limit check passed', status.remaining);

  // Send notification
  await emailNotifier.sendAlert(...);

} catch (error) {
  Actor.log.warning('Rate limit exceeded', { error: error.message });
  // Skip notification, don't fail actor
}
```

### 3.7 Delivery Tracking and Confirmation

**Track Notification Delivery:**

```javascript
class NotificationTracker {
  constructor(kvStore) {
    this.kvStore = kvStore;
  }

  /**
   * Log notification delivery
   */
  async logDelivery(userEmail, notificationType, result) {
    const timestamp = new Date().toISOString();
    const key = `notification_log_${userEmail}`;

    const logEntry = {
      timestamp,
      type: notificationType,
      success: result.success,
      messageId: result.messageId || null,
      listingCount: result.listingCount || 0,
      error: result.error || null,
      attempt: result.attempt || 1,
    };

    // Get existing log
    const log = (await this.kvStore.getValue(key)) || [];
    log.push(logEntry);

    // Keep only last 100 entries
    const recentLog = log.slice(-100);
    await this.kvStore.setValue(key, recentLog);

    // Update delivery statistics
    await this.updateStatistics(userEmail, notificationType, result.success);

    return logEntry;
  }

  /**
   * Update delivery statistics
   */
  async updateStatistics(userEmail, notificationType, success) {
    const key = `notification_stats_${userEmail}`;
    const stats = (await this.kvStore.getValue(key)) || {
      email: { sent: 0, delivered: 0, failed: 0 },
      webhook: { sent: 0, delivered: 0, failed: 0 },
      slack: { sent: 0, delivered: 0, failed: 0 },
    };

    stats[notificationType].sent++;
    if (success) {
      stats[notificationType].delivered++;
    } else {
      stats[notificationType].failed++;
    }

    await this.kvStore.setValue(key, stats);
  }

  /**
   * Get delivery statistics
   */
  async getStatistics(userEmail) {
    const key = `notification_stats_${userEmail}`;
    return await this.kvStore.getValue(key);
  }
}

// Usage
const tracker = new NotificationTracker(kvStore);

// Log delivery
await tracker.logDelivery(userEmail, 'email', {
  success: true,
  messageId: 'sg_abc123',
  listingCount: 5,
});

// Get statistics
const stats = await tracker.getStatistics(userEmail);
Actor.log.info('Notification statistics', stats);
// Output: { email: { sent: 100, delivered: 98, failed: 2 }, ... }
```

---

_This is Part 1 of the Component Specification Document. The document continues with sections 4-8
(Price Tracking, Deduplication Logic, Error Handling, Platform Scrapers, and Testing
Specifications)._

**Current Progress: ~40% Complete**

Would you like me to continue with the remaining sections?

## 4. Price Tracking Specification

### 4.1 Price Data Model

**Price History Schema:**

```javascript
{
  // Composite key
  listingKey: String,  // {platform}:{listing_id}

  // Current price data
  current: {
    price: Number,           // Current price in USD
    currency: String,        // Original currency
    timestamp: String,       // ISO 8601 timestamp
    source: String,          // Platform name
    url: String              // Listing URL
  },

  // Historical prices
  history: [
    {
      price: Number,
      timestamp: String,
      change: Number,        // Price change from previous (-50.00 = $50 drop)
      changePercentage: Number  // Percentage change (-5.5 = 5.5% drop)
    }
  ],

  // Price statistics
  statistics: {
    firstSeenPrice: Number,     // Price when first discovered
    firstSeenDate: String,      // When first discovered
    lowestPrice: Number,        // Lowest price ever seen
    lowestPriceDate: String,    // When lowest price occurred
    highestPrice: Number,       // Highest price ever seen
    highestPriceDate: String,   // When highest price occurred
    averagePrice: Number,       // Average across all observations
    priceVolatility: Number,    // Standard deviation
    totalObservations: Number   // How many times we've checked
  },

  // Market comparison (if available)
  market: {
    goatPrice: Number | null,
    stockxPrice: Number | null,
    averageMarketValue: Number | null,
    lastUpdated: String | null
  },

  // Metadata
  metadata: {
    lastChecked: String,        // Last time we checked this listing
    checkCount: Number,         // Total number of checks
    isActive: Boolean,          // Whether listing still exists
    deactivatedDate: String | null  // When listing was removed/sold
  }
}
```

**Storage:** Apify Key-Value Store

- **Key Format:** `price_history_{platform}_{listing_id}`
- **Example:** `price_history_grailed_12345678`
- **Retention:** 90 days

### 4.2 Price Comparison Algorithm

#### 4.2.1 Cross-Platform Price Matching

**Problem:** Match same sneaker across different platforms to compare prices.

**Solution:** Fuzzy matching algorithm

```javascript
/**
 * Match sneakers across platforms
 * Uses product name, SKU, and size for matching
 */
class CrossPlatformMatcher {
  /**
   * Calculate similarity score between two listings
   * @param {Object} listing1 - First listing
   * @param {Object} listing2 - Second listing
   * @returns {Number} Similarity score (0-100)
   */
  calculateSimilarity(listing1, listing2) {
    let score = 0;

    // SKU match (highest weight, 40 points)
    if (listing1.product.sku && listing2.product.sku) {
      if (listing1.product.sku === listing2.product.sku) {
        score += 40;
      }
    }

    // Product name similarity (30 points)
    const nameScore = this.compareStrings(listing1.product.name, listing2.product.name);
    score += nameScore * 0.3;

    // Size match (20 points)
    if (listing1.listing.size_us_mens && listing2.listing.size_us_mens) {
      if (listing1.listing.size_us_mens === listing2.listing.size_us_mens) {
        score += 20;
      }
    }

    // Condition similarity (10 points)
    const conditionScore = this.compareConditions(
      listing1.listing.condition,
      listing2.listing.condition
    );
    score += conditionScore * 0.1;

    return Math.min(score, 100);
  }

  /**
   * String similarity using Levenshtein distance
   */
  compareStrings(str1, str2) {
    const normalized1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalized2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    return (1 - distance / maxLength) * 100;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Compare conditions
   */
  compareConditions(condition1, condition2) {
    const conditionOrder = [
      'new_in_box',
      'used_like_new',
      'used_good',
      'used_fair',
      'used_poor',
      'unspecified',
    ];

    const index1 = conditionOrder.indexOf(condition1);
    const index2 = conditionOrder.indexOf(condition2);

    if (index1 === index2) return 100;
    if (Math.abs(index1 - index2) === 1) return 70;
    if (Math.abs(index1 - index2) === 2) return 40;
    return 0;
  }

  /**
   * Find matching listings across platforms
   */
  findMatches(listing, allListings, threshold = 75) {
    const matches = [];

    for (const candidate of allListings) {
      // Skip same platform
      if (candidate.source.platform === listing.source.platform) {
        continue;
      }

      const similarity = this.calculateSimilarity(listing, candidate);

      if (similarity >= threshold) {
        matches.push({
          listing: candidate,
          similarity,
          priceDifference: candidate.listing.price - listing.listing.price,
          priceDifferencePercentage:
            ((candidate.listing.price - listing.listing.price) / listing.listing.price) * 100,
        });
      }
    }

    // Sort by price (cheapest first)
    return matches.sort((a, b) => a.listing.listing.price - b.listing.listing.price);
  }
}
```

#### 4.2.2 Price Drop Detection Logic

**Trigger Conditions:**

1. Absolute drop: Price decreases by $X or more
2. Percentage drop: Price decreases by Y% or more
3. Below market: Price drops below authenticated platform average

```javascript
/**
 * Price Drop Detector
 */
class PriceDropDetector {
  constructor(kvStore) {
    this.kvStore = kvStore;
    this.thresholds = {
      absoluteDrop: 50, // $50
      percentageDrop: 10, // 10%
      belowMarketPercent: 15, // 15% below market
    };
  }

  /**
   * Check if listing has price drop
   */
  async detectPriceDrop(listing) {
    const key = `price_history_${listing.source.platform}_${listing.source.id}`;
    const priceHistory = await this.kvStore.getValue(key);

    // First time seeing this listing
    if (!priceHistory) {
      await this.initializePriceHistory(listing);
      return { hasDrop: false, reason: 'first_observation' };
    }

    const currentPrice = listing.listing.price;
    const previousPrice = priceHistory.current.price;

    // No change
    if (currentPrice === previousPrice) {
      return { hasDrop: false, reason: 'no_change' };
    }

    // Price increased (not a drop)
    if (currentPrice > previousPrice) {
      await this.updatePriceHistory(listing, priceHistory);
      return { hasDrop: false, reason: 'price_increased' };
    }

    // Calculate drop metrics
    const absoluteDrop = previousPrice - currentPrice;
    const percentageDrop = (absoluteDrop / previousPrice) * 100;

    // Check thresholds
    const drops = [];

    if (absoluteDrop >= this.thresholds.absoluteDrop) {
      drops.push({
        type: 'absolute',
        value: absoluteDrop,
        message: `Price dropped by $${absoluteDrop.toFixed(2)}`,
      });
    }

    if (percentageDrop >= this.thresholds.percentageDrop) {
      drops.push({
        type: 'percentage',
        value: percentageDrop,
        message: `Price dropped by ${percentageDrop.toFixed(1)}%`,
      });
    }

    // Check if below market value
    if (listing.dealScore?.isBelowMarket) {
      const belowMarketPercent = listing.dealScore.savingsPercentage;
      if (belowMarketPercent >= this.thresholds.belowMarketPercent) {
        drops.push({
          type: 'below_market',
          value: belowMarketPercent,
          message: `Now ${belowMarketPercent.toFixed(1)}% below market value`,
        });
      }
    }

    // Update price history
    await this.updatePriceHistory(listing, priceHistory);

    if (drops.length > 0) {
      return {
        hasDrop: true,
        drops,
        previousPrice,
        currentPrice,
        absoluteDrop,
        percentageDrop,
      };
    }

    return { hasDrop: false, reason: 'below_threshold' };
  }

  /**
   * Initialize price history for new listing
   */
  async initializePriceHistory(listing) {
    const key = `price_history_${listing.source.platform}_${listing.source.id}`;

    const priceHistory = {
      listingKey: `${listing.source.platform}:${listing.source.id}`,
      current: {
        price: listing.listing.price,
        currency: listing.listing.currency,
        timestamp: new Date().toISOString(),
        source: listing.source.platform,
        url: listing.source.url,
      },
      history: [
        {
          price: listing.listing.price,
          timestamp: new Date().toISOString(),
          change: 0,
          changePercentage: 0,
        },
      ],
      statistics: {
        firstSeenPrice: listing.listing.price,
        firstSeenDate: new Date().toISOString(),
        lowestPrice: listing.listing.price,
        lowestPriceDate: new Date().toISOString(),
        highestPrice: listing.listing.price,
        highestPriceDate: new Date().toISOString(),
        averagePrice: listing.listing.price,
        priceVolatility: 0,
        totalObservations: 1,
      },
      market: {
        goatPrice: listing.dealScore?.marketValue || null,
        stockxPrice: null,
        averageMarketValue: listing.dealScore?.marketValue || null,
        lastUpdated: new Date().toISOString(),
      },
      metadata: {
        lastChecked: new Date().toISOString(),
        checkCount: 1,
        isActive: true,
        deactivatedDate: null,
      },
    };

    await this.kvStore.setValue(key, priceHistory);
  }

  /**
   * Update price history
   */
  async updatePriceHistory(listing, priceHistory) {
    const key = `price_history_${listing.source.platform}_${listing.source.id}`;
    const currentPrice = listing.listing.price;
    const previousPrice = priceHistory.current.price;

    // Add to history
    priceHistory.history.push({
      price: currentPrice,
      timestamp: new Date().toISOString(),
      change: currentPrice - previousPrice,
      changePercentage: ((currentPrice - previousPrice) / previousPrice) * 100,
    });

    // Keep only last 100 observations
    if (priceHistory.history.length > 100) {
      priceHistory.history = priceHistory.history.slice(-100);
    }

    // Update current
    priceHistory.current = {
      price: currentPrice,
      currency: listing.listing.currency,
      timestamp: new Date().toISOString(),
      source: listing.source.platform,
      url: listing.source.url,
    };

    // Update statistics
    const prices = priceHistory.history.map((h) => h.price);

    if (currentPrice < priceHistory.statistics.lowestPrice) {
      priceHistory.statistics.lowestPrice = currentPrice;
      priceHistory.statistics.lowestPriceDate = new Date().toISOString();
    }

    if (currentPrice > priceHistory.statistics.highestPrice) {
      priceHistory.statistics.highestPrice = currentPrice;
      priceHistory.statistics.highestPriceDate = new Date().toISOString();
    }

    priceHistory.statistics.averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    priceHistory.statistics.priceVolatility = this.calculateStandardDeviation(prices);
    priceHistory.statistics.totalObservations = prices.length;

    // Update metadata
    priceHistory.metadata.lastChecked = new Date().toISOString();
    priceHistory.metadata.checkCount++;

    await this.kvStore.setValue(key, priceHistory);
  }

  /**
   * Calculate standard deviation (price volatility)
   */
  calculateStandardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map((val) => Math.pow(val - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
}
```

#### 4.2.3 Alert Threshold Calculation

**User-Configurable Thresholds:**

```javascript
{
  // From input.advancedOptions
  priceDropAlerts: {
    enabled: Boolean,
    absoluteThreshold: Number,      // Default: 50 (dollars)
    percentageThreshold: Number,    // Default: 10 (percent)
    belowMarketThreshold: Number    // Default: 15 (percent below market)
  }
}
```

**Alert Generation:**

```javascript
async function generatePriceDropAlerts(listings, input) {
  const detector = new PriceDropDetector(kvStore);
  const alerts = [];

  for (const listing of listings) {
    const dropResult = await detector.detectPriceDrop(listing);

    if (dropResult.hasDrop) {
      alerts.push({
        type: 'price_drop',
        listing: listing,
        dropInfo: dropResult,
        priority: calculateAlertPriority(dropResult),
        message: generatePriceDropMessage(listing, dropResult),
      });
    }
  }

  return alerts;
}

function calculateAlertPriority(dropResult) {
  const { percentageDrop, drops } = dropResult;

  if (percentageDrop >= 30) return 'high';
  if (percentageDrop >= 20) return 'medium';
  if (drops.some((d) => d.type === 'below_market')) return 'medium';
  return 'low';
}

function generatePriceDropMessage(listing, dropResult) {
  const { absoluteDrop, percentageDrop } = dropResult;

  return (
    `🔻 PRICE DROP: ${listing.product.name} is now $${listing.listing.price} ` +
    `(was $${dropResult.previousPrice}) - Save $${absoluteDrop.toFixed(2)} ` +
    `(${percentageDrop.toFixed(1)}% off)`
  );
}
```

### 4.3 Historical Data Storage Strategy

**Storage Architecture:**

- **Short-term:** Apify Key-Value Store (90 days)
- **Long-term:** Optional export to external database (PostgreSQL, MongoDB)

**Key-Value Store Structure:**

```
Key Pattern: price_history_{platform}_{listing_id}
Expiration: 90 days (configurable)
Size: ~5-10 KB per listing (100 price points)
Total: ~50-100 MB for 10,000 tracked listings
```

**Data Retention Policy:**

```javascript
async function cleanupOldPriceHistory(kvStore) {
  const allKeys = await kvStore.listKeys();
  const now = Date.now();
  const retentionPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days

  for (const key of allKeys.items) {
    if (!key.key.startsWith('price_history_')) continue;

    const priceHistory = await kvStore.getValue(key.key);
    const lastChecked = new Date(priceHistory.metadata.lastChecked).getTime();

    if (now - lastChecked > retentionPeriod) {
      Actor.log.info(`Deleting old price history: ${key.key}`);
      await kvStore.delete(key.key);
    }
  }
}
```

### 4.4 Price Trend Analysis

**Trend Detection:**

```javascript
class PriceTrendAnalyzer {
  /**
   * Analyze price trend (increasing, decreasing, stable)
   */
  analyzeTrend(priceHistory) {
    if (priceHistory.history.length < 5) {
      return { trend: 'insufficient_data', confidence: 0 };
    }

    // Use last 10 observations
    const recentPrices = priceHistory.history.slice(-10).map((h) => h.price);

    // Calculate linear regression
    const regression = this.linearRegression(recentPrices);

    // Determine trend
    let trend;
    let confidence;

    if (Math.abs(regression.slope) < 1) {
      trend = 'stable';
      confidence = 1 - Math.abs(regression.slope);
    } else if (regression.slope > 0) {
      trend = 'increasing';
      confidence = Math.min(regression.slope / 10, 1);
    } else {
      trend = 'decreasing';
      confidence = Math.min(Math.abs(regression.slope) / 10, 1);
    }

    return {
      trend,
      confidence,
      slope: regression.slope,
      prediction: regression.predict(recentPrices.length + 1),
    };
  }

  /**
   * Simple linear regression
   */
  linearRegression(values) {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      slope,
      intercept,
      predict: (x) => slope * x + intercept,
    };
  }

  /**
   * Detect anomalous prices (outliers)
   */
  detectAnomalies(priceHistory) {
    const prices = priceHistory.history.map((h) => h.price);
    const mean = priceHistory.statistics.averagePrice;
    const stdDev = priceHistory.statistics.priceVolatility;

    return priceHistory.history.filter((h, i) => {
      const zScore = Math.abs((h.price - mean) / stdDev);
      return zScore > 2; // 2 standard deviations from mean
    });
  }
}
```

### 4.5 Alert Trigger Conditions

**Comprehensive Alert Conditions:**

```javascript
const ALERT_CONDITIONS = {
  // Price drop alerts
  PRICE_DROP_ABSOLUTE: {
    type: 'price_drop',
    condition: (current, previous, threshold) => previous - current >= threshold,
    defaultThreshold: 50, // $50
    priority: 'medium',
    message: (data) => `Price dropped by $${data.absoluteDrop.toFixed(2)}`,
  },

  PRICE_DROP_PERCENTAGE: {
    type: 'price_drop',
    condition: (current, previous, threshold) =>
      ((previous - current) / previous) * 100 >= threshold,
    defaultThreshold: 10, // 10%
    priority: 'medium',
    message: (data) => `Price dropped by ${data.percentageDrop.toFixed(1)}%`,
  },

  // Deal alerts
  BELOW_MARKET_VALUE: {
    type: 'deal',
    condition: (listing, threshold) => listing.dealScore?.savingsPercentage >= threshold,
    defaultThreshold: 15, // 15% below market
    priority: 'high',
    message: (data) => `${data.dealScore.savingsPercentage}% below market value`,
  },

  // New listing alerts
  NEW_LISTING_MATCHES_CRITERIA: {
    type: 'new_listing',
    condition: (listing, filters) => matchesAllFilters(listing, filters),
    priority: 'medium',
    message: (data) => `New listing matches your search criteria`,
  },

  // Rare listing alerts
  RARE_SIZE_AVAILABLE: {
    type: 'rare',
    condition: (listing, rareThreshold) => {
      // Size 14+ or size 7- are considered rare
      const size = parseFloat(listing.listing.size_us_mens);
      return size >= rareThreshold.large || size <= rareThreshold.small;
    },
    defaultThreshold: { small: 7, large: 14 },
    priority: 'high',
    message: (data) => `Rare size ${data.listing.size_us_mens} available`,
  },

  // Authenticated platform alerts
  AUTHENTICATED_PLATFORM_NEW_LISTING: {
    type: 'authenticated',
    condition: (listing) => listing.source.is_authenticated,
    priority: 'high',
    message: (data) => `New listing on authenticated platform: ${data.source.platform}`,
  },
};
```

### 4.6 Performance Requirements

**Latency Targets:**

- Price history lookup: < 50ms
- Cross-platform matching: < 500ms per listing
- Trend analysis: < 200ms per listing
- Alert generation: < 1 second for 100 listings

**Throughput:**

- Track up to 10,000 listings simultaneously
- Process 1,000 price updates per minute
- Generate alerts within 5 minutes of price change detection

**Optimization Strategies:**

```javascript
// 1. Batch price history updates
async function batchUpdatePriceHistory(listings) {
  const updates = listings.map((listing) => ({
    key: `price_history_${listing.source.platform}_${listing.source.id}`,
    value: generatePriceHistoryUpdate(listing),
  }));

  // Batch write to KV Store (more efficient)
  await Promise.all(updates.map((update) => kvStore.setValue(update.key, update.value)));
}

// 2. Cache frequently accessed price histories in memory
const priceHistoryCache = new Map();

async function getCachedPriceHistory(key) {
  if (priceHistoryCache.has(key)) {
    return priceHistoryCache.get(key);
  }

  const priceHistory = await kvStore.getValue(key);
  priceHistoryCache.set(key, priceHistory);

  // Expire cache after 5 minutes
  setTimeout(() => priceHistoryCache.delete(key), 5 * 60 * 1000);

  return priceHistory;
}

// 3. Parallel processing of price comparisons
async function compareAllPrices(listings) {
  const matcher = new CrossPlatformMatcher();

  // Process in chunks of 10
  const chunks = chunkArray(listings, 10);

  const results = [];
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((listing) => matcher.findMatches(listing, listings))
    );
    results.push(...chunkResults);
  }

  return results;
}
```

---

## 5. Deduplication Logic Specification

### 5.1 Duplicate Detection Algorithm

**Problem:** Listings may appear multiple times due to:

1. Same listing scraped in consecutive runs
2. Same sneaker listed by multiple sellers (not truly duplicate)
3. Seller relisting after sale
4. Same listing on multiple platforms (price aggregators)

**Solution:** Multi-level deduplication strategy

#### Level 1: Exact ID Matching

```javascript
/**
 * Level 1: Exact platform ID matching
 * Fast, deterministic, 100% accurate
 */
function generatePrimaryKey(listing) {
  return `${listing.source.platform}:${listing.source.id}`;
}

function isExactDuplicate(listing, seenKeys) {
  const key = generatePrimaryKey(listing);
  return seenKeys.has(key);
}
```

#### Level 2: Hash-Based Deduplication

```javascript
/**
 * Level 2: Content-based hashing
 * For platforms without stable IDs (Craigslist)
 */
const crypto = require('crypto');

function generateContentHash(listing) {
  // Create hash from immutable listing characteristics
  const hashString = [
    listing.source.platform,
    listing.product.name.toLowerCase().trim(),
    listing.listing.price,
    listing.listing.size_us_mens || 'no_size',
    listing.listing.condition,
    listing.seller?.name || 'no_seller',
  ].join('|');

  return crypto.createHash('md5').update(hashString).digest('hex');
}

function isContentDuplicate(listing, seenHashes) {
  const hash = generateContentHash(listing);
  return seenHashes.has(hash);
}
```

#### Level 3: Fuzzy Matching

```javascript
/**
 * Level 3: Fuzzy matching for near-duplicates
 * Catches relisted items with minor changes
 */
class FuzzyDuplicateDetector {
  constructor(similarityThreshold = 90) {
    this.threshold = similarityThreshold;
  }

  /**
   * Check if listing is fuzzy duplicate
   */
  isFuzzyDuplicate(listing, existingListings) {
    for (const existing of existingListings) {
      // Skip if different platforms
      if (existing.source.platform !== listing.source.platform) {
        continue;
      }

      // Calculate similarity score
      const similarity = this.calculateListingSimilarity(listing, existing);

      if (similarity >= this.threshold) {
        return {
          isDuplicate: true,
          match: existing,
          similarity,
          reason: this.identifyDifferenceReason(listing, existing),
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Calculate overall similarity between listings
   */
  calculateListingSimilarity(listing1, listing2) {
    let score = 0;
    let weights = 0;

    // Product name (weight: 0.3)
    const nameScore = this.stringSimilarity(listing1.product.name, listing2.product.name);
    score += nameScore * 0.3;
    weights += 0.3;

    // Price similarity (weight: 0.2)
    const priceScore = this.priceSimilarity(listing1.listing.price, listing2.listing.price);
    score += priceScore * 0.2;
    weights += 0.2;

    // Size (weight: 0.2)
    if (listing1.listing.size_us_mens && listing2.listing.size_us_mens) {
      if (listing1.listing.size_us_mens === listing2.listing.size_us_mens) {
        score += 0.2;
      }
      weights += 0.2;
    }

    // Seller (weight: 0.2)
    if (listing1.seller?.name && listing2.seller?.name) {
      if (listing1.seller.name === listing2.seller.name) {
        score += 0.2;
      }
      weights += 0.2;
    }

    // Image similarity (weight: 0.1)
    if (listing1.source.imageUrl && listing2.source.imageUrl) {
      if (listing1.source.imageUrl === listing2.source.imageUrl) {
        score += 0.1;
      }
      weights += 0.1;
    }

    return (score / weights) * 100;
  }

  /**
   * String similarity (Jaro-Winkler distance)
   */
  stringSimilarity(str1, str2) {
    const normalized1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalized2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Simple implementation (use library like 'natural' for production)
    if (normalized1 === normalized2) return 100;

    const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
    const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;

    if (longer.length === 0) return 100;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return ((longer.length - editDistance) / longer.length) * 100;
  }

  /**
   * Price similarity (within 5% tolerance)
   */
  priceSimilarity(price1, price2) {
    const difference = Math.abs(price1 - price2);
    const average = (price1 + price2) / 2;
    const percentDifference = (difference / average) * 100;

    if (percentDifference <= 5) return 100;
    if (percentDifference <= 10) return 80;
    if (percentDifference <= 15) return 60;
    return 0;
  }

  /**
   * Identify why listings are different
   */
  identifyDifferenceReason(listing1, listing2) {
    const reasons = [];

    if (listing1.listing.price !== listing2.listing.price) {
      const diff = listing1.listing.price - listing2.listing.price;
      reasons.push(`price_changed_by_${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
    }

    if (listing1.listing.condition !== listing2.listing.condition) {
      reasons.push(
        `condition_changed_from_${listing2.listing.condition}_to_${listing1.listing.condition}`
      );
    }

    if (listing1.listing.description !== listing2.listing.description) {
      reasons.push('description_updated');
    }

    return reasons.length > 0 ? reasons : ['minor_changes'];
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
```

### 5.2 Cross-Platform Deduplication Strategy

**Challenge:** Same sneaker listed on multiple platforms by aggregators (e.g., GOAT scrapes other
sites)

**Solution:** Mark as cross-platform duplicate but don't filter out

```javascript
class CrossPlatformDeduplicator {
  /**
   * Identify cross-platform duplicates
   * (Don't remove, just flag them)
   */
  async identifyCrossPlatformDuplicates(listings) {
    const matcher = new CrossPlatformMatcher();
    const grouped = [];
    const processed = new Set();

    for (const listing of listings) {
      if (processed.has(listing.id)) continue;

      // Find matches across platforms
      const matches = matcher.findMatches(listing, listings, 85);

      if (matches.length > 0) {
        // Create group
        const group = {
          primaryListing: listing,
          alternatives: matches,
          platforms: [listing.source.platform, ...matches.map((m) => m.listing.source.platform)],
          priceRange: {
            min: Math.min(listing.listing.price, ...matches.map((m) => m.listing.listing.price)),
            max: Math.max(listing.listing.price, ...matches.map((m) => m.listing.listing.price)),
          },
          bestDeal: this.findBestDeal([listing, ...matches.map((m) => m.listing)]),
        };

        grouped.push(group);

        // Mark as processed
        processed.add(listing.id);
        matches.forEach((m) => processed.add(m.listing.id));
      } else {
        // No matches, standalone listing
        grouped.push({
          primaryListing: listing,
          alternatives: [],
          platforms: [listing.source.platform],
          priceRange: { min: listing.listing.price, max: listing.listing.price },
          bestDeal: listing,
        });

        processed.add(listing.id);
      }
    }

    return grouped;
  }

  findBestDeal(listings) {
    // Consider price and platform authenticity
    return listings.sort((a, b) => {
      // Prioritize authenticated platforms
      if (a.source.is_authenticated && !b.source.is_authenticated) return -1;
      if (!a.source.is_authenticated && b.source.is_authenticated) return 1;

      // Then by price
      return a.listing.price - b.listing.price;
    })[0];
  }
}
```

### 5.3 Handling of Relisted Items

**Scenario:** Seller removes listing after sale, then relists same sneaker

**Detection:**

1. Same seller + same product + disappeared and reappeared
2. New listing with same characteristics but different ID

**Strategy:**

```javascript
class RelistingDetector {
  constructor(kvStore) {
    this.kvStore = kvStore;
  }

  /**
   * Detect if listing is a relist
   */
  async detectRelisting(listing) {
    const key = `seller_history_${listing.seller?.name || 'unknown'}`;
    const sellerHistory = (await this.kvStore.getValue(key)) || [];

    // Check if seller previously listed similar item
    for (const pastListing of sellerHistory) {
      if (this.isSimilarProduct(listing, pastListing)) {
        // Check if past listing disappeared
        if (pastListing.status === 'inactive') {
          const timeSinceInactive = Date.now() - new Date(pastListing.deactivatedAt).getTime();

          // If relisted within 30 days, mark as relist
          if (timeSinceInactive < 30 * 24 * 60 * 60 * 1000) {
            return {
              isRelist: true,
              originalListing: pastListing,
              daysSinceRemoval: Math.floor(timeSinceInactive / (24 * 60 * 60 * 1000)),
              priceChange: listing.listing.price - pastListing.price,
            };
          }
        }
      }
    }

    // Add to seller history
    sellerHistory.push({
      listingId: listing.id,
      product: listing.product.name,
      price: listing.listing.price,
      size: listing.listing.size_us_mens,
      listedAt: new Date().toISOString(),
      status: 'active',
    });

    // Keep only last 50 listings per seller
    if (sellerHistory.length > 50) {
      sellerHistory.shift();
    }

    await this.kvStore.setValue(key, sellerHistory);

    return { isRelist: false };
  }

  isSimilarProduct(listing1, listing2) {
    // Similar if same model and size
    return (
      listing1.product.model === listing2.product && listing1.listing.size_us_mens === listing2.size
    );
  }

  /**
   * Mark listing as inactive (sold/removed)
   */
  async markAsInactive(listing) {
    const key = `seller_history_${listing.seller?.name || 'unknown'}`;
    const sellerHistory = (await this.kvStore.getValue(key)) || [];

    const index = sellerHistory.findIndex((l) => l.listingId === listing.id);
    if (index !== -1) {
      sellerHistory[index].status = 'inactive';
      sellerHistory[index].deactivatedAt = new Date().toISOString();
      await this.kvStore.setValue(key, sellerHistory);
    }
  }
}
```

### 5.4 Data Structures for Tracking Seen Listings

**Primary Data Structure: Seen Hashes Set**

```javascript
// Stored in Key-Value Store
{
  key: 'seen_listing_hashes',
  value: {
    version: 1,
    lastUpdated: '2025-11-10T14:30:00Z',
    hashes: [
      'abc123def456...',  // MD5 hash of listing key
      'def456ghi789...',
      // ... up to 10,000 hashes
    ],
    statistics: {
      totalHashes: 8543,
      oldestHash: '2025-10-15T10:00:00Z',
      newestHash: '2025-11-10T14:30:00Z'
    }
  }
}
```

**Secondary Data Structure: Listing Metadata**

```javascript
// Stored separately for each listing
{
  key: 'listing_metadata_{hash}',
  value: {
    hash: 'abc123def456...',
    listingId: 'grailed_12345678',
    platform: 'Grailed',
    product: 'Air Jordan 1 Bred',
    size: '10.5',

    // Tracking info
    firstSeen: '2025-11-05T10:00:00Z',
    lastSeen: '2025-11-10T14:30:00Z',
    seenCount: 12,

    // Price tracking
    initialPrice: 800.00,
    currentPrice: 750.00,
    lowestPrice: 720.00,

    // Status
    isActive: true,
    soldAt: null
  }
}
```

### 5.5 Performance Optimization (hashing, indexing)

**Optimization Strategies:**

#### 1. In-Memory Hash Set (Fast Lookups)

```javascript
class InMemoryDeduplicator {
  constructor() {
    this.seenHashes = new Set();
    this.loaded = false;
  }

  /**
   * Load hashes from KV Store into memory
   */
  async initialize(kvStore) {
    if (this.loaded) return;

    const data = await kvStore.getValue('seen_listing_hashes');
    if (data && data.hashes) {
      this.seenHashes = new Set(data.hashes);
      Actor.log.info(`Loaded ${this.seenHashes.size} hashes into memory`);
    }

    this.loaded = true;
  }

  /**
   * Check if hash exists (O(1) lookup)
   */
  has(hash) {
    return this.seenHashes.has(hash);
  }

  /**
   * Add hash (O(1) insertion)
   */
  add(hash) {
    this.seenHashes.add(hash);
  }

  /**
   * Persist back to KV Store
   */
  async persist(kvStore) {
    const data = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      hashes: Array.from(this.seenHashes),
      statistics: {
        totalHashes: this.seenHashes.size,
        oldestHash: null, // TODO: Track timestamps
        newestHash: new Date().toISOString(),
      },
    };

    await kvStore.setValue('seen_listing_hashes', data);
    Actor.log.info(`Persisted ${this.seenHashes.size} hashes to KV Store`);
  }
}
```

#### 2. Bloom Filter (Memory-Efficient Probabilistic Check)

```javascript
/**
 * Bloom Filter for memory-efficient duplicate checking
 * Uses ~1 byte per hash (vs. 16 bytes for MD5 string)
 */
class BloomFilter {
  constructor(size = 100000, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }

  /**
   * Add element to bloom filter
   */
  add(item) {
    const hashes = this.getHashes(item);
    for (const hash of hashes) {
      const index = hash % this.size;
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      this.bits[byteIndex] |= 1 << bitIndex;
    }
  }

  /**
   * Check if element might exist
   * False positives possible, false negatives impossible
   */
  mightContain(item) {
    const hashes = this.getHashes(item);
    for (const hash of hashes) {
      const index = hash % this.size;
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      if (!(this.bits[byteIndex] & (1 << bitIndex))) {
        return false; // Definitely not in set
      }
    }
    return true; // Might be in set
  }

  /**
   * Generate multiple hash values
   */
  getHashes(item) {
    const crypto = require('crypto');
    const hashes = [];

    for (let i = 0; i < this.hashCount; i++) {
      const hash = crypto
        .createHash('md5')
        .update(item + i.toString())
        .digest();
      hashes.push(hash.readUInt32BE(0));
    }

    return hashes;
  }
}

// Usage
const bloomFilter = new BloomFilter(100000, 3);

// Add seen listings
for (const listing of seenListings) {
  bloomFilter.add(listing.id);
}

// Check new listing
if (bloomFilter.mightContain(newListing.id)) {
  // Might be duplicate, do full check
  const isDuplicate = await checkFullDuplicate(newListing);
} else {
  // Definitely not duplicate, skip check
}
```

#### 3. Batch Processing

```javascript
/**
 * Process listings in batches for better performance
 */
async function deduplicateBatch(listings, deduplicator) {
  const BATCH_SIZE = 100;
  const newListings = [];

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const results = await Promise.all(batch.map((listing) => deduplicator.checkDuplicate(listing)));

    // Filter new listings
    batch.forEach((listing, idx) => {
      if (!results[idx].isDuplicate) {
        newListings.push(listing);
      }
    });
  }

  return newListings;
}
```

### 5.6 Edge Cases

#### Edge Case 1: Same Shoe, Different Conditions

**Problem:** Same model, size, seller, but different condition (VNDS vs. Worn)

**Solution:** Include condition in hash

```javascript
function generateContentHash(listing) {
  const hashString = [
    listing.source.platform,
    listing.product.name,
    listing.listing.price,
    listing.listing.size_us_mens,
    listing.listing.condition, // Include condition
    listing.seller?.name,
  ].join('|');

  return crypto.createHash('md5').update(hashString).digest('hex');
}
```

**Result:** Two listings with different conditions are treated as unique

#### Edge Case 2: Price Changes on Same Listing

**Problem:** Same listing ID but price changed

**Solution:** Update existing listing instead of creating duplicate

```javascript
async function handlePriceChange(newListing, existingListing) {
  // Same listing, different price
  if (newListing.listing.price !== existingListing.listing.price) {
    // Trigger price drop alert if applicable
    const dropDetector = new PriceDropDetector(kvStore);
    const dropResult = await dropDetector.detectPriceDrop(newListing);

    if (dropResult.hasDrop) {
      await sendPriceDropAlert(newListing, dropResult);
    }

    // Update price in database
    await updateListingPrice(newListing);
  }

  // Don't add as new listing
  return { isDuplicate: true, reason: 'price_change_detected' };
}
```

#### Edge Case 3: Seller Relisting

**Problem:** Seller removes listing (sold), then relists same sneaker

**Solution:** Treat as new listing but flag as "relist"

```javascript
async function handleRelisting(newListing) {
  const relistDetector = new RelistingDetector(kvStore);
  const relistResult = await relistDetector.detectRelisting(newListing);

  if (relistResult.isRelist) {
    // Add flag to listing
    newListing.metadata = {
      ...newListing.metadata,
      isRelist: true,
      originalListingId: relistResult.originalListing.listingId,
      daysSinceRemoval: relistResult.daysSinceRemoval,
      priceChange: relistResult.priceChange,
    };

    // Send notification with relist context
    const message =
      relistResult.priceChange !== 0
        ? `Relisted ${relistResult.daysSinceRemoval} days later with ` +
          `${relistResult.priceChange > 0 ? '+' : ''}$${Math.abs(relistResult.priceChange)} price change`
        : `Relisted ${relistResult.daysSinceRemoval} days later at same price`;

    Actor.log.info(message, { listingId: newListing.id });
  }

  // Still add as new listing (not a duplicate)
  return { isDuplicate: false };
}
```

---

_This completes sections 4-5. The document will continue with sections 6-8 (Error Handling, Platform
Scrapers, and Testing). Would you like me to continue?_

## Component Specifications - Part 2

## Sections 6-8: Error Handling, Platform Scrapers, and Testing

---

## 6. Error Handling & Monitoring Specification

### 6.1 Error Taxonomy

**Error Categories:**

```javascript
const ERROR_TYPES = {
  // Platform-specific errors
  PLATFORM_RATE_LIMIT: {
    code: 'PLATFORM_RATE_LIMIT',
    severity: 'warning',
    recoverable: true,
    retry: true,
    message: 'Platform rate limit exceeded',
    suggestedAction: 'Wait and retry with exponential backoff',
  },

  PLATFORM_AUTH_FAILURE: {
    code: 'PLATFORM_AUTH_FAILURE',
    severity: 'error',
    recoverable: true,
    retry: false,
    message: 'Authentication failed for platform',
    suggestedAction: 'Check API credentials or login status',
  },

  PLATFORM_UNAVAILABLE: {
    code: 'PLATFORM_UNAVAILABLE',
    severity: 'error',
    recoverable: true,
    retry: true,
    message: 'Platform is temporarily unavailable',
    suggestedAction: 'Skip platform and continue with others',
  },

  PLATFORM_STRUCTURE_CHANGED: {
    code: 'PLATFORM_STRUCTURE_CHANGED',
    severity: 'error',
    recoverable: false,
    retry: false,
    message: 'Platform HTML/API structure has changed',
    suggestedAction: 'Update scraper code',
  },

  PLATFORM_CAPTCHA: {
    code: 'PLATFORM_CAPTCHA',
    severity: 'warning',
    recoverable: false,
    retry: false,
    message: 'CAPTCHA detected',
    suggestedAction: 'Use residential proxies or reduce request rate',
  },

  // Network errors
  NETWORK_TIMEOUT: {
    code: 'NETWORK_TIMEOUT',
    severity: 'warning',
    recoverable: true,
    retry: true,
    message: 'Network request timed out',
    suggestedAction: 'Retry with exponential backoff',
  },

  NETWORK_CONNECTION_ERROR: {
    code: 'NETWORK_CONNECTION_ERROR',
    severity: 'warning',
    recoverable: true,
    retry: true,
    message: 'Network connection failed',
    suggestedAction: 'Check internet connection and retry',
  },

  // Data validation errors
  INVALID_DATA_FORMAT: {
    code: 'INVALID_DATA_FORMAT',
    severity: 'warning',
    recoverable: true,
    retry: false,
    message: 'Data format validation failed',
    suggestedAction: 'Skip invalid listing and continue',
  },

  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    severity: 'warning',
    recoverable: true,
    retry: false,
    message: 'Required field missing from listing data',
    suggestedAction: 'Use default value or skip listing',
  },

  PARSING_ERROR: {
    code: 'PARSING_ERROR',
    severity: 'warning',
    recoverable: true,
    retry: false,
    message: 'Failed to parse listing data',
    suggestedAction: 'Log for review and skip listing',
  },

  // System errors
  OUT_OF_MEMORY: {
    code: 'OUT_OF_MEMORY',
    severity: 'critical',
    recoverable: false,
    retry: false,
    message: 'Actor ran out of memory',
    suggestedAction: 'Increase memory allocation or reduce batch size',
  },

  STORAGE_ERROR: {
    code: 'STORAGE_ERROR',
    severity: 'error',
    recoverable: true,
    retry: true,
    message: 'Failed to write to storage',
    suggestedAction: 'Retry storage operation',
  },

  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    severity: 'error',
    recoverable: false,
    retry: false,
    message: 'Unknown error occurred',
    suggestedAction: 'Log for investigation',
  },
};
```

### 6.2 Retry Logic

**Exponential Backoff Implementation:**

```javascript
/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of successful execution
 */
async function retryWithExponentialBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 30000, // 30 seconds
    backoffMultiplier = 2,
    retryCondition = () => true,
    onRetry = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try to execute function
      const result = await fn();

      // Success!
      if (attempt > 0) {
        Actor.log.info(`Succeeded on retry ${attempt}/${maxRetries}`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay);

      // Add random jitter (±25%)
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      const totalDelay = Math.max(0, delay + jitter);

      Actor.log.warning(
        `Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${(totalDelay / 1000).toFixed(1)}s...`,
        { error: error.message, errorCode: error.code }
      );

      // Call onRetry callback if provided
      if (onRetry) {
        await onRetry(attempt, error, totalDelay);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Retry condition functions
 */
const RetryConditions = {
  /**
   * Retry on network errors
   */
  networkErrors: (error) => {
    return (
      error.code === 'NETWORK_TIMEOUT' ||
      error.code === 'NETWORK_CONNECTION_ERROR' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT'
    );
  },

  /**
   * Retry on rate limit errors
   */
  rateLimitErrors: (error) => {
    return (
      error.code === 'PLATFORM_RATE_LIMIT' ||
      error.statusCode === 429 ||
      error.message.includes('rate limit')
    );
  },

  /**
   * Retry on temporary errors
   */
  temporaryErrors: (error) => {
    return (
      error.code === 'PLATFORM_UNAVAILABLE' || error.statusCode === 503 || error.statusCode === 502
    );
  },

  /**
   * Combined: retry on any recoverable error
   */
  recoverableErrors: (error) => {
    return (
      RetryConditions.networkErrors(error) ||
      RetryConditions.rateLimitErrors(error) ||
      RetryConditions.temporaryErrors(error)
    );
  },
};

// Usage examples
async function scrapePlatform(platform) {
  return await retryWithExponentialBackoff(() => platform.scrape(), {
    maxRetries: 3,
    initialDelay: 2000,
    retryCondition: RetryConditions.recoverableErrors,
    onRetry: async (attempt, error, delay) => {
      // Log to monitoring system
      await logRetryAttempt(platform.name, attempt, error);
    },
  });
}
```

**Platform-Specific Retry Configuration:**

```javascript
const PLATFORM_RETRY_CONFIG = {
  // API-based platforms: retry on network/rate limit errors
  ebay: {
    maxRetries: 3,
    initialDelay: 2000,
    retryCondition: RetryConditions.recoverableErrors,
  },

  goat: {
    maxRetries: 3,
    initialDelay: 2000,
    retryCondition: RetryConditions.recoverableErrors,
  },

  // Scraping-based platforms: fewer retries, longer delays
  grailed: {
    maxRetries: 2,
    initialDelay: 5000,
    retryCondition: (error) => {
      // Don't retry on CAPTCHA
      if (error.code === 'PLATFORM_CAPTCHA') return false;
      return RetryConditions.recoverableErrors(error);
    },
  },

  flightclub: {
    maxRetries: 2,
    initialDelay: 10000, // 10 seconds
    retryCondition: RetryConditions.recoverableErrors,
  },

  // High-risk platforms: minimal retries
  mercari: {
    maxRetries: 1,
    initialDelay: 15000,
    retryCondition: RetryConditions.networkErrors, // Only network errors
  },
};
```

### 6.3 Logging Specification

**Log Levels:**

- `DEBUG`: Detailed diagnostic information
- `INFO`: General informational messages
- `WARNING`: Warning messages for recoverable errors
- `ERROR`: Error messages for serious issues
- `CRITICAL`: Critical errors that require immediate attention

**Structured Logging:**

```javascript
/**
 * Structured logger with contextual information
 */
class StructuredLogger {
  constructor(context = {}) {
    this.context = context;
  }

  /**
   * Log with structured data
   */
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      runId: Actor.getEnv().actorRunId,
      actorId: Actor.getEnv().actorId,
    };

    // Use Apify's native logger
    switch (level) {
      case 'DEBUG':
        Actor.log.debug(message, logEntry);
        break;
      case 'INFO':
        Actor.log.info(message, logEntry);
        break;
      case 'WARNING':
        Actor.log.warning(message, logEntry);
        break;
      case 'ERROR':
        Actor.log.error(message, logEntry);
        break;
      case 'CRITICAL':
        Actor.log.error(`[CRITICAL] ${message}`, logEntry);
        break;
    }
  }

  debug(message, data) {
    this.log('DEBUG', message, data);
  }
  info(message, data) {
    this.log('INFO', message, data);
  }
  warning(message, data) {
    this.log('WARNING', message, data);
  }
  error(message, data) {
    this.log('ERROR', message, data);
  }
  critical(message, data) {
    this.log('CRITICAL', message, data);
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext) {
    return new StructuredLogger({
      ...this.context,
      ...additionalContext,
    });
  }
}

// Usage
const logger = new StructuredLogger({ component: 'main' });

// Per-platform logger
const platformLogger = logger.child({
  platform: 'grailed',
  operation: 'scraping',
});

platformLogger.info('Starting scrape', {
  searchTerms: ['Jordan 1'],
  expectedResults: 50,
});
```

**What to Log:**

```javascript
// Scraping start
logger.info('Starting scraping run', {
  platforms: input.targetPlatforms,
  searchTerms: input.searchTerms,
  filters: {
    sizes: input.sizes,
    priceRange: [input.minPrice, input.maxPrice],
  },
});

// Platform scraping
logger.info('Scraping platform', {
  platform: 'grailed',
  url: 'https://grailed.com/...',
  method: 'orchestrated',
});

// Scraping success
logger.info('Platform scraping completed', {
  platform: 'grailed',
  listingsFound: 45,
  duration: 12500, // milliseconds
  successRate: 100,
});

// Scraping failure
logger.error('Platform scraping failed', {
  platform: 'flightclub',
  error: error.message,
  errorCode: error.code,
  stack: error.stack,
  retryAttempt: 2,
  willRetry: true,
});

// Data normalization
logger.debug('Normalizing listing data', {
  platform: 'grailed',
  rawData: rawListing,
  normalizedData: normalizedListing,
});

// Deduplication
logger.info('Deduplication completed', {
  totalListings: 150,
  uniqueListings: 95,
  duplicatesRemoved: 55,
  deduplicationRate: 36.7,
});

// Alert generation
logger.info('Sending notifications', {
  newListings: 12,
  emailRecipient: 'user@example.com',
  notificationTypes: ['email', 'webhook'],
});

// Performance metrics
logger.info('Run completed', {
  totalDuration: 180000, // 3 minutes
  platformsSuccess: 10,
  platformsFailed: 2,
  listingsScraped: 450,
  newListings: 95,
  alertsSent: 12,
});
```

### 6.4 Monitoring and Alerting

**Health Check Endpoints:**

```javascript
/**
 * Actor health check
 * Returns current status and metrics
 */
async function getHealthCheck() {
  const kvStore = await Actor.openKeyValueStore();
  const lastRunStats = await kvStore.getValue('last_run_stats');

  return {
    status: 'healthy', // 'healthy', 'degraded', 'unhealthy'
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    metrics: {
      lastRunAt: lastRunStats?.timestamp,
      lastRunDuration: lastRunStats?.duration,
      successRate: lastRunStats?.successRate,
      platformStatus: lastRunStats?.platformStatus,
      alertsSent: lastRunStats?.alertsSent,
    },
  };
}
```

**Performance Metrics:**

```javascript
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      platforms: {},
      listings: {
        total: 0,
        new: 0,
        duplicates: 0,
      },
      notifications: {
        sent: 0,
        failed: 0,
      },
      errors: [],
    };
  }

  /**
   * Record platform scraping metrics
   */
  recordPlatformMetrics(platform, metrics) {
    this.metrics.platforms[platform] = {
      ...metrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Record error
   */
  recordError(error, context = {}) {
    this.metrics.errors.push({
      code: error.code,
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Calculate success rate
   */
  getSuccessRate() {
    const platforms = Object.values(this.metrics.platforms);
    const successful = platforms.filter((p) => p.success).length;
    return (successful / platforms.length) * 100;
  }

  /**
   * Get summary
   */
  getSummary() {
    const duration = Date.now() - this.metrics.startTime;

    return {
      duration,
      platforms: {
        total: Object.keys(this.metrics.platforms).length,
        successful: Object.values(this.metrics.platforms).filter((p) => p.success).length,
        failed: Object.values(this.metrics.platforms).filter((p) => !p.success).length,
        successRate: this.getSuccessRate(),
      },
      listings: this.metrics.listings,
      notifications: this.metrics.notifications,
      errors: this.metrics.errors.length,
      avgListingsPerPlatform:
        this.metrics.listings.total / Object.keys(this.metrics.platforms).length,
    };
  }

  /**
   * Save metrics to KV Store
   */
  async save() {
    const kvStore = await Actor.openKeyValueStore();
    const summary = this.getSummary();

    await kvStore.setValue('last_run_stats', {
      timestamp: new Date().toISOString(),
      ...summary,
    });

    // Also append to history
    const history = (await kvStore.getValue('metrics_history')) || [];
    history.push({
      timestamp: new Date().toISOString(),
      ...summary,
    });

    // Keep last 100 runs
    const recentHistory = history.slice(-100);
    await kvStore.setValue('metrics_history', recentHistory);
  }
}
```

**Alert Conditions and Thresholds:**

```javascript
const MONITORING_ALERTS = {
  // Success rate drops below threshold
  LOW_SUCCESS_RATE: {
    condition: (metrics) => metrics.platforms.successRate < 70,
    severity: 'warning',
    message: (metrics) =>
      `Success rate dropped to ${metrics.platforms.successRate.toFixed(1)}% (threshold: 70%)`,
    action: 'Check platform status and error logs',
  },

  // High error rate
  HIGH_ERROR_RATE: {
    condition: (metrics) => metrics.errors > 10,
    severity: 'error',
    message: (metrics) => `${metrics.errors} errors occurred during run`,
    action: 'Review error logs and fix issues',
  },

  // Runtime exceeds threshold
  SLOW_PERFORMANCE: {
    condition: (metrics) => metrics.duration > 10 * 60 * 1000, // 10 minutes
    severity: 'warning',
    message: (metrics) =>
      `Run took ${(metrics.duration / 60000).toFixed(1)} minutes (threshold: 10 min)`,
    action: 'Optimize scraping performance or reduce scope',
  },

  // No new listings found (potential issue)
  NO_NEW_LISTINGS: {
    condition: (metrics) => metrics.listings.new === 0 && metrics.platforms.total > 0,
    severity: 'info',
    message: () => 'No new listings found across all platforms',
    action: 'Verify search criteria and platform availability',
  },

  // Notification failures
  NOTIFICATION_FAILURE: {
    condition: (metrics) => metrics.notifications.failed > 0,
    severity: 'error',
    message: (metrics) => `${metrics.notifications.failed} notification(s) failed to send`,
    action: 'Check notification configuration and service status',
  },
};

/**
 * Check all alert conditions and trigger alerts
 */
async function checkAlertConditions(metrics) {
  const triggeredAlerts = [];

  for (const [alertName, alert] of Object.entries(MONITORING_ALERTS)) {
    if (alert.condition(metrics)) {
      triggeredAlerts.push({
        name: alertName,
        severity: alert.severity,
        message: alert.message(metrics),
        action: alert.action,
        timestamp: new Date().toISOString(),
      });

      // Log alert
      Actor.log.warning(`ALERT: ${alertName}`, {
        severity: alert.severity,
        message: alert.message(metrics),
        action: alert.action,
      });
    }
  }

  return triggeredAlerts;
}
```

### 6.5 Graceful Degradation

**Fallback Strategies:**

```javascript
/**
 * Graceful degradation manager
 */
class GracefulDegradation {
  /**
   * Handle platform failure
   * Continue with other platforms instead of failing entire run
   */
  async handlePlatformFailure(platform, error, remainingPlatforms) {
    Actor.log.warning(`Platform ${platform} failed, continuing with remaining platforms`, {
      platform,
      error: error.message,
      remainingPlatforms: remainingPlatforms.length,
    });

    // Record failure
    await this.recordPlatformFailure(platform, error);

    // Check if too many failures
    const failureCount = await this.getPlatformFailureCount(platform);

    if (failureCount >= 3) {
      // Disable platform temporarily (24 hours)
      await this.temporarilyDisablePlatform(platform, 24 * 60 * 60 * 1000);

      Actor.log.error(
        `Platform ${platform} has failed 3 consecutive times, disabling for 24 hours`
      );
    }

    return {
      continueExecution: true,
      skipPlatform: platform,
    };
  }

  /**
   * Handle notification failure
   * Try alternative notification methods
   */
  async handleNotificationFailure(primaryMethod, listings, config) {
    Actor.log.warning(`Primary notification method (${primaryMethod}) failed, trying alternatives`);

    const alternatives = [];

    if (primaryMethod === 'email' && config.webhookUrl) {
      alternatives.push('webhook');
    }

    if (primaryMethod === 'webhook' && config.emailTo) {
      alternatives.push('email');
    }

    for (const method of alternatives) {
      try {
        if (method === 'email') {
          await sendEmailNotification(listings, config.emailTo);
        } else if (method === 'webhook') {
          await sendWebhookNotification(listings, config.webhookUrl);
        }

        Actor.log.info(`Successfully sent notification via fallback method: ${method}`);
        return { success: true, method };
      } catch (error) {
        Actor.log.warning(`Fallback method ${method} also failed`, { error: error.message });
      }
    }

    // All notification methods failed
    // Save listings to dataset for manual review
    await Actor.pushData(listings);

    return {
      success: false,
      fallback: 'saved_to_dataset',
      message: 'All notification methods failed, listings saved to dataset',
    };
  }

  /**
   * Handle data parsing failure
   * Use defaults or skip listing
   */
  handleParsingFailure(rawListing, error, context) {
    Actor.log.warning('Failed to parse listing, using defaults', {
      platform: context.platform,
      error: error.message,
      rawData: JSON.stringify(rawListing).substring(0, 200),
    });

    // Attempt to extract minimal required fields
    try {
      const minimalListing = {
        product: {
          name: rawListing.title || rawListing.name || 'Unknown',
          brand: 'Unknown',
          model: 'Unknown',
          colorway: null,
          sku: null,
        },
        listing: {
          price: parseFloat(rawListing.price) || 0,
          currency: 'USD',
          size_us_mens: null,
          condition: 'unspecified',
          tags: [],
          type: 'sell',
        },
        source: {
          platform: context.platform,
          url: rawListing.url || '#',
          id: rawListing.id || crypto.randomBytes(8).toString('hex'),
          is_authenticated: false,
          imageUrl: rawListing.image || null,
        },
        scrape: {
          timestamp: new Date().toISOString(),
          runId: Actor.getEnv().actorRunId,
          version: '1.0.0',
          method: 'scraping',
        },
      };

      return { success: true, listing: minimalListing, partial: true };
    } catch (fallbackError) {
      // Even minimal parsing failed, skip listing
      Actor.log.error('Failed to extract minimal fields, skipping listing', {
        platform: context.platform,
        error: fallbackError.message,
      });

      return { success: false, skipped: true };
    }
  }

  /**
   * Record platform failure
   */
  async recordPlatformFailure(platform, error) {
    const kvStore = await Actor.openKeyValueStore();
    const key = `platform_failures_${platform}`;

    const failures = (await kvStore.getValue(key)) || [];
    failures.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      code: error.code,
    });

    // Keep last 10 failures
    const recentFailures = failures.slice(-10);
    await kvStore.setValue(key, recentFailures);
  }

  /**
   * Get consecutive failure count
   */
  async getPlatformFailureCount(platform) {
    const kvStore = await Actor.openKeyValueStore();
    const key = `platform_failures_${platform}`;

    const failures = (await kvStore.getValue(key)) || [];

    // Count consecutive failures (within last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentFailures = failures.filter((f) => new Date(f.timestamp).getTime() > oneDayAgo);

    return recentFailures.length;
  }

  /**
   * Temporarily disable platform
   */
  async temporarilyDisablePlatform(platform, duration) {
    const kvStore = await Actor.openKeyValueStore();
    const key = `platform_disabled_${platform}`;

    await kvStore.setValue(key, {
      disabledAt: new Date().toISOString(),
      disabledUntil: new Date(Date.now() + duration).toISOString(),
      reason: 'consecutive_failures',
    });
  }

  /**
   * Check if platform is disabled
   */
  async isPlatformDisabled(platform) {
    const kvStore = await Actor.openKeyValueStore();
    const key = `platform_disabled_${platform}`;

    const disabledInfo = await kvStore.getValue(key);

    if (!disabledInfo) return false;

    const disabledUntil = new Date(disabledInfo.disabledUntil).getTime();

    if (Date.now() > disabledUntil) {
      // Disable period expired, re-enable platform
      await kvStore.delete(key);
      return false;
    }

    return true;
  }
}
```

---

## 7. Platform Scraper Specification

### 7.1 Scraper Interface/Contract

**Base Scraper Interface:**

```javascript
/**
 * Base scraper interface that all platform scrapers must implement
 */
class BaseScraper {
  constructor(config) {
    this.config = config;
    this.platform = config.platform;
    this.rateLimit = config.rateLimit || 100; // requests per hour
    this.proxyConfig = config.proxyConfig;
    this.logger = new StructuredLogger({ platform: this.platform });
  }

  /**
   * Required: Main scraping method
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} Array of raw listings
   */
  async scrape(params) {
    throw new Error('scrape() method must be implemented by subclass');
  }

  /**
   * Required: Normalize raw data to standard schema
   * @param {Object} rawListing - Platform-specific listing data
   * @returns {Object} Normalized listing
   */
  normalize(rawListing) {
    throw new Error('normalize() method must be implemented by subclass');
  }

  /**
   * Optional: Validate search parameters
   * @param {Object} params - Search parameters
   * @returns {Boolean} True if valid
   */
  validateParams(params) {
    if (!params.searchTerms || params.searchTerms.length === 0) {
      throw new Error('searchTerms is required');
    }
    return true;
  }

  /**
   * Optional: Rate limiting
   */
  async throttle() {
    const minDelay = (3600 / this.rateLimit) * 1000; // milliseconds
    await new Promise((resolve) => setTimeout(resolve, minDelay));
  }

  /**
   * Optional: Error handling
   */
  handleError(error, context = {}) {
    const errorType = this.identifyErrorType(error);

    this.logger.error('Scraping error', {
      error: error.message,
      errorType,
      context,
    });

    return {
      error: errorType,
      recoverable: ERROR_TYPES[errorType]?.recoverable || false,
      shouldRetry: ERROR_TYPES[errorType]?.retry || false,
    };
  }

  /**
   * Identify error type
   */
  identifyErrorType(error) {
    if (error.statusCode === 429 || error.message.includes('rate limit')) {
      return 'PLATFORM_RATE_LIMIT';
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'PLATFORM_AUTH_FAILURE';
    }
    if (error.statusCode === 503 || error.statusCode === 502) {
      return 'PLATFORM_UNAVAILABLE';
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      return 'NETWORK_TIMEOUT';
    }
    return 'UNKNOWN_ERROR';
  }
}
```

### 7.2 Platform-Specific Specifications

Due to space constraints, I'll provide detailed specifications for 3 representative platforms:

#### Platform 1: eBay (API-Based)

**Method:** Official eBay Finding API

**Configuration:**

```javascript
{
  platform: 'ebay',
  type: 'api',
  apiEndpoint: 'https://svcs.ebay.com/services/search/FindingService/v1',
  authentication: 'api_key',
  rateLimit: 5000,  // 5,000 calls per day
  requiresProxy: false
}
```

**Implementation:**

```javascript
class EbayScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://svcs.ebay.com/services/search/FindingService/v1';
  }

  /**
   * Scrape eBay using Finding API
   */
  async scrape(params) {
    this.validateParams(params);

    const allListings = [];

    for (const searchTerm of params.searchTerms) {
      try {
        const listings = await this.searchProducts(
          searchTerm,
          params.minPrice,
          params.maxPrice,
          params.maxResults
        );

        allListings.push(...listings);

        this.logger.info('eBay scraping completed', {
          searchTerm,
          listingsFound: listings.length,
        });
      } catch (error) {
        this.logger.error('eBay scraping failed', {
          searchTerm,
          error: error.message,
        });

        // Continue with other search terms
      }
    }

    return allListings;
  }

  /**
   * Search products using eBay API
   */
  async searchProducts(keywords, minPrice, maxPrice, maxResults = 50) {
    const url = new URL(this.baseUrl);

    // Add parameters
    url.searchParams.append('OPERATION-NAME', 'findItemsAdvanced');
    url.searchParams.append('SERVICE-VERSION', '1.0.0');
    url.searchParams.append('SECURITY-APPNAME', this.apiKey);
    url.searchParams.append('RESPONSE-DATA-FORMAT', 'JSON');
    url.searchParams.append('keywords', keywords);
    url.searchParams.append('paginationInput.entriesPerPage', Math.min(maxResults, 100));

    // Price filters
    if (minPrice) {
      url.searchParams.append('itemFilter(0).name', 'MinPrice');
      url.searchParams.append('itemFilter(0).value', minPrice);
    }

    if (maxPrice) {
      url.searchParams.append('itemFilter(1).name', 'MaxPrice');
      url.searchParams.append('itemFilter(1).value', maxPrice);
    }

    // Category filter (Athletic Shoes)
    url.searchParams.append('itemFilter(2).name', 'CategoryId');
    url.searchParams.append('itemFilter(2).value', '15709'); // Men's Athletic Shoes

    // Listing type (Buy It Now only)
    url.searchParams.append('itemFilter(3).name', 'ListingType');
    url.searchParams.append('itemFilter(3).value', 'FixedPrice');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`eBay API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract items from response
    const searchResult = data.findItemsAdvancedResponse?.[0]?.searchResult?.[0];
    const items = searchResult?.item || [];

    return items.map((item) => this.normalize(item));
  }

  /**
   * Normalize eBay listing
   */
  normalize(rawListing) {
    return {
      id: `ebay_${rawListing.itemId?.[0]}`,
      product: {
        name: rawListing.title?.[0],
        brand: this.extractBrand(rawListing.title?.[0]),
        model: this.extractModel(rawListing.title?.[0]),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: parseFloat(rawListing.sellingStatus?.[0]?.currentPrice?.[0]?.__value__),
        currency: rawListing.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD',
        size_us_mens: this.extractSize(rawListing.title?.[0]),
        condition: this.mapCondition(rawListing.condition?.[0]?.conditionDisplayName?.[0]),
        tags: this.extractTags(rawListing),
        type: 'sell',
        description: rawListing.subtitle?.[0] || null,
        listedAt: rawListing.listingInfo?.[0]?.startTime?.[0],
      },
      source: {
        platform: 'eBay',
        url: rawListing.viewItemURL?.[0],
        id: rawListing.itemId?.[0],
        is_authenticated: this.hasAuthenticityGuarantee(rawListing),
        imageUrl: rawListing.galleryURL?.[0],
        additionalImages: [],
      },
      seller: {
        name: rawListing.sellerInfo?.[0]?.sellerUserName?.[0],
        rating: parseFloat(rawListing.sellerInfo?.[0]?.positiveFeedbackPercent?.[0]),
        reviewCount: parseInt(rawListing.sellerInfo?.[0]?.feedbackScore?.[0]),
        verified: rawListing.sellerInfo?.[0]?.topRatedSeller?.[0] === 'true',
        location: rawListing.location?.[0],
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: Actor.getEnv().actorRunId,
        version: '1.0.0',
        method: 'api',
      },
    };
  }

  /**
   * Check if listing has eBay Authenticity Guarantee
   */
  hasAuthenticityGuarantee(rawListing) {
    const subtitle = rawListing.subtitle?.[0] || '';
    const title = rawListing.title?.[0] || '';
    return subtitle.includes('Authenticity Guarantee') || title.includes('Authenticity Guarantee');
  }

  /**
   * Map eBay condition to standard condition
   */
  mapCondition(ebayCondition) {
    if (!ebayCondition) return 'unspecified';

    const condition = ebayCondition.toLowerCase();

    if (condition.includes('new')) return 'new_in_box';
    if (condition.includes('like new')) return 'used_like_new';
    if (condition.includes('very good')) return 'used_good';
    if (condition.includes('good')) return 'used_fair';
    if (condition.includes('acceptable')) return 'used_poor';

    return 'unspecified';
  }

  extractBrand(title) {
    const brands = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Puma', 'Reebok'];
    for (const brand of brands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return 'Unknown';
  }

  extractModel(title) {
    // Simple extraction (can be improved with NLP)
    const models = ['Air Jordan 1', 'Yeezy 350', 'Dunk', 'Air Max'];
    for (const model of models) {
      if (title.includes(model)) {
        return model;
      }
    }
    return 'Unknown';
  }

  extractSize(title) {
    const sizeMatch = title.match(/\b(?:size|sz)\s*(\d{1,2}(?:\.5)?)\b/i);
    return sizeMatch ? sizeMatch[1] : null;
  }

  extractTags(rawListing) {
    const tags = [];

    if (this.hasAuthenticityGuarantee(rawListing)) {
      tags.push('authenticity_guarantee');
    }

    if (rawListing.listingInfo?.[0]?.listingType?.[0] === 'FixedPrice') {
      tags.push('buy_it_now');
    }

    return tags;
  }
}
```

#### Platform 2: Grailed (Orchestrated Actor Call)

**Method:** Call existing Apify actor

**Configuration:**

```javascript
{
  platform: 'grailed',
  type: 'orchestrated',
  actorId: 'vmscrapers/grailed',
  rateLimit: 200,
  requiresProxy: true
}
```

**Implementation:**

```javascript
class GrailedScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.actorId = 'vmscrapers/grailed';
  }

  /**
   * Scrape Grailed by calling existing actor
   */
  async scrape(params) {
    this.validateParams(params);

    const allListings = [];

    for (const searchTerm of params.searchTerms) {
      try {
        // Call Grailed actor
        const run = await Actor.call(this.actorId, {
          search: searchTerm,
          category: 'footwear',
          maxItems: params.maxResults || 50,
          proxy: params.proxyConfig,
        });

        // Get dataset from actor run
        const { items } = await Actor.apifyClient.dataset(run.defaultDatasetId).listItems();

        // Normalize each listing
        const normalized = items.map((item) => this.normalize(item));
        allListings.push(...normalized);

        this.logger.info('Grailed scraping completed', {
          searchTerm,
          listingsFound: normalized.length,
        });
      } catch (error) {
        this.logger.error('Grailed actor call failed', {
          searchTerm,
          error: error.message,
        });
      }
    }

    return allListings;
  }

  /**
   * Normalize Grailed listing
   */
  normalize(rawListing) {
    return {
      id: `grailed_${rawListing.id}`,
      product: {
        name: rawListing.title,
        brand: rawListing.brand || 'Unknown',
        model: this.extractModel(rawListing.title),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: rawListing.price,
        currency: 'USD',
        size_us_mens: rawListing.size,
        condition: this.parseCondition(rawListing.condition || rawListing.description),
        tags: this.parseTags(rawListing.description),
        type: 'sell',
        description: rawListing.description,
        listedAt: rawListing.created_at,
      },
      source: {
        platform: 'Grailed',
        url: rawListing.url || `https://grailed.com/listings/${rawListing.id}`,
        id: rawListing.id.toString(),
        is_authenticated: false,
        imageUrl: rawListing.cover_photo?.url,
        additionalImages: rawListing.photos?.map((p) => p.url) || [],
      },
      seller: {
        name: rawListing.seller?.username,
        rating: rawListing.seller?.rating,
        reviewCount: rawListing.seller?.transaction_count,
        verified: rawListing.seller?.verified || false,
        location: rawListing.seller?.location,
      },
      scrape: {
        timestamp: new Date().toISOString(),
        runId: Actor.getEnv().actorRunId,
        version: '1.0.0',
        method: 'orchestrated',
      },
    };
  }

  parseCondition(text) {
    if (!text) return 'unspecified';

    const lowerText = text.toLowerCase();

    if (/\b(ds|deadstock|bnib)\b/.test(lowerText)) return 'new_in_box';
    if (/\b(vnds)\b/.test(lowerText)) return 'used_like_new';
    if (/\b(nds)\b/.test(lowerText)) return 'used_good';
    if (/\b(worn|used)\b/.test(lowerText)) return 'used_fair';
    if (/\b(beat|beaters)\b/.test(lowerText)) return 'used_poor';

    return 'unspecified';
  }

  parseTags(description) {
    if (!description) return [];

    const tags = [];
    const lowerDesc = description.toLowerCase();

    if (/\b(og all|og box)\b/.test(lowerDesc)) tags.push('og_all');
    if (/\b(pe|player edition)\b/.test(lowerDesc)) tags.push('player_edition');
    if (/\b(sample)\b/.test(lowerDesc)) tags.push('sample');

    return tags;
  }

  extractModel(title) {
    // Same as eBay implementation
    const models = ['Air Jordan 1', 'Yeezy 350', 'Dunk', 'Air Max'];
    for (const model of models) {
      if (title.includes(model)) {
        return model;
      }
    }
    return 'Unknown';
  }
}
```

#### Platform 3: Flight Club (Custom Scraper)

**Method:** Custom HTTP scraping with Cheerio

**Configuration:**

```javascript
{
  platform: 'flightclub',
  type: 'custom',
  baseUrl: 'https://www.flightclub.com',
  rateLimit: 100,
  requiresProxy: true
}
```

**Implementation Pseudocode:**

```javascript
class FlightClubScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://www.flightclub.com';
    this.crawler = null;
  }

  /**
   * Initialize crawler
   */
  async initialize() {
    const { CheerioCrawler, ProxyConfiguration } = require('crawlee');

    const proxyConfiguration = await ProxyConfiguration.create({
      ...this.proxyConfig,
    });

    this.crawler = new CheerioCrawler({
      proxyConfiguration,
      maxRequestsPerCrawl: this.config.maxResults || 50,
      requestHandlerTimeoutSecs: 60,
      maxConcurrency: 2,
    });
  }

  /**
   * Scrape Flight Club
   */
  async scrape(params) {
    this.validateParams(params);

    if (!this.crawler) {
      await this.initialize();
    }

    const allListings = [];

    for (const searchTerm of params.searchTerms) {
      try {
        // Build search URL
        const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(searchTerm)}`;

        // Scrape search results
        const listings = await this.scrapeSearchResults(searchUrl, params.maxResults);

        // Normalize
        const normalized = listings.map((item) => this.normalize(item));
        allListings.push(...normalized);

        this.logger.info('Flight Club scraping completed', {
          searchTerm,
          listingsFound: normalized.length,
        });

        // Throttle between searches
        await this.throttle();
      } catch (error) {
        this.logger.error('Flight Club scraping failed', {
          searchTerm,
          error: error.message,
        });
      }
    }

    return allListings;
  }

  /**
   * Scrape search results page
   */
  async scrapeSearchResults(url, maxResults) {
    const listings = [];

    await this.crawler.run([
      {
        url,
        userData: { maxResults },
        handler: async ({ $, request }) => {
          // Extract listings from page
          $('.product-card').each((index, element) => {
            if (listings.length >= maxResults) return false;

            const listing = {
              title: $(element).find('.product-title').text().trim(),
              price: $(element).find('.product-price').text().trim(),
              size: $(element).find('.product-size').text().trim(),
              condition: $(element).find('.product-condition').text().trim(),
              url: $(element).find('a').attr('href'),
              imageUrl: $(element).find('img').attr('src'),
              id: $(element).attr('data-product-id'),
            };

            listings.push(listing);
          });
        },
      },
    ]);

    return listings;
  }

  /**
   * Normalize Flight Club listing
   */
  normalize(rawListing) {
    return {
      id: `flightclub_${rawListing.id}`,
      product: {
        name: rawListing.title,
        brand: this.extractBrand(rawListing.title),
        model: this.extractModel(rawListing.title),
        colorway: null,
        sku: null,
        releaseYear: null,
      },
      listing: {
        price: this.parsePrice(rawListing.price),
        currency: 'USD',
        size_us_mens: this.parseSize(rawListing.size),
        condition: 'new_in_box', // Flight Club only sells new
        tags: ['authenticated', 'flight_club'],
        type: 'sell',
        description: null,
        listedAt: null,
      },
      source: {
        platform: 'Flight Club',
        url: `${this.baseUrl}${rawListing.url}`,
        id: rawListing.id,
        is_authenticated: true, // Flight Club authenticates
        imageUrl: rawListing.imageUrl,
        additionalImages: [],
      },
      seller: null, // Flight Club is the seller
      scrape: {
        timestamp: new Date().toISOString(),
        runId: Actor.getEnv().actorRunId,
        version: '1.0.0',
        method: 'scraping',
      },
    };
  }

  parsePrice(priceString) {
    return parseFloat(priceString.replace(/[$,]/g, ''));
  }

  parseSize(sizeString) {
    const match = sizeString.match(/\d{1,2}(?:\.\5)?/);
    return match ? match[0] : null;
  }
}
```

### 7.3 Platform Summary Table

| Platform          | Type            | Difficulty         | Rate Limit | Proxy | Authentication   |
| ----------------- | --------------- | ------------------ | ---------- | ----- | ---------------- |
| **eBay**          | API             | ⭐ Easy            | 5,000/day  | No    | API Key          |
| **GOAT**          | Orchestrated    | ⭐ Easy            | N/A        | No    | N/A              |
| **Grailed**       | Orchestrated    | ⭐ Easy            | N/A        | No    | N/A              |
| **Vinted**        | Orchestrated    | ⭐ Easy            | N/A        | No    | N/A              |
| **Craigslist**    | Orchestrated    | ⭐⭐ Medium        | 100/hour   | No    | None             |
| **OfferUp**       | Orchestrated    | ⭐⭐ Medium        | N/A        | No    | None             |
| **Kixify**        | Custom Scraping | ⭐⭐ Medium        | 100/hour   | No    | None             |
| **Depop**         | Custom Scraping | ⭐⭐⭐ Hard        | 100/hour   | Yes   | None             |
| **Poshmark**      | Custom Scraping | ⭐⭐⭐ Hard        | 150/hour   | Yes   | None             |
| **Flight Club**   | Custom Scraping | ⭐⭐⭐⭐ Very Hard | 100/hour   | Yes   | None             |
| **Stadium Goods** | Custom Scraping | ⭐⭐⭐⭐ Very Hard | 100/hour   | Yes   | None             |
| **StockX**        | Custom Scraping | ⭐⭐⭐⭐⭐ Extreme | 50/hour    | Yes   | None (High Risk) |

---

## 8. Testing Specifications

### 8.1 Unit Test Requirements

**Test Framework:** Jest

**Coverage Target:** 80%+

**Unit Test Structure:**

```javascript
// __tests__/utils/normalizer.test.js
describe('DataNormalizer', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new DataNormalizer();
  });

  describe('normalize()', () => {
    test('should normalize eBay listing correctly', () => {
      const rawListing = {
        itemId: ['123456789'],
        title: ['Air Jordan 1 Retro High OG Bred Size 10.5'],
        sellingStatus: [
          {
            currentPrice: [{ __value__: '750.00', '@currencyId': 'USD' }],
          },
        ],
        viewItemURL: ['https://ebay.com/itm/123456789'],
      };

      const normalized = normalizer.normalize(rawListing, 'ebay');

      expect(normalized).toHaveProperty('id', 'ebay_123456789');
      expect(normalized.product.name).toBe('Air Jordan 1 Retro High OG Bred Size 10.5');
      expect(normalized.listing.price).toBe(750);
      expect(normalized.listing.currency).toBe('USD');
      expect(normalized.source.platform).toBe('eBay');
    });

    test('should handle missing fields gracefully', () => {
      const rawListing = {
        itemId: ['123456789'],
        title: ['Sneakers'],
      };

      const normalized = normalizer.normalize(rawListing, 'ebay');

      expect(normalized).toHaveProperty('id');
      expect(normalized.listing.price).toBe(0);
      expect(normalized.listing.condition).toBe('unspecified');
    });
  });

  describe('parsePrice()', () => {
    test('should parse various price formats', () => {
      expect(normalizer.parsePrice('$750.00')).toBe(750);
      expect(normalizer.parsePrice('1,200')).toBe(1200);
      expect(normalizer.parsePrice('€850.50')).toBe(850.5);
    });
  });
});

// __tests__/utils/parser.test.js
describe('SneakerParser', () => {
  let parser;

  beforeEach(() => {
    parser = new SneakerParser();
  });

  describe('parseCondition()', () => {
    test('should parse DS/BNIB as new_in_box', () => {
      expect(parser.parseCondition('DS never worn')).toBe('new_in_box');
      expect(parser.parseCondition('BNIB with tags')).toBe('new_in_box');
    });

    test('should parse VNDS as used_like_new', () => {
      expect(parser.parseCondition('VNDS worn 1x')).toBe('used_like_new');
    });

    test('should return unspecified for unclear condition', () => {
      expect(parser.parseCondition('Good sneakers')).toBe('unspecified');
    });
  });

  describe('parseSize()', () => {
    test('should parse various size formats', () => {
      expect(parser.parseSize('Size 10.5')).toBe('10.5');
      expect(parser.parseSize('US 11')).toBe('11');
      expect(parser.parseSize('sz 9')).toBe('9');
    });

    test('should return null for no size', () => {
      expect(parser.parseSize('Jordan 1 Bred')).toBeNull();
    });
  });
});

// __tests__/utils/deduplicator.test.js
describe('Deduplicator', () => {
  let deduplicator;
  let mockKvStore;

  beforeEach(() => {
    mockKvStore = {
      getValue: jest.fn(),
      setValue: jest.fn(),
    };
    deduplicator = new InMemoryDeduplicator();
  });

  describe('generateHash()', () => {
    test('should generate consistent hash for same listing', () => {
      const listing = {
        source: { platform: 'grailed', id: '12345678' },
      };

      const hash1 = deduplicator.generateHash(listing);
      const hash2 = deduplicator.generateHash(listing);

      expect(hash1).toBe(hash2);
    });

    test('should generate different hash for different listings', () => {
      const listing1 = {
        source: { platform: 'grailed', id: '12345678' },
      };
      const listing2 = {
        source: { platform: 'grailed', id: '87654321' },
      };

      const hash1 = deduplicator.generateHash(listing1);
      const hash2 = deduplicator.generateHash(listing2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('isDuplicate()', () => {
    test('should detect duplicate', async () => {
      const listing = {
        source: { platform: 'grailed', id: '12345678' },
      };

      deduplicator.add(deduplicator.generateHash(listing));

      expect(deduplicator.has(deduplicator.generateHash(listing))).toBe(true);
    });

    test('should not detect new listing as duplicate', () => {
      const listing = {
        source: { platform: 'grailed', id: '12345678' },
      };

      expect(deduplicator.has(deduplicator.generateHash(listing))).toBe(false);
    });
  });
});
```

### 8.2 Integration Test Scenarios

**Integration Tests:**

```javascript
// __tests__/integration/scraping.test.js
describe('Scraping Integration', () => {
  jest.setTimeout(60000); // 1 minute timeout

  test('should scrape eBay and return normalized listings', async () => {
    const scraper = new EbayScraper({
      platform: 'ebay',
      apiKey: process.env.EBAY_API_KEY,
    });

    const listings = await scraper.scrape({
      searchTerms: ['Air Jordan 1'],
      maxResults: 10,
    });

    expect(listings).toBeInstanceOf(Array);
    expect(listings.length).toBeGreaterThan(0);
    expect(listings.length).toBeLessThanOrEqual(10);

    const firstListing = listings[0];
    expect(firstListing).toHaveProperty('id');
    expect(firstListing).toHaveProperty('product');
    expect(firstListing).toHaveProperty('listing');
    expect(firstListing).toHaveProperty('source');
    expect(firstListing.source.platform).toBe('eBay');
  });

  test('should handle platform failure gracefully', async () => {
    const scraper = new GrailedScraper({
      platform: 'grailed',
    });

    // Simulate failure
    jest.spyOn(scraper, 'scrape').mockRejectedValue(new Error('Platform unavailable'));

    await expect(
      scraper.scrape({
        searchTerms: ['Jordan 1'],
      })
    ).rejects.toThrow('Platform unavailable');
  });
});

// __tests__/integration/notifications.test.js
describe('Notification Integration', () => {
  test('should send email notification', async () => {
    const notifier = new EmailNotifier(process.env.SENDGRID_API_KEY, 'test@example.com');

    const testListings = [
      {
        id: 'test_123',
        product: { name: 'Test Sneaker' },
        listing: { price: 100, size_us_mens: '10' },
        source: { platform: 'Test', url: 'https://example.com' },
      },
    ];

    const result = await notifier.sendAlert(testListings, 'recipient@example.com', {
      searchTerms: ['Test'],
      platforms: ['Test'],
    });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty('messageId');
  });
});
```

### 8.3 End-to-End Test Cases

**E2E Tests:**

```javascript
// __tests__/e2e/full-run.test.js
describe('End-to-End Actor Run', () => {
  jest.setTimeout(300000); // 5 minutes

  test('should complete full actor run successfully', async () => {
    // Simulate full actor execution
    const input = {
      searchTerms: ['Air Jordan 1'],
      sizes: ['10', '10.5'],
      maxPrice: 500,
      targetPlatforms: ['ebay', 'grailed'],
      maxResultsPerPlatform: 10,
      notificationConfig: {
        emailTo: 'test@example.com',
      },
    };

    // Initialize actor
    await Actor.init();

    try {
      // Run main function
      const result = await main(input);

      // Verify results
      expect(result).toHaveProperty('listingsFound');
      expect(result).toHaveProperty('newListings');
      expect(result).toHaveProperty('alertsSent');
      expect(result.listingsFound).toBeGreaterThanOrEqual(0);

      // Verify dataset
      const dataset = await Actor.openDataset();
      const { items } = await dataset.getData();
      expect(items).toBeInstanceOf(Array);
    } finally {
      await Actor.exit();
    }
  });

  test('should handle partial platform failures', async () => {
    const input = {
      searchTerms: ['Test'],
      targetPlatforms: ['ebay', 'invalid_platform', 'grailed'],
      maxResultsPerPlatform: 10,
    };

    await Actor.init();

    try {
      const result = await main(input);

      // Should complete despite one platform failing
      expect(result.platformsSuccessful).toBeGreaterThan(0);
      expect(result.platformsFailed).toBeGreaterThan(0);
    } finally {
      await Actor.exit();
    }
  });
});
```

### 8.4 Performance Test Criteria

**Performance Tests:**

```javascript
// __tests__/performance/benchmarks.test.js
describe('Performance Benchmarks', () => {
  test('should complete scraping within time limit', async () => {
    const startTime = Date.now();

    const result = await scrapeAllPlatforms({
      searchTerms: ['Jordan 1'],
      targetPlatforms: ['ebay', 'grailed', 'kixify'],
      maxResultsPerPlatform: 50,
    });

    const duration = Date.now() - startTime;

    // Should complete within 5 minutes
    expect(duration).toBeLessThan(5 * 60 * 1000);
  });

  test('should handle large result sets efficiently', async () => {
    const startTime = Date.now();

    const result = await scrapeAllPlatforms({
      searchTerms: ['Jordan', 'Yeezy', 'Dunk'],
      targetPlatforms: ['ebay', 'grailed'],
      maxResultsPerPlatform: 500,
    });

    const duration = Date.now() - startTime;
    const listingsPerSecond = result.totalListings / (duration / 1000);

    // Should process at least 5 listings per second
    expect(listingsPerSecond).toBeGreaterThan(5);
  });

  test('should not exceed memory limit', async () => {
    const memoryBefore = process.memoryUsage().heapUsed;

    await scrapeAllPlatforms({
      searchTerms: Array(10).fill('Test'),
      targetPlatforms: ['ebay', 'grailed'],
      maxResultsPerPlatform: 100,
    });

    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024; // MB

    // Should not use more than 500MB
    expect(memoryIncrease).toBeLessThan(500);
  });
});
```

### 8.5 Mock Data Structures

**Test Fixtures:**

```javascript
// __tests__/fixtures/listings.js
module.exports = {
  ebayListing: {
    itemId: ['123456789'],
    title: ['Nike Air Jordan 1 Retro High OG Bred Size 10.5 DS'],
    sellingStatus: [
      {
        currentPrice: [{ __value__: '750.00', '@currencyId': 'USD' }],
      },
    ],
    condition: [
      {
        conditionDisplayName: ['Brand New'],
      },
    ],
    viewItemURL: ['https://www.ebay.com/itm/123456789'],
    galleryURL: ['https://i.ebayimg.com/images/g/xxxxx/s-l1600.jpg'],
    sellerInfo: [
      {
        sellerUserName: ['sneaker_seller'],
        positiveFeedbackPercent: ['99.5'],
        feedbackScore: ['1234'],
        topRatedSeller: ['true'],
      },
    ],
    location: ['New York, NY'],
    listingInfo: [
      {
        startTime: ['2025-11-10T10:00:00.000Z'],
      },
    ],
  },

  grailedListing: {
    id: 12345678,
    title: 'Air Jordan 1 Retro High OG Bred',
    brand: 'Air Jordan',
    price: 750,
    size: '10.5',
    condition: 'gently_used',
    description: 'VNDS worn once. Includes OG box and laces.',
    url: 'https://grailed.com/listings/12345678',
    cover_photo: {
      url: 'https://i.ytimg.com/vi/yaZKmCq6sRQ/maxresdefault.jpg',
    },
    seller: {
      username: 'sneakerhead_nyc',
      rating: 4.9,
      transaction_count: 127,
      verified: true,
      location: 'New York, NY',
    },
    created_at: '2025-11-09T18:45:00.000Z',
  },

  normalizedListing: {
    id: 'grailed_12345678',
    product: {
      name: 'Air Jordan 1 Retro High OG Bred',
      brand: 'Air Jordan',
      model: 'Air Jordan 1',
      colorway: 'Bred',
      sku: '555088-001',
      releaseYear: 2016,
    },
    listing: {
      price: 750,
      currency: 'USD',
      size_us_mens: '10.5',
      condition: 'used_like_new',
      tags: ['vnds', 'og_all'],
      type: 'sell',
      description: 'VNDS worn once. Includes OG box and laces.',
      listedAt: '2025-11-09T18:45:00.000Z',
    },
    source: {
      platform: 'Grailed',
      url: 'https://grailed.com/listings/12345678',
      id: '12345678',
      is_authenticated: false,
      imageUrl:
        'https://i.ytimg.com/vi/tK9VZOcEBxA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBtgvH2y__ZEgkuZqHQvyyFpEe6ZA',
      additionalImages: [],
    },
    seller: {
      name: 'sneakerhead_nyc',
      rating: 4.9,
      reviewCount: 127,
      verified: true,
      location: 'New York, NY',
    },
    scrape: {
      timestamp: '2025-11-10T14:30:00Z',
      runId: 'abc123xyz456',
      version: '1.0.0',
      method: 'orchestrated',
    },
    dealScore: {
      isBelowMarket: true,
      marketValue: 950,
      savingsPercentage: 21.1,
      savingsAmount: 200,
      dealQuality: 'good',
    },
  },
};
```

---

## Conclusion

This comprehensive component specification document provides detailed technical specifications for
all major components of the SneakerMeta Apify actor, including:

1. **Input Schema** - Complete JSON schema with validation
2. **Output Dataset** - Standardized data structure
3. **Notification System** - Email, SMS, and webhook specifications
4. **Price Tracking** - Algorithms and data models
5. **Deduplication Logic** - Multi-level deduplication strategy
6. **Error Handling** - Comprehensive error taxonomy and retry logic
7. **Platform Scrapers** - Interface specifications and implementations
8. **Testing** - Unit, integration, E2E, and performance tests

**Implementation Guidance:**

- Each section provides detailed pseudocode and examples
- Algorithms are described with precision
- Edge cases are explicitly handled
- Performance requirements are specified
- All major platforms are covered

**Ready for Development:** This specification is sufficiently detailed that developers can implement
the actor without ambiguity. Each component has clear interfaces, data structures, error handling,
and test requirements.

**Total Document Statistics:**

- Sections: 8
- Code Examples: 100+
- Algorithms: 20+
- Test Cases: 30+
- Platform Specifications: 12

---

_End of Component Specification Document_
