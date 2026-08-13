# SEC 13D/13G Ownership Tracker — New 5%+ Stake Filings

Track new SEC Schedule 13D and 13G filings — the mandatory disclosure an
investor must file within days of acquiring beneficial ownership of 5%
or more of a public company's stock. A **13D** signals activist or
control intent (the filer may seek to influence management, force a
sale, push for board seats); a **13G** signals a passive stake, typically
filed by index funds and institutional holders with no such intent.

Built for M&A watchers, activist-investor trackers, and IR teams who
want to know the moment someone starts building a meaningful stake in a
company — often the earliest public signal of an activist campaign or
takeover interest.

## Input

```json
{
  "ticker": "AAPL",
  "keyword": "",
  "formType": "all",
  "daysBack": 14,
  "maxResults": 50
}
```

| Field | Type | Description |
|---|---|---|
| `ticker` | string (optional) | Stock ticker of the subject (target) company to filter by. |
| `keyword` | string (optional) | Free-text search across the filing (e.g. a company or investor name). |
| `formType` | string | `"all"`, `"13D"` (activist/control intent), or `"13G"` (passive stake). Default `"all"`. |
| `daysBack` | number | How many days back from today to search, by filing date. Default `14`, max `90`. |
| `maxResults` | number | Max filings to return, most recently filed first. Default `50`, max `100`. |

Leave both `ticker` and `keyword` blank to return all new 13D/13G
filings market-wide.

## Output

One record per filing:

```json
{
  "accessionNumber": "0002100119-26-000139",
  "formType": "SCHEDULE 13G",
  "subjectCompany": { "name": "Apple Inc.", "ticker": "AAPL", "cik": "0000320193" },
  "filedBy": [
    { "name": "VANGUARD CAPITAL MANAGEMENT LLC", "ticker": null, "cik": "0002100119" }
  ],
  "filingDate": "2026-08-11",
  "filingUrl": "https://www.sec.gov/Archives/edgar/data/320193/000210011926000139-index.htm"
}
```

A search with no matches in the requested window returns no items but
is still billed once for the search.

## How it works

Direct calls to the official [SEC EDGAR full text search
API](https://www.sec.gov/edgar/search/) (`efts.sec.gov`), filtered to
Schedule 13D and/or 13G filings. Ticker lookups resolve against SEC's own
company-ticker mapping file. No proxy, no key, no scraping.

**Note:** the filing itself (linked via `filingUrl`) discloses the
percent ownership and purpose of the transaction — the search index used
here doesn't expose those fields directly, so this actor tells you *who*
just crossed the 5% threshold on *what*, and you open the filing for the
stake size and stated intent.

## Pricing note

Billed per **search**, not per filing returned — one charge whether the
search returns 0 filings or 100.

## Related products

- [SEC 8-K Material Event Tracker](https://github.com/timmKal01/sec-8k-material-event-tracker) — material corporate events from public filings
- [Insider Trading Alert](https://github.com/timmKal01/insider-trading-alert) — the officer/director equivalent (SEC Form 4), smaller trades by company insiders rather than outside 5%+ stakebuilders
