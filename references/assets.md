# 素材：来源、处理、授权

## 素材从哪里来（按优先级）

1. **用户提供的图**（产品照、品牌图、自己用 AI 生成的图）。最贴合主题。
2. **AI 生成**（Higgsfield、Midjourney、Flux 等，由用户生成后提供）。建议给用户一份提示词清单，所有提示词都用同一个风格后缀，保证整条片子风格统一，例如：
   - 风格后缀 `STYLE = "90s zine collage, halftone print, torn paper edges, high contrast, flat studio light, isolated on white"`
   - 主角："product hero shot of <产品>, 3/4 view, {STYLE}"
   - 人物："person shouting with joy, cut-out, {STYLE}"（人物用 AI 生成，不要用真人照片）
   - 道具：boombox / clock / horse / sneaker / eye macro …，每样 2–3 张
3. **CC0 / 公有领域图**：Python 环境里的 `skimage.data`（coffee、chelsea 猫、rocket 火箭发射、hubble_deep_field 深空、horse 剪影、brick / gravel / grass 纹理、moon、coins，都是 CC0 或公有领域，见各函数的 docstring）。NASA 的图片大部分是公有领域。
4. **emoji 贴纸**：`emoji(g, '🔥', x, y, size, rot)` 会自动加白边和阴影（Noto Color Emoji 用的是 OFL 授权）。
5. **程序化图形**：`sneaker()`（9 种配色 `CW`）、`eye()`（版画风眼睛），以及 halftone、sunburst、newsprint、concrete 纹理。

不要用：来源不明的网图、有版权的角色或 logo、可识别的真人照片（用于广告时）。

## 处理（scripts/prep_assets.py）

```bash
python3 scripts/prep_assets.py photo.jpg --out proj/assets --name hero \
  --treat color bw halftone duotone:#3a0a2a:#FF8FB1 circle cutout silhouette
# 局部特写（比如眼睛）：先按源图像素坐标裁切，再放大
python3 scripts/prep_assets.py cat.png --out proj/assets --name eye --crop 78,45,190,136 --width 950 --treat color bw
```

| treat | 输出 | 用途 |
|---|---|---|
| color | `<name>.jpg` | 照片卡、全屏底图 |
| bw | `<name>_bw.jpg` | 黑白高反差 + 颗粒，网格 / 档案感 |
| halftone[:N] | `<name>_ht.jpg` | 报纸网点，N 是网点间距 |
| duotone:D:L | `<name>_duo.jpg` | 双色调（粉紫、红黑、蓝黄） |
| circle[:cx,cy,r] | `<name>_circle.png` | 圆形贴纸（杯子、徽章、圆盘） |
| cutout | `<name>_cut.png` | 去白底（AI 生成图如果是白底就很合适） |
| silhouette | `<name>_sil.png` | 纯黑剪影，可以叠在条纹上 |

注意：放大超过 4 倍会糊。特写要裁大一点，或者改用 halftone / bw 处理来掩盖模糊。

## 在代码里使用

```js
// config.js
assets: ['hero.jpg', 'hero_duo.jpg', 'eye.jpg'],
// timeline.js
photoCard(g, 'hero_duo', 500, 480, 820, 560, -.05, 140);   // 撕纸照片卡
fullCover(g, IMG.hero, 1.1);                               // 铺满舞台
cover(gg, IMG.eye, w, h, zoom);                            // 在 tornCard 内部按比例铺满
```

代码面板上的素材行：`[0, 'hero = asset.photo("hero.jpg", treat="duotone")', {label:'hero · product photo · client supplied', items:['img:hero','img:hero_duo']}]`，label 里要如实写来源和授权。

## 示例素材的授权（examples/jump-vol01/assets）

全部从 scikit-image 样图处理而来：chelsea（猫）、coffee、horse、brick 是 CC0；rocket（SpaceX 发射照）、hubble_deep_field（NASA）是公有领域；moon、coins 没有已知的版权限制。
