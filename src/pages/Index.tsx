import React, { useMemo, useState } from "react";

type Frequency = "monthly" | "annual";

interface Row {
  n: number;
  date: Date;
  dateLabel: string;
  begin: number;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  end: number;
  cumulativeInterest: number;
}

const formatMonthInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const parseMonthInput = (value: string) => {
  if (!value) return null;
  const [year, month] = value.split("-").map((part) => Number(part));
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export default function Index() {
  const [loanStart, setLoanStart] = useState(() => formatMonthInput(new Date()));
  const [principal, setPrincipal] = useState(300000);
  const [original, setOriginal] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [taxes, setTaxes] = useState(3600);
  const [taxesFreq, setTaxesFreq] = useState<Frequency>("annual");
  const [extra, setExtra] = useState(0);
  const [extraFreq, setExtraFreq] = useState<Frequency>("monthly");
  const [extraStart, setExtraStart] = useState(() => formatMonthInput(new Date()));

  const monthlyTaxes = taxesFreq === "annual" ? taxes / 12 : taxes;
  const monthlyExtra = extraFreq === "annual" ? extra / 12 : extra;
  const r = rate / 100 / 12;
  const n = Math.max(1, Math.ceil(years * 12));
  const baseDate = parseMonthInput(loanStart) ?? new Date();
  const extraStartDate = parseMonthInput(extraStart) ?? baseDate;

  const payment = r === 0
    ? principal / n
    : (principal * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1);

  const schedule = useMemo<Row[]>(() => {
    let bal = principal;
    let cumInt = 0;
    const rows: Row[] = [];

    for (let i = 1; i <= n && bal > 0; i++) {
      const date = addMonths(baseDate, i - 1);
      const interest = bal * r;
      let principalPaid = payment - interest;
      const extraPaid = date >= extraStartDate ? monthlyExtra : 0;

      if (principalPaid + extraPaid > bal) {
        principalPaid = bal;
      }

      const end = bal - principalPaid - extraPaid;
      cumInt += interest;

      rows.push({
        n: i,
        date,
        dateLabel: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        begin: bal,
        payment,
        interest,
        principal: principalPaid,
        extra: extraPaid,
        end,
        cumulativeInterest: cumInt,
      });

      bal = end;
    }

    return rows;
  }, [principal, payment, monthlyExtra, n, r, baseDate, extraStartDate]);

  const fmt = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalInterest = schedule.at(-1)?.cumulativeInterest ?? 0;
  const totalTaxes = monthlyTaxes * schedule.length;
  const totalMonthly = payment + monthlyTaxes + monthlyExtra;
  const totalCost = principal + totalInterest + totalTaxes;
  const payoffDate = addMonths(baseDate, Math.max(schedule.length - 1, 0));
  const payoffLabel = payoffDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const payoffYears = Math.floor(schedule.length / 12);
  const payoffMonths = schedule.length % 12;

  const inputBase =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-medium text-slate-900 shadow-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const inputLeftIcon =
    "w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-lg font-medium text-slate-900 shadow-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const inputRightIcon =
    "w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-12 text-lg font-medium text-slate-900 shadow-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  const costParts = [
    { label: "Principal", value: principal, className: "bg-blue-500" },
    { label: "Interest", value: totalInterest, className: "bg-amber-500" },
    { label: "Taxes", value: totalTaxes, className: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white shadow-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M9 7h6" />
                <path d="M9 11h6" />
                <path d="M9 15h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Loan Amortization Calculator</h1>
              <p className="text-sm text-slate-500">
                Calculate your mortgage payments and view the full schedule
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            Print Schedule
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 sm:grid-cols-[300px,1fr]">
          <aside className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Loan Details</h2>

              <div className="mt-6 space-y-6">
                <label className="block">
                  <span className="text-lg font-semibold text-slate-700">Loan Start Date</span>
                  <input
                    type="month"
                    value={loanStart}
                    onChange={(e) => setLoanStart(e.target.value)}
                    className={`mt-3 ${inputBase} pr-10`}
                  />
                </label>

                <label className="block">
                  <span className="text-lg font-semibold text-slate-700">Original Loan Amount</span>
                  <div className="relative mt-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
                    <input
                      type="number"
                      value={original}
                      onChange={(e) => setOriginal(Number(e.target.value))}
                      className={inputLeftIcon}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    The initial loan amount when originated
                  </p>
                </label>

                <label className="block">
                  <span className="text-lg font-semibold text-slate-700">Remaining Balance</span>
                  <div className="relative mt-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className={inputLeftIcon}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Current principal balance owed
                  </p>
                </label>

                <label className="block">
                  <span className="text-lg font-semibold text-slate-700">
                    Interest Rate (Annual %)
                  </span>
                  <div className="relative mt-3">
                    <input
                      type="number"
                      step="0.125"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className={inputRightIcon}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                      %
                    </span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-lg font-semibold text-slate-700">Loan Term (Years)</span>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className={`mt-3 ${inputBase}`}
                  />
                </label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-700">Property Taxes</span>
                    <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
                      {(["monthly", "annual"] as Frequency[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setTaxesFreq(mode)}
                          className={`rounded-full px-3 py-1 font-medium transition ${
                            taxesFreq === mode
                              ? "bg-blue-600 text-white"
                              : "text-slate-500"
                          }`}
                        >
                          {mode === "monthly" ? "Monthly" : "Annual"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
                    <input
                      type="number"
                      value={taxes}
                      onChange={(e) => setTaxes(Number(e.target.value))}
                      className={inputLeftIcon}
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Annual property tax amount ({fmt(monthlyTaxes)}/mo)
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-700">Extra Payments</span>
                    <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
                      {(["monthly", "annual"] as Frequency[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setExtraFreq(mode)}
                          className={`rounded-full px-3 py-1 font-medium transition ${
                            extraFreq === mode
                              ? "bg-blue-600 text-white"
                              : "text-slate-500"
                          }`}
                        >
                          {mode === "monthly" ? "Monthly" : "Annual"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
                    <input
                      type="number"
                      value={extra}
                      onChange={(e) => setExtra(Number(e.target.value))}
                      className={inputLeftIcon}
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Additional monthly principal payment
                  </p>

                  <label className="block">
                    <span className="text-lg font-semibold text-slate-700">
                      Extra Payment Start Date
                    </span>
                    <input
                      type="month"
                      value={extraStart}
                      onChange={(e) => setExtraStart(e.target.value)}
                      className={`mt-3 ${inputBase} pr-10`}
                    />
                    <p className="mt-2 text-sm text-slate-500">
                      When to begin making extra payments
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Monthly P&amp;I</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{fmt(payment)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Total Monthly</p>
                <p className="mt-2 text-xl font-semibold text-blue-600">
                  {fmt(totalMonthly)}
                </p>
                <p className="mt-1 text-xs text-slate-400">Incl. taxes &amp; extra</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Total Interest</p>
                <p className="mt-2 text-xl font-semibold text-amber-500">
                  {fmt(totalInterest)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Payoff Date</p>
                <p className="mt-2 text-lg font-semibold text-emerald-500">
                  {payoffLabel}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {payoffYears}y {payoffMonths}m
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Cost Breakdown</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Principal (Remaining Balance)</span>
                  <span className="font-semibold text-slate-900">{fmt(principal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Interest</span>
                  <span className="font-semibold text-amber-500">{fmt(totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Taxes ({schedule.length} months)</span>
                  <span className="font-semibold text-slate-700">{fmt(totalTaxes)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-900">Total Cost</span>
                  <span className="font-semibold text-blue-600">{fmt(totalCost)}</span>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="flex h-full">
                  {costParts.map((part) => {
                    const pct = totalCost > 0 ? (part.value / totalCost) * 100 : 0;
                    return (
                      <span
                        key={part.label}
                        className={part.className}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                {costParts.map((part) => (
                  <div key={part.label} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${part.className}`} />
                    {part.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Amortization Schedule</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {schedule.length} payments over {payoffYears} years and {payoffMonths} months
                </p>
              </div>

              <div className="max-h-[520px] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs font-semibold text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Beginning Balance</th>
                      <th className="px-4 py-3 text-right">Payment</th>
                      <th className="px-4 py-3 text-right">Principal</th>
                      <th className="px-4 py-3 text-right">Interest</th>
                      <th className="px-4 py-3 text-right">Extra</th>
                      <th className="px-4 py-3 text-right">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedule.map((row) => (
                      <tr key={row.n} className="hover:bg-slate-100">
                        <td className="px-4 py-3 text-slate-500">{row.n}</td>
                        <td className="px-4 py-3 text-slate-700">{row.dateLabel}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{fmt(row.begin)}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{fmt(row.payment)}</td>
                        <td className="px-4 py-3 text-right text-blue-600">{fmt(row.principal)}</td>
                        <td className="px-4 py-3 text-right text-amber-500">{fmt(row.interest)}</td>
                        <td className="px-4 py-3 text-right text-emerald-500">
                          {row.extra ? fmt(row.extra) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{fmt(row.end)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-slate-400">
          This calculator provides estimates for informational purposes only. Actual loan terms may vary.
        </div>
      </footer>
    </div>
  );
}
