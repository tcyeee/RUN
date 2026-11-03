"""把 src/global.json（已有的 13 个海外目的地结构化数据）接入 web 工具。

输入：
  src/global.json              13 个海外目的地的路线数据（与 docs/global/*.md 同源）
  scripts/build_docs.py        GLOBAL_PROFILE 数值表（Numbeo/Henley，与 docs/global 生成逻辑一致）
输出：
  data/country_profiles.json   追加 15 个国家条目（拉美拆成墨西哥/巴拿马/阿根廷三国，因为地图要落到具体国家）
  data/programmes.json         追加这些国家的路线条目
用法：python3 scripts/sync_global_to_web.py
"""
import json
import os
import re

RUN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = "https://github.com/tcyeee/RUN/blob/main"

GLOBAL = json.load(open(os.path.join(RUN, "src", "global.json")))

# Numbeo 2026 年中生活成本/房租/安全指数、Henley 2026 护照免签数，与
# scripts/build_docs.py 的 GLOBAL_PROFILE 保持一致（同一批调研数据）。
GLOBAL_PROFILE = {
    "usa": (69.7, 37.1, 50.8, 179),
    "canada": (61.3, 29.1, 54.4, 181),
    "australia": (71.4, 33.1, 52.6, 182),
    "new-zealand": (60.2, 24.6, 51.2, 183),
    "japan": (47.6, 13.6, 77.8, 188),
    "south-korea": (56.7, 13.6, 70.3, 188),
    "singapore": (90.8, 68.3, 77.7, 192),
    "hong-kong": (76.4, 59.1, 78.2, 171),
    "philippines": (29.1, 7.2, 56.6, 64),
    "thailand": (36.8, 12.8, 63.6, 79),
    "malaysia": (34.0, 8.5, 52.0, 180),
    "uae": (55.6, 36.3, 86.4, 184),
    "mexico": (44.4, 17.1, 47.3, 157),  # latin-america 条目"以墨西哥为例"的数字
}

# 手动核对的 pr/cit/dual/lang/entry —— 比欧洲篇浅，标注依据 kv 字段 + 公开资料，
# 数字类字段（tax/salary）暂缺就留 null，不编造。
COUNTRY_META = {
    "usa": dict(pr="因排期而异（EB 类别数年至十余年）", cit="绿卡 5 年",
                dual="✅", lang="多数路线无强制语言要求",
                entry="需办理 B1/B2 签证（不适用 ESTA 免签）"),
    "canada": dict(pr="Express Entry 获邀后约 6 个月", cit="5 年内住满 1,095 天",
                   dual="✅", lang="雅思/CELPIP 等语言成绩计分",
                   entry="需办理访问签证"),
    "australia": dict(pr="189/858 直接永居；482 需转 186", cit="住满 4 年（含永居满 1 年）",
                       dual="✅", lang="雅思 6-7 分（按签证类别）",
                       entry="需办理签证"),
    "new-zealand": dict(pr="SMC 获邀后数月；AIP 最快 21 天", cit="通常住满 5 年",
                         dual="✅", lang="雅思约 6.5（AIP 2025 起免语言）",
                         entry="需办理签证"),
    "japan": dict(pr="高度人才最快 1 年（80 分）", cit="原则住满 5 年，且须放弃原国籍",
                  dual="❌", lang="N2/B2（经营管理签证要求）",
                  entry="需办理签证"),
    "south-korea": dict(pr="Top-Tier 3 年；F-2-7 积分制", cit="一般住满 5 年",
                        dual="⚠️", lang="多数路线无强制韩语要求",
                        entry="需办理签证"),
    "singapore": dict(pr="酌情审批，无固定年限", cit="通常需持有 PR 2 年以上",
                      dual="❌", lang="无强制语言要求",
                      entry="免签 30 天（2024 起）"),
    "hong-kong": dict(pr="通常居住连续 7 年", cit="非国籍，是居留权；不涉及放弃原国籍",
                      dual="⚠️", lang="无强制语言要求（粤语/英语为工作语言）",
                      entry="大陆居民需办理港澳通行证"),
    "philippines": dict(pr="SRRV/SIRV 为长期居留，非永久居民身份", cit="一般住满 10 年（较少见）",
                        dual="⚠️", lang="英语为官方语言之一，无强制要求",
                        entry="免签 30 天"),
    "thailand": dict(pr="DTV/LTR 均不直接导向永居", cit="一般住满 5 年（审批严格，少见）",
                     dual="⚠️", lang="无强制泰语要求",
                     entry="免签 60 天"),
    "malaysia": dict(pr="MM2H 不直接导向永居，需另申请", cit="一般住满 7 年（审批严格）",
                     dual="❌", lang="无强制语言要求",
                     entry="免签 30 天"),
    "uae": dict(pr="黄金签证为长期居留，非永居/入籍路径", cit="几乎不可能（需特殊贡献+酌情审批）",
               dual="❌", lang="无强制语言要求",
               entry="免签"),
    "mexico": dict(pr="临时居留满 4 年可转永居", cit="一般住满 5 年（已婚或有墨籍子女 2 年）",
                   dual="✅", lang="无强制西语要求（移民局面谈用西语）",
                   entry="普通护照需办理签证"),
    "panama": dict(pr="合格投资者居留可转永居", cit="一般住满 5 年",
                  dual="✅", lang="无强制西语要求",
                  entry="普通护照需办理签证（不在友好国家名单）"),
    "argentina": dict(pr="数字游民签证不导向永居", cit="一般住满 2 年",
                      dual="✅", lang="无强制西语要求",
                      entry="普通护照需办理签证"),
}

CHINESE_NAME = {
    "usa": "美国", "canada": "加拿大", "australia": "澳大利亚", "new-zealand": "新西兰",
    "japan": "日本", "south-korea": "韩国", "singapore": "新加坡", "hong-kong": "香港",
    "philippines": "菲律宾", "thailand": "泰国", "malaysia": "马来西亚", "uae": "阿联酋",
    "mexico": "墨西哥", "panama": "巴拿马", "argentina": "阿根廷",
}

# latin-america 这一篇实际讲的是三个不同国家的路线；地图要落到具体国家上，
# 所以按路线 id 前缀拆成三个国家 slug。
LATIN_AMERICA_COUNTRY_BY_PREFIX = {"mx": "mexico", "pa": "panama", "ar": "argentina"}


def strip_flag(name):
    return re.sub(r"^\S+\s+", "", name) if re.match(r"^\S+\s", name) else name


def build_profiles():
    profiles = {}
    for slug in CHINESE_NAME:
        col = rent = safety = passport = None
        if slug in GLOBAL_PROFILE:
            col, rent, safety, passport = GLOBAL_PROFILE[slug]
        meta = COUNTRY_META[slug]
        profiles[slug] = {
            "col": col, "rent": rent, "safety": safety,
            "tax": None, "salary": None, "passport": passport,
            **meta,
        }
    return profiles


def route_doc_anchor(country_slug, route_id):
    doc_slug = "latin-america" if country_slug in ("mexico", "panama", "argentina") else country_slug
    return f"{REPO}/docs/global/{doc_slug}.md#{route_id}"


def build_programmes():
    out = []
    for g in GLOBAL:
        sources = [{"title": t, "url": u} for t, u in g.get("links", [])]
        for r in g["routes"]:
            if g["slug"] == "latin-america":
                prefix = r["id"].split("-")[0]
                country_slug = LATIN_AMERICA_COUNTRY_BY_PREFIX[prefix]
            else:
                country_slug = g["slug"]
            country_name = CHINESE_NAME[country_slug]
            programme_name = strip_flag(r["name"]) if g["slug"] == "latin-america" else r["name"]

            facts = r.get("facts", [])
            family_fact = next((v for k, v in facts if "家属" in k or "家庭" in k), None)
            family = f"支持家属（{family_fact}）" if family_fact else ""

            out.append({
                "country": country_name,
                "country_slug": country_slug,
                "programme": programme_name,
                "slug": r["id"],
                "route_type": r["type"],
                "audience": "、".join(r.get("fit", [])),
                "family": family,
                "pr": COUNTRY_META[country_slug]["pr"],
                "threshold": facts[0][1] if facts else "",
                "verified": "2026-10",
                "overview": r.get("summary", ""),
                "letsmigrate": route_doc_anchor(country_slug, r["id"]),
                "sources": sources,
                "status": r.get("status", "open"),
            })
    return out


def append_profiles(profiles_path, new_profiles):
    """country_profiles.json is hand-formatted as one compact line per country
    (with column-aligned padding); json.dump would reformat every existing
    line. Insert new lines as text instead so the diff stays additive."""
    text = open(profiles_path).read()
    existing = json.loads(text)
    added = {s: p for s, p in new_profiles.items() if s not in existing}
    if not added:
        return []

    body = text.rstrip("\n")
    assert body.endswith("}"), "unexpected country_profiles.json format"
    body = body[: -len("}")].rstrip("\n")
    assert body.endswith("}"), "unexpected country_profiles.json format"

    new_lines = ",\n".join(
        f' "{slug}": {json.dumps(entry, ensure_ascii=False)}'
        for slug, entry in added.items()
    )
    open(profiles_path, "w").write(f"{body},\n{new_lines}\n}}\n")
    return list(added)


def main():
    profiles_path = os.path.join(RUN, "data", "country_profiles.json")
    programmes_path = os.path.join(RUN, "data", "programmes.json")

    added_profiles = append_profiles(profiles_path, build_profiles())

    programmes = json.load(open(programmes_path))
    existing_slugs = {p["slug"] for p in programmes}
    new_programmes = [p for p in build_programmes() if p["slug"] not in existing_slugs]
    programmes.extend(new_programmes)

    # programmes.json is hand-formatted with 1-space indent, one key per line;
    # json.dump with indent=1 reproduces that style for unchanged entries too.
    json.dump(programmes, open(programmes_path, "w"), ensure_ascii=False, indent=1)
    open(programmes_path, "a").write("\n")

    print(f"country_profiles.json: +{len(added_profiles)} countries ({', '.join(added_profiles)})")
    print(f"programmes.json: +{len(new_programmes)} routes")


if __name__ == "__main__":
    main()
