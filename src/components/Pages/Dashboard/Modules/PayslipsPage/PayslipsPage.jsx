import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, Download, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MonthPicker from "/src/components/Pages/Dashboard/Modules/PayslipsPage/MonthPicker";

const LS_KEY = "payslips:v1";

const euro = (n) =>
  (Number(n) || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const genId = () =>
  "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Barèmes TMI (marginale) fournis */
const TMI_BRACKETS = [
  { from: 0, to: 11498, rate: 0 },
  { from: 11498, to: 29316, rate: 11 },
  { from: 29316, to: 83824, rate: 30 },
  { from: 83824, to: 180294, rate: 41 },
  { from: 180294, to: Infinity, rate: 45 },
];

function getTMI(revenuImposable) {
  const r = Number(revenuImposable) || 0;
  const b =
    TMI_BRACKETS.find((br) => r >= br.from && r < br.to) ||
    TMI_BRACKETS[TMI_BRACKETS.length - 1];
  return b.rate;
}

/** Somme par année + détail par employeur */
function sumYearByEmployers(state, year) {
  const map = new Map();
  for (const p of state.payslips) {
    const y = p.ym?.slice(0, 4);
    if (y !== String(year)) continue;
    const emp = state.employers.find((e) => e.id === p.employerId);
    const name = emp ? emp.name : "—";
    const prev = map.get(name) || 0;
    map.set(name, prev + (Number(p.netImposable) || 0));
  }
  const byEmployer = Array.from(map.entries())
    .map(([employerName, total]) => ({ employerName, total }))
    .sort((a, b) => b.total - a.total);
  const total = byEmployer.reduce((s, r) => s + r.total, 0);
  return { total, byEmployer };
}

function ymToDate(ym) {
  // "YYYY-MM" -> Date (1er du mois en local)
  if (!ym) return null;
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
}
function isYmWithinContract(ym, contract) {
  // vérifie que le mois "ym" ∈ [start, end]
  const d = ymToDate(ym);
  if (!d) return false;
  const ds = contract.start ? ymToDate(contract.start) : null;
  const de = contract.end ? ymToDate(contract.end) : null;
  if (ds && d < ds) return false;
  if (de) {
    // inclure mois de fin => comparer YYYY-MM
    const n = Number(ym.replace("-", ""));
    const nEnd = Number(contract.end.replace("-", ""));
    if (n > nEnd) return false;
  }
  return true;
}

/** Schéma state
 * employers: [{ id, name }]
 * contracts: [{ id, employerId, title, type, start, end?, salaryType, basePay, hours?, fileName?, fileUrl? }]
 * payslips: [{ id, employerId, contractId?, ym, netImposable, gross?, fileName?, fileUrl? }]
 */
const defaultState = { employers: [], contracts: [], payslips: [] };

export default function PayslipsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : defaultState;
      // migration light si ancien format
      return {
        employers: parsed.employers || [],
        contracts: parsed.contracts || [],
        payslips: parsed.payslips || [],
      };
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  /* ---------------- Employeurs ---------------- */
  const [newEmployer, setNewEmployer] = useState("");
  const addEmployer = () => {
    const name = newEmployer.trim();
    if (!name) return;
    setState((s) => ({
      ...s,
      employers: [...s.employers, { id: genId(), name }],
    }));
    setNewEmployer("");
  };
  const removeEmployer = (id) => {
    setState((s) => ({
      ...s,
      employers: s.employers.filter((e) => e.id !== id),
      contracts: s.contracts.filter((c) => c.employerId !== id),
      payslips: s.payslips.filter((p) => p.employerId !== id),
    }));
  };

  /* ---------------- Contrats ---------------- */
  const [contractForm, setContractForm] = useState({
    employerId: "",
    title: "",
    type: "CDI", // CDI, CDD, Intérim, Alternance, Stage, Autre
    start: new Date().toISOString().slice(0, 7),
    end: "",
    salaryType: "Mensuel", // Mensuel, Annuel, Horaire
    basePay: "",
    hours: "",
    fileName: "",
    fileUrl: "",
  });

  useEffect(() => {
    // auto sélectionner 1er employeur si vide
    if (!contractForm.employerId && state.employers[0]) {
      setContractForm((f) => ({ ...f, employerId: state.employers[0].id }));
    }
  }, [state.employers, contractForm.employerId]);

  const onContractFile = (file) => {
    if (!file) {
      setContractForm((f) => ({ ...f, fileName: "", fileUrl: "" }));
      return;
    }
    const url = URL.createObjectURL(file);
    setContractForm((f) => ({ ...f, fileName: file.name, fileUrl: url }));
  };

  const addContract = () => {
    if (!contractForm.employerId || !contractForm.title || !contractForm.start) return;
    setState((s) => ({
      ...s,
      contracts: [
        ...s.contracts,
        {
          id: genId(),
          employerId: contractForm.employerId,
          title: contractForm.title.trim(),
          type: contractForm.type,
          start: contractForm.start,
          end: contractForm.end || "",
          salaryType: contractForm.salaryType,
          basePay: Number(contractForm.basePay) || 0,
          hours: Number(contractForm.hours) || 0,
          fileName: contractForm.fileName || "",
          fileUrl: contractForm.fileUrl || "",
        },
      ],
    }));
    setContractForm((f) => ({
      ...f,
      title: "",
      type: "CDI",
      start: new Date().toISOString().slice(0, 7),
      end: "",
      salaryType: "Mensuel",
      basePay: "",
      hours: "",
      fileName: "",
      fileUrl: "",
    }));
  };

  const removeContract = (id) => {
    setState((s) => ({
      ...s,
      contracts: s.contracts.filter((c) => c.id !== id),
      payslips: s.payslips.map((p) => (p.contractId === id ? { ...p, contractId: "" } : p)),
    }));
  };

  /* ---------------- Bulletins ---------------- */
  const [form, setForm] = useState({
    employerId: "",
    contractId: "",
    ym: new Date().toISOString().slice(0, 7),
    netImposable: "",
    gross: "",
    fileName: "",
    fileUrl: "",
  });

  useEffect(() => {
    if (!form.employerId && state.employers[0]) {
      setForm((f) => ({ ...f, employerId: state.employers[0].id }));
    }
  }, [state.employers, form.employerId]);

  const onFile = (file) => {
    if (!file) {
      setForm((f) => ({ ...f, fileName: "", fileUrl: "" }));
      return;
    }
    const url = URL.createObjectURL(file); // session
    setForm((f) => ({ ...f, fileName: file.name, fileUrl: url }));
  };

  const employerContracts = useMemo(() => {
    return state.contracts.filter((c) => c.employerId === form.employerId);
  }, [state.contracts, form.employerId]);

  const employerContractsForYm = useMemo(() => {
    return employerContracts.filter((c) => isYmWithinContract(form.ym, c));
  }, [employerContracts, form.ym]);

  useEffect(() => {
    // si contract sélectionné n’est plus valide pour le mois ou l’employeur, on le vide
    if (form.contractId) {
      const ok = employerContractsForYm.some((c) => c.id === form.contractId);
      if (!ok) setForm((f) => ({ ...f, contractId: "" }));
    }
  }, [employerContractsForYm, form.contractId]);

  const addPayslip = () => {
    if (!form.employerId || !form.ym || !form.netImposable) return;
    setState((s) => ({
      ...s,
      payslips: [
        ...s.payslips,
        {
          id: genId(),
          employerId: form.employerId,
          contractId: form.contractId || "",
          ym: form.ym,
          netImposable: Number(form.netImposable) || 0,
          gross: Number(form.gross) || 0,
          fileName: form.fileName || "",
          fileUrl: form.fileUrl || "",
        },
      ],
    }));
    setForm((f) => ({
      ...f,
      contractId: "",
      netImposable: "",
      gross: "",
      fileName: "",
      fileUrl: "",
    }));
  };

  const removePayslip = (id) =>
    setState((s) => ({ ...s, payslips: s.payslips.filter((p) => p.id !== id) }));

  /* ---------------- Groupes & années ---------------- */
  const payslipsByEmployerYear = useMemo(() => {
    const map = {};
    for (const p of state.payslips) {
      const emp = state.employers.find((e) => e.id === p.employerId);
      const empName = emp ? emp.name : "—";
      const year = p.ym?.slice(0, 4) || "—";
      const key = empName + "___" + year;
      if (!map[key]) map[key] = { employerName: empName, year, items: [] };
      map[key].items.push(p);
    }
    return Object.values(map).sort(
      (a, b) =>
        a.employerName.localeCompare(b.employerName) ||
        b.year.localeCompare(a.year)
    );
  }, [state.payslips, state.employers]);

  const years = useMemo(() => {
    const set = new Set(state.payslips.map((p) => p.ym?.slice(0, 4)).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [state.payslips]);

  /* ---------------- TMI: Auto / Manuel ---------------- */
  const [tmiYear, setTmiYear] = useState(
    years[0] || String(new Date().getFullYear() - 1)
  );
  useEffect(() => {
    if (years.length && !years.includes(tmiYear)) setTmiYear(years[0]);
  }, [years, tmiYear]);

  const [revenueMode, setRevenueMode] = useState("auto"); // 'auto' | 'manual'
  const [manualRevenue, setManualRevenue] = useState("");

  const { total: autoTotal, byEmployer } = useMemo(
    () => sumYearByEmployers(state, tmiYear),
    [state, tmiYear]
  );

  const baseRevenue =
    revenueMode === "manual"
      ? manualRevenue !== ""
        ? Number(manualRevenue) || 0
        : 0
      : autoTotal;

  const tmiRate = getTMI(baseRevenue);

  /* ---------------- Export / Import ---------------- */
  const exportJSON = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payslips_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed && parsed.employers && parsed.payslips) {
          setState({
            employers: parsed.employers || [],
            contracts: parsed.contracts || [],
            payslips: parsed.payslips || [],
          });
        } else {
          alert("Fichier invalide.");
        }
      } catch {
        alert("Lecture impossible.");
      }
    };
    reader.readAsText(file);
  };

  /* ---------------- UI ---------------- */
  return (
    <main className="min-h-screen bg-noir-780 text-gray-100">
      <div className="mx-auto max-w-3xl p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full border border-gray-700 bg-gray-900 hover:bg-gray-800 transition"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-100">Bulletins & TMI</h1>
        </header>

        {/* Bloc TMI */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Calcul TMI</h3>
          </div>

          {/* Ligne 1 : Année + Toggle Auto/Manuel */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Année de référence (N-1)</div>
              <select
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
                value={tmiYear}
                onChange={(e) => setTmiYear(e.target.value)}
              >
                {[...new Set([String(new Date().getFullYear() - 1), ...years])].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Source du revenu</div>
              <div className="flex w-full h-[42px] bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setRevenueMode("auto")}
                  className={`flex-1 text-sm font-medium ${
                    revenueMode === "auto"
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 active:bg-gray-800"
                  }`}
                >
                  <div className="h-full flex items-center justify-center">Automatique</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRevenueMode("manual")}
                  className={`flex-1 text-sm font-medium ${
                    revenueMode === "manual"
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 active:bg-gray-800"
                  }`}
                >
                  <div className="h-full flex items-center justify-center">Manuel</div>
                </button>
              </div>
            </div>
          </div>

          {/* Ligne 2 : Revenu & TMI */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Revenu (manuel/auto) */}
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-400 mb-1">
                Revenu net imposable {tmiYear} {revenueMode === "auto" ? "(calculé)" : "(saisie manuelle)"}
              </div>
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={euro(autoTotal)}
                  value={revenueMode === "manual" ? manualRevenue : autoTotal}
                  onChange={(e) => setManualRevenue(e.target.value)}
                  disabled={revenueMode !== "manual"}
                  className={`w-full bg-transparent outline-none text-gray-100 ${
                    revenueMode !== "manual" ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
                <span className="text-gray-400 text-sm">€</span>
              </div>

              {/* Breakdown auto par employeur */}
              {revenueMode === "auto" && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {byEmployer.length === 0 ? (
                    <span className="text-[11px] text-gray-500">
                      Aucun bulletin trouvé sur {tmiYear}.
                    </span>
                  ) : (
                    byEmployer.map((r) => (
                      <span
                        key={r.employerName}
                        className="text-[11px] px-2 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-300"
                      >
                        {r.employerName}: {euro(r.total)}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* TMI */}
            <div>
              <div className="text-xs text-gray-400 mb-1">Taux marginal (TMI)</div>
              <div
                className={`px-3 py-2 rounded-xl border text-sm ${
                  tmiRate <= 11
                    ? "border-emerald-600 bg-emerald-900/30 text-emerald-300"
                    : tmiRate <= 30
                    ? "border-amber-600 bg-amber-900/30 text-amber-300"
                    : "border-rose-600 bg-rose-900/30 text-rose-300"
                }`}
              >
                {tmiRate}% (tranche marginale)
              </div>
              <div className="mt-1 text-[11px] text-gray-400">Barème : 0 / 11 / 30 / 41 / 45 %</div>
            </div>
          </div>
        </section>

        {/* Employeurs */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3 space-y-3">
          <h3 className="text-white font-semibold">Employeurs</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nom de l’employeur"
              value={newEmployer}
              onChange={(e) => setNewEmployer(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 placeholder-gray-500 outline-none focus:border-gray-500"
            />
            <button
              onClick={addEmployer}
              className="px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {state.employers.length === 0 ? (
            <p className="text-sm text-gray-400">Ajoute ton premier employeur pour commencer.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {state.employers.map((e) => (
                <span
                  key={e.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-sm"
                >
                  {e.name}
                  <button
                    onClick={() => removeEmployer(e.id)}
                    className="p-1 rounded-lg hover:bg-gray-700"
                    title="Supprimer l’employeur (et ses bulletins/contrats)"
                  >
                    <Trash2 className="w-4 h-4 text-gray-300" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Contrats */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Contrats</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Employeur</div>
              <select
                value={contractForm.employerId}
                onChange={(e) => setContractForm((f) => ({ ...f, employerId: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              >
                {state.employers.length === 0 ? (
                  <option value="">— Ajoute un employeur —</option>
                ) : (
                  state.employers.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Intitulé</div>
              <input
                type="text"
                placeholder="Ex: CDI Développeur"
                value={contractForm.title}
                onChange={(e) => setContractForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 placeholder-gray-500"
              />
            </label>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Type</div>
              <select
                value={contractForm.type}
                onChange={(e) => setContractForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              >
                {["CDI", "CDD", "Intérim", "Alternance", "Stage", "Autre"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Début</div>
              <input
                type="month"
                value={contractForm.start}
                onChange={(e) => setContractForm((f) => ({ ...f, start: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              />
            </label>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Fin (optionnel)</div>
              <input
                type="month"
                value={contractForm.end}
                onChange={(e) => setContractForm((f) => ({ ...f, end: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-xs text-gray-400 mb-1">Rémunération</div>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={contractForm.basePay}
                    onChange={(e) => setContractForm((f) => ({ ...f, basePay: e.target.value }))}
                    className="w-full bg-transparent outline-none text-gray-100 text-right"
                  />
                  <span className="text-gray-400 text-sm">€</span>
                </div>
              </label>
              <label className="block">
                <div className="text-xs text-gray-400 mb-1">Type</div>
                <select
                  value={contractForm.salaryType}
                  onChange={(e) => setContractForm((f) => ({ ...f, salaryType: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
                >
                  {["Mensuel", "Annuel", "Horaire"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Heures hebdo (optionnel)</div>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={contractForm.hours}
                onChange={(e) => setContractForm((f) => ({ ...f, hours: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-600 text-sm text-gray-300 bg-gray-900/40 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{contractForm.fileName || "Joindre le contrat (PDF/image) — optionnel"}</span>
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => onContractFile(e.target.files?.[0])}
              />
            </label>

            <button
              onClick={addContract}
              disabled={!contractForm.employerId || !contractForm.title || !contractForm.start}
              className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
            >
              Enregistrer le contrat
            </button>
          </div>

          {/* Liste des contrats */}
          {state.contracts.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">Aucun contrat pour le moment.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {state.contracts
                .slice()
                .sort((a, b) => (a.start > b.start ? -1 : 1))
                .map((c) => {
                  const emp = state.employers.find((e) => e.id === c.employerId);
                  return (
                    <div key={c.id} className="rounded-xl bg-gray-800/60 border border-gray-700 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-200">
                          <span className="font-medium">{emp?.name || "—"}</span> • {c.title} ({c.type})
                          <span className="text-gray-400">
                            {" "}
                            — {c.start} {c.end ? `→ ${c.end}` : "→ en cours"}
                          </span>
                        </div>
                        <button
                          onClick={() => removeContract(c.id)}
                          className="p-2 rounded-lg hover:bg-gray-700"
                          title="Supprimer le contrat"
                        >
                          <Trash2 className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {c.basePay ? `${euro(c.basePay)} / ${c.salaryType.toLowerCase()}` : "Rémunération —"}
                        {c.hours ? ` • ${c.hours} h/sem.` : ""}
                        {c.fileUrl ? (
                          <>
                            {" "}
                            •{" "}
                            <a
                              href={c.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {c.fileName}
                            </a>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Ajout d’un bulletin */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3 space-y-3">
          <h3 className="text-white font-semibold">Ajouter un bulletin</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Employeur</div>
              <select
                value={form.employerId}
                onChange={(e) => setForm((f) => ({ ...f, employerId: e.target.value, contractId: "" }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              >
                {state.employers.length === 0 ? (
                  <option value="">— Ajoute un employeur —</option>
                ) : (
                  state.employers.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            {/* Mois (custom) */}
            <MonthPicker
              label="Mois"
              value={form.ym}
              onChange={(v) => setForm((f) => ({ ...f, ym: v, contractId: "" }))}
            />

            {/* Contrat (filtré par employeur + période) */}
            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Contrat (optionnel)</div>
              <select
                value={form.contractId}
                onChange={(e) => setForm((f) => ({ ...f, contractId: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-100"
              >
                <option value="">— Non lié —</option>
                {employerContractsForYm.length === 0 ? (
                  <option value="" disabled>
                    Aucun contrat correspondant au mois
                  </option>
                ) : (
                  employerContractsForYm.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} • {c.start} {c.end ? `→ ${c.end}` : "→ en cours"}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Net imposable</div>
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.netImposable}
                  onChange={(e) => setForm((f) => ({ ...f, netImposable: e.target.value }))}
                  className="w-full bg-transparent outline-none text-gray-100 text-right"
                />
                <span className="text-gray-400 text-sm">€</span>
              </div>
            </label>

            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Brut (optionnel)</div>
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.gross}
                  onChange={(e) => setForm((f) => ({ ...f, gross: e.target.value }))}
                  className="w-full bg-transparent outline-none text-gray-100 text-right"
                />
                <span className="text-gray-400 text-sm">€</span>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-600 text-sm text-gray-300 bg-gray-900/40 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{form.fileName || "Joindre le PDF (optionnel)"}</span>
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>

            <button
              onClick={addPayslip}
              disabled={!form.employerId || !form.ym || !form.netImposable}
              className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>

          {form.fileUrl && (
            <div className="text-xs text-gray-400">Aperçu fichier disponible jusqu’au rechargement de la page.</div>
          )}
        </section>

        {/* Historique */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Historique</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={exportJSON}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700"
                title="Exporter (JSON)"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                Importer
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => importJSON(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          {payslipsByEmployerYear.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun bulletin enregistré pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {payslipsByEmployerYear.map((group) => {
                const total = group.items.reduce((s, p) => s + (Number(p.netImposable) || 0), 0);
                return (
                  <div
                    key={group.employerName + group.year}
                    className="rounded-2xl bg-gray-800/60 border border-gray-700 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-300">{group.employerName}</span>{" "}
                        <span className="text-gray-500">• {group.year}</span>
                      </div>
                      <div className="text-sm text-gray-200">{euro(total)}</div>
                    </div>

                    <div className="mt-2 divide-y divide-gray-700">
                      {group.items
                        .sort((a, b) => b.ym.localeCompare(a.ym))
                        .map((p) => {
                          const contract = p.contractId
                            ? state.contracts.find((c) => c.id === p.contractId)
                            : null;
                          return (
                            <div key={p.id} className="py-2 flex items-center gap-3">
                              <div className="w-20 text-xs text-gray-400">{p.ym}</div>
                              <div className="flex-1 text-sm">
                                Net imposable : <span className="text-gray-100">{euro(p.netImposable)}</span>
                                {p.gross ? <span className="text-gray-400"> • Brut {euro(p.gross)}</span> : null}
                                {contract ? (
                                  <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-gray-300">
                                    Contrat : {contract.title}
                                  </span>
                                ) : null}
                              </div>
                              {p.fileUrl ? (
                                <a
                                  href={p.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs underline text-gray-300"
                                >
                                  {p.fileName}
                                </a>
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                              <button
                                onClick={() => removePayslip(p.id)}
                                className="p-2 rounded-lg hover:bg-gray-700"
                                title="Supprimer le bulletin"
                              >
                                <Trash2 className="w-4 h-4 text-gray-300" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
