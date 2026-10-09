---
name: collage-code-motion
description: 用代码做快切拼贴风动效短片（撕纸、半调网点、照片拼贴、emoji 贴纸、立体大字、节拍音轨），可选左侧"实时代码面板 + 右侧成片"的展示布局，输出 MP4。Use when the user wants a collage / zine-style motion piece, a product or brand promo animation, a "Claude Motion"-style video where the film is written in code, or to remake/iterate such a video shot by shot.
---

# collage-code-motion

把一个品牌 / 产品 / 主题做成 10–20 秒的拼贴风快切动效片。整条片子是一个 HTML Canvas 程序：
每个镜头是一个 `draw(g, l, f)` 函数，Playwright 逐帧截图，ffmpeg 合成，`audio.py` 按时间线合成节拍音轨。
用户当艺术总监，你负责从分镜到成片，并按反馈逐个镜头修改。

两种布局（`CONFIG.layout`）：
- `showcase` — 1920×1080：左边是会自己打字、高亮当前行、连线到画面的"代码面板"，右边是 1000×1000 成片。适合"用代码做视频"类的展示内容。
- `film` — 1080×1080 纯成片，适合直接投放。

## 目录

```
engine/      core.js（画布/缓动/纹理/拼贴工具/程序化球鞋和眼睛）· presets.js（12 个现成镜头）· engine.js（合成、转场、代码面板、渲染入口）
scripts/     build.py · render.js · audio.py · prep_assets.py · preview.sh · make_video.sh · contact_sheet.sh
template/    最小起手项目（6 个镜头，演示文字覆盖和换主角）
examples/jump-vol01/   完整示例：27 个镜头、15 秒、120 BPM，含 CC0 照片素材
references/  api.md（全部函数与预设参数）· shot-grammar.md（节奏与画面规则）· assets.md（素材来源、处理、授权）
```

一个项目 = 一个文件夹：`config.js` + `timeline.js` + `assets/`。引擎文件不用改。

## 环境

需要 Node 18+、`playwright`（含 Chromium）、Python 3 + `numpy pillow`、`ffmpeg`。
在 skill 目录跑 `npm install && npx playwright install chromium`（已有 Chromium 时可设 `CHROMIUM_PATH`）。
字体：展示字体默认找 Inter Display / Inter / Archivo Black，中文找 Noto Sans CJK / PingFang，等宽找 JetBrains Mono / DejaVu Sans Mono，emoji 找 Noto Color Emoji / Apple Color Emoji。先用 `fc-list`（Linux）确认；缺字体时在 `CONFIG.fonts` 里换成系统已有的，不然中文和 emoji 会变成方块。

## 工作流程

1. **定方向（问一次就够）**：主题 / 品牌名、时长（默认 15 秒）、布局（showcase 或 film）、语言、主色、有没有自己的素材（产品图、AI 生成图）。用户没说的就用默认值开工，在回复里说明你选了什么。
2. **建项目**：复制 `template/` 到工作目录（例如 `projects/<brand>/`），改 `config.js` 的 brand、project、file、badge、palette、assets。
3. **备素材**：拼贴的丰富度来自真实图片。按 `references/assets.md`：
   - 用户提供的图或 AI 生成的图 → `python3 scripts/prep_assets.py img.jpg --out <proj>/assets --name hero --treat color duotone:#2a0a12:#FF8FB1 halftone bw circle cutout`
   - 没有图时用 CC0 / 公有领域图（scikit-image 自带的样图、NASA 照片），加上 emoji 贴纸和程序化图形。不要用来源或授权不明的网图，也不要用可识别的真人照片做广告。
   - 每个处理后的文件都要加进 `CONFIG.assets`，代码里用 `IMG['<文件名去掉扩展名>']` 引用。
4. **写分镜 → timeline.js**：先按 `references/shot-grammar.md` 列出镜头表（名字、帧数、画面一句话），再写代码。复用预设用 `preset(name, k, {文字覆盖})`；新镜头直接用 core 里的工具函数画（参考 `examples/jump-vol01/timeline.js`）。每个镜头写 1–3 行 `lines`，它们就是代码面板上显示的"代码"。
5. **抽帧检查**：`bash scripts/preview.sh <proj> "6,20,44,..."`，然后**一定要用 Read 工具看生成的 sheet 图**。重点检查：文字被裁切或互相压住、主体出画、时间码挡住字、图片发糊、颜色撞色。改完再抽帧看一遍。
6. **出片**：`bash scripts/make_video.sh <proj> <proj>/out.mp4`。15 秒、1080p 大约 1–2 分钟。完成后看自动生成的 `_sheet.jpg`，确认整条片子的节奏。
7. **交付和迭代**：把 MP4 发给用户（如果需要源码，就把项目文件夹打成 zip 一起给）。用户说"第 N 个镜头慢一点 / 换颜色 / 换文案"，就改对应镜头的 `dur`、`k`、颜色或 opts，重新出片。

## 关键规则（来自实际反馈）

- **节奏比你想的要快**：120 BPM，镜头时长取 6 / 12 / 18 帧（24 fps）。除了结尾，没有超过 18 帧的镜头。每个镜头里每 2–4 帧都要有新元素进场。30 帧一个镜头的版本，用户反馈"太慢"。
- **素材要密**：大部分镜头里至少要有一层照片或纹理（照片卡片、半调、双色调、砖墙、星空），再叠贴纸、胶带、大字。只用纯矢量图形的版本，用户反馈"素材不丰富"。
- 背景色要轮换（红、黄、绿、青、米白、黑色星空），相邻两个镜头不要用同一个底色。
- 撕纸转场（`trans:'tear'`）全片最多 4 次；其他切换用 `punch:true`（推近）加切点白闪（引擎自动加）。
- 结尾前放一段 `replay` 闪回（每 2 帧切一次前面的镜头），结尾 lockup 停 1.5 秒左右。
- 主体和文字不要放在左下角（时间码）和右上角（品牌角标）。
- `showcase` 布局下，代码面板的 `lines` 要写得像真的代码（`film.at(@).method(args)`），`@` 会被替换成绝对帧号。asset 行会显示缩略图和授权说明，标注要如实：照片写清楚 CC0、用户提供还是 AI 生成。

## 常见问题

- 渲染报 `Tainted canvas` → 页面必须通过 render.js 自带的 HTTP 服务打开，不能用 file://。
- 中文或 emoji 显示成方块 → 字体缺失，见"环境"一节。
- 画面全黑或缺图 → 看 render.js 的输出里有没有 `MISSING ASSET`，检查 `CONFIG.assets` 里的文件名。
- 时长不对 → 总帧数等于所有 `dur` 之和（`timeline.json` 里的 `frames`）。
