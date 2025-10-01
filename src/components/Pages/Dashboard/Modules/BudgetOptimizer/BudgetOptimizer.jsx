import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';

const STORAGE_KEY_V3 = 'budgetOptimizer:v3';
const STORAGE_KEY_V2 = 'budgetOptimizer:v2';
const STORAGE_KEY_V1 = 'budgetOptimizer:v1';

const euro = (n) =>
  (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

// --- État par défaut (v3)
const defaultStateV3 = {
  income: 2500,
  goalMode: 'percent', // 'percent' | 'amount'
  goalPct: 20,
  goalAmount: 0,
  fixed: [
    { id: 'loyer',       label: 'Loyer / Crédit', value: 900 },
    { id: 'assurances',  label: 'Assurances',     value: 70  },
    { id: 'energie',     label: 'Énergie (élec/gaz/eau)', value: 120 },
    { id: 'impots',      label: 'Impôts mensuels', value: 0  },
  ],
  // v3: abonnements détaillés avec périodicité
  subscriptions: [
    // { id, name, value, period: 'monthly' | 'yearly' }
  ],
  variable: [
    { id: 'courses',     label: 'Courses',        value: 300 },
    { id: 'transport',   label: 'Transport',      value: 80  },
    { id: 'restos',      label: 'Restaurants',    value: 120 },
    { id: 'shopping',    label: 'Shopping',       value: 100 },
    { id: 'loisirs',     label: 'Loisirs',        value: 80  },
    { id: 'divers',      label: 'Divers',         value: 50  },
  ],
};

// --- Migrations
function migrateV1ToV2(v1) {
  if (!v1 || typeof v1 !== 'object') return null;
  const { income = 2500, goalPct = 20, fixed = [], variable = [] } = v1;
  const abonnementsRow = fixed.find((r) => r.id === 'abonnements');
  const fixedSansAbos = fixed.filter((r) => r.id !== 'abonnements');

  const subscriptions = [];
  if (abonnementsRow && Number(abonnementsRow.value) > 0) {
    subscriptions.push({
      id: genId(),
      name: 'Abonnement 1',
      value: Number(abonnementsRow.value) || 0,
    });
  }

  return {
    income: Number(income) || 0,
    goalMode: 'percent',
    goalPct: Number(goalPct) || 0,
    goalAmount: 0,
    fixed: fixedSansAbos.map((r) => ({ ...r, value: Number(r.value) || 0 })),
    subscriptions,
    variable: variable.map((r) => ({ ...r, value: Number(r.value) || 0 })),
  };
}

function migrateV2ToV3(v2) {
  if (!v2 || typeof v2 !== 'object') return null;
  return {
    ...defaultStateV3,
    ...v2,
    goalMode: v2.goalMode ?? 'percent',
    goalPct: Number(v2.goalPct ?? 20) || 0,
    goalAmount: Number(v2.goalAmount ?? 0) || 0,
    subscriptions: (v2.subscriptions || []).map((s) => ({
      id: s.id ?? genId(),
      name: s.name ?? '',
      value: Number(s.value) || 0,
      period: s.period === 'yearly' ? 'yearly' : 'monthly',
    })),
  };
}

function genId() {
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function BudgetOptimizer() {
  const navigate = useNavigate();

  const [state, setState] = useState(() => {
    // v3 direct ?
    try {
      const rawV3 = localStorage.getItem(STORAGE_KEY_V3);
      if (rawV3) return JSON.parse(rawV3);
    } catch {}

    // sinon v2 -> v3
    try {
      const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (rawV2) {
        const v2 = JSON.parse(rawV2);
        const v3 = migrateV2ToV3(v2);
        localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(v3));
        return v3;
      }
    } catch {}

    // sinon v1 -> v2 -> v3
    try {
      const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
      if (rawV1) {
        const v1 = JSON.parse(rawV1);
        const v2 = migrateV1ToV2(v1) || defaultStateV3;
        const v3 = migrateV2ToV3(v2) || defaultStateV3;
        localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(v3));
        return v3;
      }
    } catch {}

    return defaultStateV3;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(state));
  }, [state]);

  // --- Totaux
  const subsMonthlyTotal = useMemo(
    () =>
      state.subscriptions.reduce((sum, s) => {
        const val = Number(s.value) || 0;
        const factor = s.period === 'yearly' ? 1 / 12 : 1; // prorata mensuel
        return sum + val * factor;
      }, 0),
    [state.subscriptions]
  );

  const fixedCoreTotal = useMemo(
    () => state.fixed.reduce((s, r) => s + (Number(r.value) || 0), 0),
    [state.fixed]
  );

  const fixedTotal    = fixedCoreTotal + subsMonthlyTotal;
  const variableTotal = useMemo(
    () => state.variable.reduce((s, r) => s + (Number(r.value) || 0), 0),
    [state.variable]
  );

  const income        = Number(state.income) || 0;

  // --- Objectif d’épargne
  const goalSave = useMemo(() => {
    if (state.goalMode === 'amount') {
      return Math.max(0, Math.round(Number(state.goalAmount) || 0));
    }
    const pct = Math.min(100, Math.max(0, Number(state.goalPct) || 0));
    return Math.max(0, Math.round((income * pct) / 100));
  }, [state.goalMode, state.goalAmount, state.goalPct, income]);

  const currentSave   = Math.max(0, income - fixedTotal - variableTotal);
  const delta         = goalSave - currentSave;

  // Suggestions variables
  const variableSorted = useMemo(
    () => [...state.variable].sort((a, b) => (b.value || 0) - (a.value || 0)),
    [state.variable]
  );

  const suggestedVariable = useMemo(() => {
    if (delta <= 0) return state.variable;
    let remain = delta;
    return state.variable.map((row) => {
      if (remain <= 0) return row;
      const reduce = Math.min(remain, Math.round((row.value || 0) * 0.3));
      remain -= reduce;
      return { ...row, value: Math.max(0, (row.value || 0) - reduce) };
    });
  }, [state.variable, delta]);

  const suggestedVariableTotal = suggestedVariable.reduce((s, r) => s + (Number(r.value) || 0), 0);

  const chartData = [
    { name: 'Actuel',    Fixes: fixedTotal, Variables: variableTotal, Epargne: currentSave },
    { name: 'Cible',     Fixes: fixedTotal, Variables: Math.max(0, suggestedVariableTotal), Epargne: goalSave },
  ];

  // --- Setters
  const setIncome       = (v) => setState(s => ({ ...s, income: Number(v) || 0 }));
  const setGoalPct      = (v) => setState(s => ({ ...s, goalPct: Number(v) || 0 }));
  const setGoalAmount   = (v) => setState(s => ({ ...s, goalAmount: Number(v) || 0 }));
  const setGoalMode     = (mode) => setState(s => ({ ...s, goalMode: mode === 'amount' ? 'amount' : 'percent' }));

  const setRow = (kind, id, value) =>
    setState(s => ({ ...s, [kind]: s[kind].map(r => r.id === id ? { ...r, value: Number(value) || 0 } : r) }));

  const reset = () => setState(defaultStateV3);

  // --- Actions abonnements
  const addSubscription = () =>
    setState(s => ({
      ...s,
      subscriptions: [...s.subscriptions, { id: genId(), name: '', value: 0, period: 'monthly' }],
    }));

  const removeSubscription = (id) =>
    setState(s => ({
      ...s,
      subscriptions: s.subscriptions.filter(sub => sub.id !== id),
    }));

  const setSubscriptionName = (id, name) =>
    setState(s => ({
      ...s,
      subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, name } : sub),
    }));

  const setSubscriptionValue = (id, value) =>
    setState(s => ({
      ...s,
      subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, value: Number(value) || 0 } : sub),
    }));

  const setSubscriptionPeriod = (id, period) =>
    setState(s => ({
      ...s,
      subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, period: (period === 'yearly' ? 'yearly' : 'monthly') } : sub),
    }));

  return (
    <main className="min-h-screen bg-noir-780 text-gray-100">
      <div className="mx-auto max-w-3xl p-4 md:px-6 md:py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full border border-gray-700 bg-gray-900 hover:bg-gray-800 transition"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-greenLight" />
          </button>
          <h1 className="text-2xl font-bold text-white">Optimiseur d’épargne</h1>
        </header>

        {/* Inputs principaux */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Salaire net mensuel"
              suffix="€"
              value={state.income}
              onChange={setIncome}
            />

            {/* Mode d’objectif */}
            <div>
              <div className="text-xs text-gray-400 mb-1">Mode d’objectif d’épargne</div>
              <Segmented
                value={state.goalMode}
                onChange={setGoalMode}
                options={[
                  { value: 'percent', label: '% du salaire' },
                  { value: 'amount',  label: 'Montant fixe' },
                ]}
              />
            </div>
          </div>

          {/* Contrôle selon le mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.goalMode === 'percent' ? (
              <Field
                label="Objectif d’épargne"
                suffix="% du salaire"
                type="range"
                min={0}
                max={60}
                step={1}
                value={state.goalPct}
                onChange={setGoalPct}
                renderValue={() => <span className="text-sm text-gray-300">{state.goalPct}%</span>}
              />
            ) : (
              <Field
                label="Objectif d’épargne (montant fixe)"
                suffix="€ / mois"
                type="number"
                min={0}
                step={10}
                value={state.goalAmount}
                onChange={setGoalAmount}
              />
            )}

            <Summary
              income={income}
              fixed={fixedTotal}
              variable={variableTotal}
              currentSave={currentSave}
              goalSave={goalSave}
              delta={delta}
            />
          </div>
        </section>

        {/* Graphique de répartition */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
          <h3 className="text-white font-semibold mb-3">Comparaison actuelle vs cible</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, Math.max(income, fixedTotal + variableTotal, goalSave + fixedTotal)]} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }}
                  formatter={(v) => euro(v)}
                />
                <Legend />
                <Bar dataKey="Fixes"     stackId="a" fill="#2e8e97" />
                <Bar dataKey="Variables" stackId="a" fill="#bdced3" />
                <Bar dataKey="Epargne"   stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Tableaux éditables */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableTable
            title="Frais fixes (hors abonnements)"
            rows={state.fixed}
            onChange={(id, v) => setRow('fixed', id, v)}
          />

          <SubscriptionsTable
            title="Abonnements (détail)"
            subscriptions={state.subscriptions}
            onAdd={addSubscription}
            onRemove={removeSubscription}
            onName={setSubscriptionName}
            onValue={setSubscriptionValue}
            onPeriod={setSubscriptionPeriod}
          />
        </section>

        {/* Dépenses variables & Pistes d’économies */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableTable
            title="Dépenses variables"
            rows={state.variable}
            onChange={(id, v) => setRow('variable', id, v)}
            hint={delta > 0 ? `À réduire d’environ ${euro(delta)}` : undefined}
          />

          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 space-y-2">
            <h3 className="text-white font-semibold">Pistes d’économies</h3>
            {delta <= 0 ? (
              <p className="text-sm text-green-400">
                Objectif atteint 🎉 Vous épargnez {euro(currentSave)} / {euro(goalSave)}.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-300">
                  Il manque <span className="text-white font-semibold">{euro(delta)}</span> pour atteindre l’objectif d’épargne.
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                  {variableSorted.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      Réduire <span className="font-medium text-white">{r.label}</span> de ~{Math.round(Math.min(30, (delta / (r.value || 1)) * 100))}%.
                    </li>
                  ))}
                  <li>Renégocier assurance / énergie si possible.</li>
                  <li>Passer en annuel certains abonnements pour profiter d’une remise (total en prorata inclus).</li>
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700 transition"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </div>
    </main>
  );
}

/* -------------------- Sous-composants -------------------- */

function Field({
  label, value, onChange, suffix, type = 'number', min, max, step, renderValue,
}) {
  return (
    <label className="block">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
        <input
          type={type}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-100"
        />
        {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
        {renderValue && renderValue()}
      </div>
    </label>
  );
}

function Summary({ income, fixed, variable, currentSave, goalSave, delta }) {
  const rows = [
    ['Salaire net', income],
    ['Frais fixes', fixed],
    ['Dépenses variables', variable],
    ['Épargne actuelle', currentSave],
    ['Épargne cible', goalSave],
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2">
          <div className="text-xs text-gray-400">{k}</div>
          <div className="text-sm text-white mt-0.5">{euro(v)}</div>
        </div>
      ))}
      <div className="col-span-2 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2">
        <div className="text-xs text-gray-400">Écart à combler</div>
        <div className={`text-sm mt-0.5 ${delta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {delta <= 0 ? '0 € (objectif atteint)' : euro(delta)}
        </div>
      </div>
    </div>
  );
}

function EditableTable({ title, rows, onChange, hint }) {
  const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0);
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">{title}</h3>
        <div className="text-xs text-gray-400">Total: <span className="text-gray-200">{euro(total)}</span></div>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2">
            <div className="text-sm text-gray-100">{r.label}</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={r.value}
                onChange={(e) => onChange(r.id, e.target.value)}
                className="w-28 bg-transparent outline-none text-right text-gray-100"
              />
              <span className="text-gray-400 text-sm">€</span>
            </div>
          </div>
        ))}
      </div>
      {hint && <div className="mt-2 text-xs text-amber-300">{hint}</div>}
    </section>
  );
}

// Segmented control
function Segmented({ value, onChange, options }) {
  return (
    <div className="flex p-1 bg-gray-800 border border-gray-700 rounded-xl w-full">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition
              ${active ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
            type="button"
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ===== Table abonnements + Toggle pill ===== */
function SubscriptionsTable({ title, subscriptions, onAdd, onRemove, onName, onValue, onPeriod }) {
  const monthlyTotal = subscriptions.reduce(
    (s, r) => s + (Number(r.value) || 0) * (r.period === 'yearly' ? 1/12 : 1),
    0
  );

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3 sm:p-4">
      {/* Header compact mobile */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 active:scale-95 transition"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>
      <div className="text-[11px] text-gray-400 mb-3">
        Total (équivalent mois) : <span className="text-gray-200 font-medium">{euro(monthlyTotal)}</span>
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-sm text-gray-400">
          Ajoute tes abonnements (ex. Netflix). Saisis le <span className="text-gray-200">montant</span> puis choisis
          <span className="text-gray-200"> Mensuel</span> ou <span className="text-gray-200">Annuel</span>.
        </p>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub, i) => {
            const isYearly = sub.period === 'yearly';
            const monthly = (Number(sub.value) || 0) * (isYearly ? 1/12 : 1);

            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-gray-800/70 border border-gray-700 p-3"
              >
                {/* Ligne 1: Nom */}
                <input
                  type="text"
                  placeholder="Nom de l’abonnement"
                  value={sub.name}
                  onChange={(e) => onName(sub.id, e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-[11px] text-gray-100 placeholder-gray-500 outline-none focus:border-gray-500"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  {...(i === subscriptions.length - 1 && sub.name === '' ? { autoFocus: true } : {})}
                />

                {/* Ligne 2: Montant + Période + Delete */}
                <div className="mt-2 flex items-stretch gap-2">
                  {/* Montant */}
                  <div className="flex items-center gap-2 flex-[0_0_46%]">
                    <input
                      type="number"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      step="0.01"
                      min="0"
                      value={sub.value}
                      onChange={(e) => onValue(sub.id, e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-[11px] text-right text-gray-100 outline-none focus:border-gray-500"
                    />
                    <span className="text-gray-400 text-sm pr-1">€</span>
                  </div>

                  {/* Toggle période */}
                  <div className="flex-1">
                    <PeriodToggle
                      value={sub.period || 'monthly'}
                      onChange={(val) => onPeriod(sub.id, val)}
                      ariaLabel="Périodicité"
                    />
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={() => onRemove(sub.id)}
                    className="flex items-center justify-center w-11 rounded-xl border border-gray-700 bg-gray-900/60 text-gray-300 active:scale-95 hover:bg-gray-800"
                    type="button"
                    aria-label={`Supprimer ${sub.name || 'abonnement'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Ligne 3: Badge info */}
                <div className="mt-2">
                  {isYearly ? (
                    <span className="inline-flex text-[11px] px-2 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-300">
                      ≈ {euro(monthly)} / mois (prorata de {euro(sub.value)} / an)
                    </span>
                  ) : (
                    <span className="inline-flex text-[11px] px-2 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">
                      {euro(sub.value)} / mois
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/** Toggle “Mensuel / Annuel” — mobile first, gros touch targets */
function PeriodToggle({ value = 'monthly', onChange, ariaLabel }) {
  const isMonthly = value !== 'yearly';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex w-full h-[42px] bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden"
    >
      <button
        role="radio"
        aria-checked={isMonthly}
        onClick={() => onChange('monthly')}
        type="button"
        className={`flex-1 text-sm font-medium transition
          ${isMonthly ? 'bg-gray-700 text-white' : 'text-gray-300 active:bg-gray-800'}
        `}
      >
        <div className="flex items-center justify-center h-full">Mensuel</div>
      </button>
      <button
        role="radio"
        aria-checked={!isMonthly}
        onClick={() => onChange('yearly')}
        type="button"
        className={`flex-1 text-sm font-medium transition
          ${!isMonthly ? 'bg-gray-700 text-white' : 'text-gray-300 active:bg-gray-800'}
        `}
      >
        <div className="flex items-center justify-center h-full">Annuel</div>
      </button>
    </div>
  );
}
