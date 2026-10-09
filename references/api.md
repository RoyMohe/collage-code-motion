# API 参考

所有函数都画在 1000×1000 的舞台上，`g` 是舞台的 2D context。每个镜头的签名是 `draw(g, l, f)`：`l` 是镜头内的本地帧（从 0 开始），`f` 是全片帧号（用来做持续的动态，比如旋转、颗粒）。

## 时间与缓动（core.js）

| 函数 | 说明 |
|---|---|
| `pr(l, a, b)` | 把 l 映射成 a→b 区间内 0→1 的进度并截断。基本上每个动画都从它开始 |
| `eOut / eIn / eIO` | 三次缓出、缓入、缓入缓出 |
| `eBack(t)` | 带回弹的缓出，用于弹入（超过 1 再回落） |
| `lerp(a, b, t)` · `clamp(v, a, b)` | 线性插值、截断 |
| `rng(seed)` | 确定性随机数生成器，返回 `() => [0,1)`。**不要用 Math.random**，否则每次渲染结果不一样 |
| `shakeXY(l, start, amt, dur=8)` | 衰减的震屏偏移 `[dx, dy]` |
| `qb(x0,y0,x1,y1,x2,y2,t)` | 二次贝塞尔曲线上的点（轨迹、点线） |

## 底与纹理

| 函数 | 说明 |
|---|---|
| `sunburst(g, cx, cy, n, cols, rot)` | 放射光芒，cols 循环取色（可以带透明色叠在底色上） |
| `halftone(g, x, y, w, h, col, step, fn)` | 网点，`fn(x,y)` 返回每个点的半径 |
| `newsprint(g, seed, col?)` | 报纸排版暗纹 |
| `fullCover(g, IMG.key, zoom, dx, dy)` | 照片铺满舞台 |
| `concrete` | 预先生成好的水泥纹理 canvas：`g.drawImage(concrete, 0, 0)` |
| `addGrain(g, amt, f)` | 胶片颗粒（引擎已经自动加了） |

## 拼贴元素

| 函数 | 说明 |
|---|---|
| `tornCard(g, cx, cy, w, h, rot, col, seed, inner?, sc=1)` | 撕纸卡片（白色毛边 + 阴影）；`inner(gg)` 在卡片坐标系内绘制并裁切，原点在卡片中心 |
| `photoCard(g, key, cx, cy, w, h, rot, seed, sc=1, zoom=1, flip=false)` | 撕纸照片卡（照片按比例铺满） |
| `cover(gg, im, w, h, zoom, ox, oy, flip)` | 在当前原点把图片按比例铺满 w×h |
| `sticker(g, txt, x, y, rot, bg, fg, size=56, sc=1)` | 带投影的方块标签贴纸 |
| `emoji(g, ch, x, y, size, rot)` | 带白边和阴影的 emoji 贴纸（有缓存） |
| `tape(g, x, y, rot, w)` | 半透明胶带 |
| `bolt(g, x, y, s, rot, col)` | 闪电 |
| `speedlines(g, f, n, vertical, col?)` | 速度线（每帧随机） |
| `extruded(g, txt, x, y, font, face, side, outline, depth, dx, dy, olw)` | 立体大字：face 是正面颜色，side 是侧面颜色，outline 是外描边（可以传 null） |
| `countdown(n, bg, face, side, imgKey)` | 生成一个倒数镜头的 draw 函数 |

## 程序化主角

- `sneaker(g, x, y, s, palette=CW[i], { rot, sx, sy, flip, sticker })`：s=1 时宽约 420px。`CW` 里有 9 种配色，`{upper, accent, accent2, sole}`。用 `sy<1` 加 `sx>1` 做落地时的压扁效果。
- `sneakerSketch(g, x, y, s, progress)`：线稿逐笔画出。
- `eye(g, cx, cy, halfWidth, open 0..1, irisColor, look -1..1)`：版画风眼睛，可以眨眼、转动瞳孔。
- **换主角**：`CONFIG.hero = (g, x, y, s, pal, o) => {...}`，所有预设都会改用它。比如 `photoCard`、`emoji`，或者自己画的产品图形。线稿镜头用 `CONFIG.heroSketch`。

## 预设镜头（presets.js）

用法 `preset(name, k, opts)`：原始长度是 30 帧，`k` 是加速倍数（k=2.5 时播完需要 12 帧，k=30/18 时 18 帧）。opts 用来覆盖文字：

| name | 画面 | opts |
|---|---|---|
| intro | 新闻纸底，字母卡片砸下，圆形角标，打字标语 | word（取前 4 个字母）、kicker、badge、badgeSub、tagline |
| drop | 红色光芒，主角带速度线冲入并压扁 | top、bottom、label |
| unbox | 光芒底，纸盒盖飞走，主角弹出，彩纸 | word、boxLabel |
| look | 撕纸版画卡片，眼睛眨眼，青色方框追踪 | caption、side |
| grid | 3×3 配色网格依次弹出，红笔圈出 | callout |
| jump | 绿底，立体大字，点环绕，模糊退场 | word |
| tiao | 抖动的中文大字，点轨迹，竖排小字 | glyph、vertical、caption |
| fly | 主角弹跳，环形文字旋转，落地冲击线 | ring |
| marquee | 斜向滚动字条，闪电，拍立得照片 | word、caption |
| sketch | 横线纸，线稿画出，红色锯齿缝线 | side、fig、note |
| stamp | 水泥底，印章砸下震屏，主角落下 | word、caption |
| end | 黄色圆，立体 Logo，标语，主角，角标 | word、tagline、badge |

## 镜头对象（timeline.js）

```js
{ name:'fuel', dur:12,                       // 帧数，建议是 6 的倍数
  bg:'YELLOW', text:'"FUEL UP."', hero:'"cup"', // 只用于代码面板的 state 区显示
  tag:[560,140],                             // FX 标签在舞台上的位置
  punch:true,  /* 或 */ trans:'tear',
  lines:[[0,'cup = asset.cutout("coffee.png")', {label:'cup · photo · CC0', items:['img:coffee_cut']}],
         [0,'film.at(@).spin(cup, sticker=True)']],
  draw(g, l, f) { ... } }
```
`SFX[name] = [[offset, type, ...args]]`，type 可选 `blip(freq) beep(freq) whoosh boom scratch rise chord ticks(count,every) roll(count,every)`。

## CONFIG（config.js）

`brand, project, file, fps, bpm, layout('showcase'|'film'), badge{title,sub,bg} | false, countdownLabel, palette{}, fonts{display,cjk,mono,emoji}, hero, heroSketch, assetDir, assets[]`

调色板 `P` 的默认色：RED GREEN CREAM INK YELLOW TEAL ORANGE NAVY WHITE PINK KRAFT CONCRETE。代码面板会把大写的颜色名渲染成带色块的样子。
