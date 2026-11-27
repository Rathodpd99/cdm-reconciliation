# CDM Reconciliation

**Live page:** https://cdm-reconciliation-9bhf01.freebuff.site  
Preview: https://cdm-reconciliation-9bhf01-preview.freebuff.site

Single-page calculator for reconciling cash deposit machine (CDM) counts against physical cash in hand, by denomination: ₹2,000, ₹500, ₹200 and ₹100.

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 3000
```

Enter counts in either the CDM or Cash column — per-denomination totals, count and amount differences, variance, and the overall excess/shortfall banner update as you type. Amounts use Indian lakh grouping, e.g. ₹2,83,400.

Defaults reproduce the CDM sheet dated 10 Jun 2026 (counted at Hooper): CDM ₹2,83,400 against cash in hand ₹2,88,400 — a ₹5,000 / 12-note excess.

No dependencies, no build step. The `site/` folder holds the deployment bundle (the three page files plus a static-asset Worker manifest) that serves the live URL above.
