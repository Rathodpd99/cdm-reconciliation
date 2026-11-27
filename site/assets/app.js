"use strict";

/* Rows and default counts mirror the workbook's CDM sheet. */
const denominations = [
  { value: 2000, cdm: 0,   cash: 0   },
  { value: 500,  cdm: 438, cash: 447 },
  { value: 200,  cdm: 254, cash: 256 },
  { value: 100,  cdm: 136, cash: 137 }
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const tbody = document.getElementById("rows");

const cells = denominations.map((d) => {
  const tr = document.createElement("tr");

  const th = document.createElement("td");
  th.textContent = inr.format(d.value);
  tr.appendChild(th);

  tr.appendChild(makeCountCell(d, "cdm"));

  const cdmTotal = document.createElement("td");
  cdmTotal.className = "inr";
  tr.appendChild(cdmTotal);

  tr.appendChild(makeCountCell(d, "cash"));

  const cashTotal = document.createElement("td");
  cashTotal.className = "inr";
  tr.appendChild(cashTotal);

  const countDiff = document.createElement("td");
  tr.appendChild(countDiff);

  const amountDiff = document.createElement("td");
  amountDiff.className = "inr";
  tr.appendChild(amountDiff);

  const variance = document.createElement("td");
  tr.appendChild(variance);

  tbody.appendChild(tr);

  return { cdmTotal, cashTotal, countDiff, amountDiff, variance };
});

function makeCountCell(d, field) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.className = "count";
  input.type = "number";
  input.min = "0";
  input.step = "1";
  input.inputMode = "numeric";
  input.value = String(d[field]);
  input.setAttribute(
    "aria-label",
    (field === "cdm" ? "CDM count for " : "Cash in hand count for ") + inr.format(d.value)
  );
  input.addEventListener("input", () => {
    d[field] = parseCount(input.value);
    render();
  });
  input.addEventListener("blur", () => {
    input.value = String(d[field]);
  });
  input.addEventListener("focus", () => input.select());
  td.appendChild(input);
  return td;
}

function parseCount(raw) {
  const n = Number(String(raw).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function setDiffStyle(cell, value) {
  cell.classList.remove("diff-pos", "diff-zero");
  if (value > 0) cell.classList.add("diff-pos");
  else if (value === 0) cell.classList.add("diff-zero");
}

function render() {
  let cdmCount = 0, cdmTotal = 0, cashCount = 0, cashTotal = 0;

  denominations.forEach((d, i) => {
    const rowCdm = d.value * d.cdm;
    const rowCash = d.value * d.cash;
    const countDiff = d.cash - d.cdm;
    const amountDiff = rowCash - rowCdm;
    const c = cells[i];

    cdmCount += d.cdm;
    cdmTotal += rowCdm;
    cashCount += d.cash;
    cashTotal += rowCash;

    c.cdmTotal.textContent = inr.format(rowCdm);
    c.cashTotal.textContent = inr.format(rowCash);

    c.countDiff.textContent = countDiff > 0 ? "+" + num.format(countDiff) : num.format(countDiff);
    setDiffStyle(c.countDiff, countDiff);

    c.amountDiff.textContent = (amountDiff > 0 ? "+" : "") + inr.format(amountDiff);
    setDiffStyle(c.amountDiff, amountDiff);

    const variance = rowCdm === 0 ? (amountDiff === 0 ? 0 : null) : amountDiff / rowCdm;
    c.variance.textContent = variance === null ? "—" : (variance * 100).toFixed(2) + "%";
  });

  const totalAmountDiff = cashTotal - cdmTotal;
  const totalCountDiff = cashCount - cdmCount;

  document.getElementById("tCdmCount").textContent = num.format(cdmCount);
  document.getElementById("tCdmTotal").textContent = inr.format(cdmTotal);
  document.getElementById("tCashCount").textContent = num.format(cashCount);
  document.getElementById("tCashTotal").textContent = inr.format(cashTotal);

  const tCount = document.getElementById("tCountDiff");
  tCount.textContent =
    totalCountDiff > 0 ? "+" + num.format(totalCountDiff) : num.format(totalCountDiff);
  setDiffStyle(tCount, totalCountDiff);

  const tAmount = document.getElementById("tAmountDiff");
  tAmount.textContent = (totalAmountDiff > 0 ? "+" : "") + inr.format(totalAmountDiff);
  setDiffStyle(tAmount, totalAmountDiff);

  document.getElementById("tVariance").textContent =
    cdmTotal === 0 ? "—" : ((totalAmountDiff / cdmTotal) * 100).toFixed(2) + "%";

  document.getElementById("statCdm").textContent = inr.format(cdmTotal);
  document.getElementById("statCash").textContent = inr.format(cashTotal);
  document.getElementById("statCdmCount").textContent = num.format(cdmCount) + " notes";
  document.getElementById("statCashCount").textContent = num.format(cashCount) + " notes";

  const statDiff = document.getElementById("statDiff");
  const statDiffNote = document.getElementById("statDiffNote");
  const statCard = document.getElementById("statDiffCard");
  const status = document.getElementById("status");

  statDiff.textContent = (totalAmountDiff > 0 ? "+" : "") + inr.format(totalAmountDiff);
  statCard.classList.remove("flag-red", "flag-green");

  if (totalAmountDiff === 0) {
    statCard.classList.add("flag-green");
    statDiffNote.textContent = "CDM and cash agree";
    status.className = "status balanced";
    status.innerHTML = "<strong>Balanced.</strong> Cash in hand matches the CDM entry exactly.";
  } else if (totalAmountDiff > 0) {
    statCard.classList.add("flag-red");
    statDiffNote.textContent = "Excess cash in hand";
    status.className = "status open";
    status.innerHTML =
      "<strong>Excess in hand:</strong> cash in hand is " +
      inr.format(totalAmountDiff) + " across " + num.format(totalCountDiff) +
      " note(s) higher than the CDM entry. Investigate before sign-off.";
  } else {
    statCard.classList.add("flag-red");
    statDiffNote.textContent = "Shortfall in cash";
    status.className = "status open";
    status.innerHTML =
      "<strong>Shortfall:</strong> cash in hand is " +
      inr.format(Math.abs(totalAmountDiff)) + " across " + num.format(Math.abs(totalCountDiff)) +
      " note(s) lower than the CDM entry. Investigate before sign-off.";
  }
}

render();
