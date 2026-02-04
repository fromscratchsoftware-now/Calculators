import React, { useMemo, useState } from "react";

type Frequency = "monthly" | "annual";

interface Row {
  n: number;
  date: string;
  begin: number;
  interest: number;
  principal: number;
  extra: number;
  end: number;
  cumulativeInterest: number;
}

export default function Index() {
  const [principal, setPrincipal] = useState(275000);
  const [original, setOriginal] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(200);
  const [extraFreq, setExtraFreq] = useState<Frequency>("monthly");

  const monthlyExtra = extraFreq === "annual" ? extra / 12 : extra;
  const r = rate / 100 / 12;
  const n = Math.ceil(years * 12);

  const payment =
    (principal * r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);

  const schedule = useMemo<Row[]>(() => {
    let bal = principal;
    let cumInt = 0;
    const rows: Row[] = [];

    for (let i = 1; i <= n && bal > 0; i++) {
      const interest = bal * r;
      let principalPaid = payment - interest;
      let extraPaid = monthlyExtra;

      if (principalPaid + extraPaid > bal) {
        principalPaid = bal;
        extraPaid = 0;
      }

      const end = bal - principalPaid - extraPaid;
      cumInt += interest;

      rows.push({
        n: i,
        date: new Date(
          new Date().setMonth(new Date().getMonth() + i)
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        begin: bal,
        interest,
        principal: principalPaid,
        extra: extraPaid,
        end,
        cumulativeInterest: cumInt,
      });

      bal = end;
    }

    return rows;
  }, [principal, payment, monthlyExtra, n, r]);

  const fmt = (v: number) =>
    v.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          Loan Amortization Calculator
        </h1>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow space-y-3">
            <label>
              Original Loan
              <input
                type="number"
                value={original}
                onChange={(e) => setOriginal(+e.target.value)}
                className="input"
              />
            </label>

            <label>
              Remaining Balance
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(+e.target.value)}
                className="input"
              />
            </label>

            <label>
              Interest Rate (%)
              <input
                type="number"
                step="0.125"
                value={rate}
                onChange={(e) => setRate(+e.target.value)}
                className="input"
              />
            </label>

            <label>
              Term (years)
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(+e.target.value)}
                className="input"
              />
            </label>

            <label>
              Extra Payment
              <input
                type="number"
                value={extra}
                onChange={(e) => setExtra(+e.target.value)}
                className="input"
              />
            </label>
          </div>

          {/* Summary */}
          <div className="bg-white p-5 rounded-xl shadow">
            <p><strong>Monthly P&I:</strong> {fmt(payment)}</p>
            <p><strong>Total Interest:</strong> {fmt(schedule.at(-1)?.cumulativeInterest || 0)}</p>
            <p><strong>Payoff:</strong> {schedule.length} payments</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-auto max-h-[600px]">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Begin</th>
                <th>Interest</th>
                <th>Principal</th>
                <th>Extra</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((r) => (
                <tr key={r.n} className="border-t">
                  <td>{r.n}</td>
                  <td>{r.date}</td>
                  <td>{fmt(r.begin)}</td>
                  <td>{fmt(r.interest)}</td>
                  <td>{fmt(r.principal)}</td>
                  <td>{fmt(r.extra)}</td>
                  <td>{fmt(r.end)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Print Schedule
        </button>
      </div>
    </div>
  );
}
