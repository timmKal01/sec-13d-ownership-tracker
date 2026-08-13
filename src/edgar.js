const UA = 'Sec13DOwnershipTracker/0.1 (+contact: sec-13d-tracker-admin@example.com)';
const FTS_BASE = 'https://efts.sec.gov/LATEST/search-index';

const FORM_PARAMS = {
    all: 'SCHEDULE 13D,SCHEDULE 13G',
    '13D': 'SCHEDULE 13D',
    '13G': 'SCHEDULE 13G',
};

async function secFetch(url) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`SEC request failed: ${url} (${res.status})`);
    return res;
}

export async function lookupCik(ticker) {
    const res = await secFetch('https://www.sec.gov/files/company_tickers.json');
    const data = await res.json();
    const match = Object.values(data).find((t) => t.ticker.toUpperCase() === ticker.toUpperCase());
    if (!match) throw new Error(`Ticker not found: ${ticker}`);
    return String(match.cik_str).padStart(10, '0');
}

/** Parses an EDGAR display name like "Apple Inc.  (AAPL)  (CIK 0000320193)" or "VANGUARD GROUP INC  (CIK 0000102909)". */
function parseEntity(displayName) {
    const cikMatch = displayName?.match(/^(.*?)\s*\(CIK (\d+)\)\s*$/);
    if (!cikMatch) return { name: displayName ?? null, ticker: null, cik: null };
    const cik = cikMatch[2];
    const tickerMatch = cikMatch[1].match(/^(.*?)\s*\(([A-Z.]+)\)\s*$/);
    if (tickerMatch) return { name: tickerMatch[1].trim(), ticker: tickerMatch[2], cik };
    return { name: cikMatch[1].trim(), ticker: null, cik };
}

export async function fetchFilings({ cik, keyword, formType, startDate, endDate, limit }) {
    const params = new URLSearchParams({
        forms: FORM_PARAMS[formType] ?? FORM_PARAMS.all,
        startdt: startDate.toISOString().slice(0, 10),
        enddt: endDate.toISOString().slice(0, 10),
        size: '100',
    });
    if (keyword) params.set('q', keyword);
    if (cik) params.set('ciks', cik);

    const res = await secFetch(`${FTS_BASE}?${params}`);
    const data = await res.json();
    const hits = data.hits?.hits ?? [];

    const byAccession = new Map();
    for (const hit of hits) {
        const s = hit._source;
        if (!byAccession.has(s.adsh)) byAccession.set(s.adsh, s);
    }

    return [...byAccession.values()]
        .sort((a, b) => b.file_date.localeCompare(a.file_date))
        .slice(0, limit)
        .map((s) => {
            const [subjectRaw, ...filerRaw] = s.display_names ?? [];
            const subjectCompany = parseEntity(subjectRaw);
            const filedBy = filerRaw.map(parseEntity);
            const cikNum = s.ciks?.[0]?.replace(/^0+/, '') || s.ciks?.[0];
            const accessionNoDashes = s.adsh.replace(/-/g, '');
            return {
                accessionNumber: s.adsh,
                formType: s.form,
                subjectCompany,
                filedBy,
                filingDate: s.file_date,
                filingUrl: `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accessionNoDashes}-index.htm`,
            };
        });
}
