import { Actor, log } from 'apify';
import { fetchFilings, lookupCik } from './edgar.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { ticker, keyword, formType = 'all', daysBack = 14, maxResults = 50 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const FILING_SEARCH_EVENT = 'filing-search';

const cik = ticker ? await lookupCik(ticker) : null;

const endDate = new Date();
const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

const filings = await fetchFilings({
    cik,
    keyword,
    formType,
    startDate,
    endDate,
    limit: Math.min(maxResults, 100),
});

for (const filing of filings) {
    await Actor.pushData(filing);
}

await Actor.charge({ eventName: FILING_SEARCH_EVENT });

log.info(`Pushed ${filings.length} filing(s)`);

await Actor.exit();
