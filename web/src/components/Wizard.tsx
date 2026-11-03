import { useMemo, useState } from "react";
import {
  programmes,
  routeTypeLabel,
  type Programme,
  type RouteType,
} from "../data/programmes";
import { countries } from "../data/countries";

interface IncomeOption {
  id: string;
  icon: string;
  label: string;
  types: RouteType[];
  note?: string;
}

const incomeOptions: IncomeOption[] = [
  {
    id: "offer",
    icon: "🧑‍💻",
    label: "我有或能找到目的国雇主 offer",
    types: ["work"],
  },
  {
    id: "remote",
    icon: "💻",
    label: "我为境外公司或客户远程工作",
    types: ["digital-nomad"],
  },
  {
    id: "startup",
    icon: "🚀",
    label: "我要在目的国开公司或做自由职业",
    types: ["startup", "self-employed"],
  },
  {
    id: "invest",
    icon: "💰",
    label: "我有一笔可长期放着的钱",
    types: ["residence-by-investment"],
  },
  {
    id: "student",
    icon: "🎓",
    label: "我还是学生",
    types: ["work"],
    note: "通常是「留学 → 毕业找工作签证 → 技术移民」的多步路径，下面先给出技术工作类路线作参考。",
  },
  {
    id: "passive",
    icon: "🏖️",
    label: "我靠养老金/租金/存款生活",
    types: ["residence-by-investment", "other"],
    note: "本站路线库对纯被动收入签证（如葡萄牙 D7、西班牙 NLV）覆盖还不全，建议同时查看手册的被动收入路线页。",
  },
];

interface GoalOption {
  id: string;
  label: string;
  filter?: (p: Programme) => boolean;
  sortByTax?: boolean;
}

const goalOptions: GoalOption[] = [
  { id: "skip", label: "先随便看看，不加条件" },
  { id: "pr", label: "尽快拿永居", filter: (p) => p.pr.includes("永居") },
  {
    id: "family",
    label: "全家一起走",
    filter: (p) => p.family.includes("支持"),
  },
  { id: "lowtax", label: "尽量低税", sortByTax: true },
];

const passportExclusions = [
  { route: "捷克数字游民签证", reason: "国籍名单不含中国大陆" },
  { route: "日本数字游民签证", reason: "需对日免签 + 税收协定国" },
  { route: "拉脱维亚远程工作签证", reason: "雇主须在 OECD 国家（中国公司不行）" },
  { route: "黑山 70g 投资居留", reason: "仅限欧盟公民" },
  { route: "巴拿马友好国家签证", reason: "中国不在名单" },
  { route: "美国 E-2 条约投资者", reason: "中美无相关条约" },
  { route: "荷兰/美国友好条约路线", reason: "仅限美国（及日本条约路线）" },
];

const checklist = [
  "我的收入/资金是否稳定超过门槛 20% 以上？（汇率和年度调整会吃掉余量）",
  "收入证明能否覆盖要求的 3–6 个月？",
  "学历、无犯罪、婚姻、出生文件能否在 1–2 个月内办好公证和附加证明书？",
  "我是否理解了税务居民和社保后果？",
  "这条路线到期后能续、能转、还是必须离开？",
  "我是否核对了官方页面而不是只看中介或本手册？",
];

const taxBySlug = new Map(countries.map((c) => [c.slug, c.tax]));

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState<IncomeOption | null>(null);
  const [goal, setGoal] = useState<GoalOption | null>(null);

  const results = useMemo(() => {
    if (!income) return [];
    let list = programmes.filter(
      (p) => p.status === "open" && income.types.includes(p.route_type),
    );
    if (goal?.filter) list = list.filter(goal.filter);
    if (goal?.sortByTax) {
      list = [...list].sort((a, b) => {
        const ta = taxBySlug.get(a.country_slug) ?? Infinity;
        const tb = taxBySlug.get(b.country_slug) ?? Infinity;
        return (ta ?? Infinity) - (tb ?? Infinity);
      });
    }
    return list;
  }, [income, goal]);

  function restart() {
    setStep(0);
    setIncome(null);
    setGoal(null);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {step === 0 && (
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            第一步：你的收入从哪来？
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            这决定了你适合哪一大类移民路线。
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {incomeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setIncome(opt);
                  setStep(1);
                }}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/40"
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm text-slate-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && income && (
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            第二步：你的目标是什么？
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            已选：{income.icon} {income.label}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {goalOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setGoal(opt);
                  setStep(2);
                }}
                className="rounded-lg border border-slate-200 p-4 text-left text-sm text-slate-700 transition hover:border-teal-400 hover:bg-teal-50/40"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(0)}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600"
          >
            ← 上一步
          </button>
        </div>
      )}

      {step === 2 && income && (
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            匹配到 {results.length} 条路线
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            {income.icon} {income.label} · {goal?.label}
          </p>

          {income.note && (
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              {income.note}
            </p>
          )}

          <div className="mb-6 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {results.length === 0 && (
              <p className="p-4 text-sm text-slate-500">
                没有匹配结果，试试换一个目标，或直接去路线库看全部。
              </p>
            )}
            {results.slice(0, 20).map((p) => (
              <div
                key={p.slug}
                className="flex items-center justify-between gap-3 p-3 text-sm"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {p.country}
                  </span>
                  <span className="ml-2 text-slate-500">{p.programme}</span>
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {routeTypeLabel[p.route_type]}
                  </span>
                </div>
                <a
                  href={p.letsmigrate}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-teal-600 hover:underline"
                >
                  详情 →
                </a>
              </div>
            ))}
          </div>

          <details className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-amber-800">
              ⚠️ 中国大陆护照常见排除路线（不代表以上结果，仅作提醒）
            </summary>
            <ul className="mt-2 space-y-1 text-amber-700">
              {passportExclusions.map((x) => (
                <li key={x.route}>
                  <span className="font-medium">{x.route}</span> — {x.reason}
                </li>
              ))}
            </ul>
          </details>

          <details className="mb-4 rounded-lg border border-slate-200 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-700">
              ✅ 决定前的自检清单
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              {checklist.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </details>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              ← 换个目标
            </button>
            <button
              onClick={restart}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              重新开始
            </button>
            <a
              href="/routes"
              className="ml-auto text-sm font-medium text-teal-600 hover:underline"
            >
              去路线库看全部 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
