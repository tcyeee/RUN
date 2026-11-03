import raw from "../../../data/programmes.json";

export type RouteType =
  | "digital-nomad"
  | "residence-by-investment"
  | "work"
  | "self-employed"
  | "startup"
  | "citizenship"
  | "passive"
  | "other";

export interface Source {
  title: string;
  url: string;
}

export interface Programme {
  country: string;
  country_slug: string;
  programme: string;
  slug: string;
  route_type: RouteType;
  audience: string;
  family: string;
  pr: string;
  threshold: string;
  verified: string;
  overview: string;
  letsmigrate: string;
  sources: Source[];
  status: "open" | "closed";
}

export const programmes = raw as Programme[];

export const routeTypeLabel: Record<RouteType, string> = {
  "digital-nomad": "数字游民",
  "residence-by-investment": "投资居留",
  work: "技术工作",
  "self-employed": "自雇",
  startup: "创业",
  citizenship: "入籍",
  passive: "被动收入居留",
  other: "其他",
};

export const routeTypes = Object.keys(routeTypeLabel) as RouteType[];
