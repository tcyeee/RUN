# RUN · 润 — 在线工具

[run.viii.me](https://run.viii.me) 的源码，[RUN · 润](../README.md) 移居手册的网页版交互工具。基于 [Astro](https://astro.build) + React + Tailwind CSS 构建，静态输出，无服务端依赖。

## 页面

| 路径 | 页面 | 组件 |
|---|---|---|
| `/` | 我该走哪条路 — 四步问答给出推荐路线 | [`src/components/Wizard.tsx`](src/components/Wizard.tsx) |
| `/routes` | 路线库 — 按类型、门槛、是否支持家属筛选所有路线 | [`src/components/RouteTable.tsx`](src/components/RouteTable.tsx) |
| `/countries` | 国家对比 — 排序 + 勾选并排对比生活成本、个税、护照等 | [`src/components/CountryCompare.tsx`](src/components/CountryCompare.tsx) |

数据来自 [`src/data/`](src/data)（programmes、countries），内容与根目录 `data/programmes.csv` 同源。

## 开发

需要 Node ≥ 22.23.4（见 `.nvmrc`，`nvm use`）。

```bash
npm install
npm run dev       # localhost:4321
npm run build     # 输出到 ./dist/
npm run preview   # 本地预览构建结果
```

## 部署

`npm run build` 产出纯静态文件，`rsync dist/` 到服务器的站点目录即可，无需重启任何服务。
