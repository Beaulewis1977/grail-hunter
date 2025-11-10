# Grail Hunter 👟

> **"Never miss your grail again"**

Multi-platform sneaker monitoring and alert system built for sneaker collectors and resellers. Your 24/7 sneaker scout.

[![Apify Challenge 2024-2025](https://img.shields.io/badge/Apify-Challenge%202024--2025-blue)](https://apify.com/challenge)
[![Built with Apify](https://img.shields.io/badge/Built%20with-Apify-orange)](https://apify.com)

---

## 🎯 Overview

**Grail Hunter** is a sophisticated Apify actor that aggregates sneaker listings from 4 major marketplaces and delivers real-time alerts when your target sneakers appear. Stop manually checking multiple tabs—let Grail Hunter find the deals for you.

This project is developed as part of the **Apify Challenge 2024-2025**.

---

## ✨ What It Does

Grail Hunter monitors sneaker listings across multiple platforms in real-time:

- 🔍 **Searches** for your desired sneakers across 4 major marketplaces simultaneously
- 📊 **Normalizes** disparate data into a unified, easy-to-use format
- 🤖 **Parses** sneakerhead terminology (DS, VNDS, OG All, etc.) automatically
- 🔔 **Alerts** you instantly via email, Slack, Discord, or webhooks when matches are found
- 💰 **Tracks** pricing and identifies deals below market value
- 🚫 **Deduplicates** listings to prevent alert fatigue

---

## 🎯 Target Platforms

Grail Hunter monitors these 4 major sneaker marketplaces:

| Platform | Type | Description |
|----------|------|-------------|
| **eBay** | Marketplace | World's largest P2P marketplace |
| **Grailed** | Marketplace | Premium streetwear and sneaker marketplace |
| **StockX** | Authenticated | Stock market for sneakers with authentication |
| **GOAT** | Authenticated | Premium authenticated sneaker platform |

---

## 🛠️ Tech Stack

- **Platform**: [Apify](https://apify.com) - Web scraping and automation platform
- **Runtime**: Node.js 18+
- **Framework**: Apify SDK 3.x
- **Crawling**: Crawlee 3.x (Puppeteer, Playwright, Cheerio)
- **Parsing**: AI-powered (OpenAI) + Regex for terminology extraction
- **Storage**: Apify Dataset & Key-Value Store
- **Notifications**: Multi-channel (Email, Slack, Discord, Webhooks)

---

## 🚀 Key Features

### 🔍 Smart Search
- Flexible search criteria (brand, model, colorway, size)
- Support for multiple search terms in a single run
- Price range filtering

### 🤖 Intelligent Parsing
- Automatically understands sneakerhead slang (VNDS, DS, OG All)
- Extracts condition, size, and special tags
- AI-powered fallback for ambiguous listings

### 📊 Data Normalization
- Unified schema across all platforms
- Standardized condition ratings
- Consistent pricing and sizing information

### 🔔 Multi-Channel Alerts
- Email notifications with rich HTML formatting
- Slack/Discord webhooks with embed cards
- Custom webhook integration for automation tools
- Real-time alerts for new listings

### 💰 Deal Scoring
- Compares P2P prices against authenticated platform values
- Identifies listings below market value
- Calculates savings percentage and amount

### 🎯 Deduplication
- Tracks seen listings across multiple runs
- Prevents duplicate alerts
- Persistent state management

---

## 📋 Use Cases

### For Collectors
Set alerts for your "grail" sneakers and get notified the moment they appear in your size at your target price.

### For Resellers
Monitor multiple models across all platforms to identify underpriced listings before the competition.

### For Deal Hunters
Track release calendars and get alerts for upcoming drops and price drops on existing listings.

---

## 🏆 Apify Challenge

This actor is submitted for the **Apify $1M Challenge (2024-2025)**. It demonstrates:

- ✅ Novel multi-platform orchestration architecture
- ✅ Advanced data normalization and AI parsing
- ✅ Production-ready error handling and monitoring
- ✅ Compliance with platform eligibility requirements
- ✅ Real-world market validation and user demand

---

## 📖 Documentation

For detailed technical architecture, API specifications, and implementation details, see:
- [Technical Architecture](./grail-hunter-technical-architecture.md)

---

## 🤝 Contributing

This is a challenge submission project. If you have suggestions or find issues, feel free to open an issue or discussion.

---

## 📄 License

This project is developed for the Apify Challenge 2024-2025.

---

## 🙏 Acknowledgments

- Built with [Apify](https://apify.com)
- Developed for sneaker enthusiasts worldwide
- Submitted for Apify Challenge 2024-2025

---

**Made with ❤️ for the sneaker community**
