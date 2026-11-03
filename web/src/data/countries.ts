import raw from "../../../data/country_profiles.json";

export interface CountryProfile {
  slug: string;
  name: string;
  col: number | null;
  rent: number | null;
  safety: number | null;
  tax: number | null;
  salary: number | null;
  passport: number | null;
  pr: string;
  cit: string;
  dual: string;
  lang: string;
  entry: string;
}

const countrySlugToName: Record<string, string> = {
  albania: "阿尔巴尼亚",
  andorra: "安道尔",
  austria: "奥地利",
  belgium: "比利时",
  bulgaria: "保加利亚",
  croatia: "克罗地亚",
  cyprus: "塞浦路斯",
  czechia: "捷克",
  denmark: "丹麦",
  estonia: "爱沙尼亚",
  finland: "芬兰",
  france: "法国",
  germany: "德国",
  greece: "希腊",
  hungary: "匈牙利",
  iceland: "冰岛",
  ireland: "爱尔兰",
  italy: "意大利",
  latvia: "拉脱维亚",
  liechtenstein: "列支敦士登",
  lithuania: "立陶宛",
  luxembourg: "卢森堡",
  malta: "马耳他",
  montenegro: "黑山",
  netherlands: "荷兰",
  norway: "挪威",
  poland: "波兰",
  portugal: "葡萄牙",
  romania: "罗马尼亚",
  slovakia: "斯洛伐克",
  slovenia: "斯洛文尼亚",
  spain: "西班牙",
  sweden: "瑞典",
  switzerland: "瑞士",
  turkiye: "土耳其",
  "united-kingdom": "英国",
};

const { _meta, ...rest } = raw as Record<string, any>;

export const countries: CountryProfile[] = Object.entries(rest).map(
  ([slug, v]) => ({
    slug,
    name: countrySlugToName[slug] ?? slug,
    ...v,
  }),
);

export const countryMeta = _meta;
