> 后续执行：已按用户要求清理。删除明细见同目录 2026-11-02-cleanup-result.json；下文为清理前的盘点记录。

# 未使用素材盘点（仅检查，未删除）

检查范围：assets 下图片、音效、图集、动画与预制体；场景/预制体 UUID 和子资源引用；脚本动态加载；图集与骨骼动画文件名依赖。静态检查不能代替所有平台运行验证。

## 第一批候选：未发现运行时引用

| 文件 | 大小 | 依据 |
| --- | ---: | --- |
| assets/res/loadingUI/2@2x.png | 185,685 字节（181.3 KiB） | 没有场景/预制体 UUID 引用，未发现脚本动态加载。旧素材生成脚本 tools/build_aquarium_art.py 仍有生成分支，清理时须同步移除分支，避免重新生成。 |

关联 .meta 应与文件成对处理；本轮均未改动。

## 第二批候选：已被运行时 UI 替代，仍有序列化引用

| 文件 | 大小 | 现状 |
| --- | ---: | --- |
| assets/res/loadingUI/游戏努力加载中...@2x.png | 3,293 字节 | loading.scene 仍引用；loadingView.start 隐藏旧 Sprite，改用原生 Label。移除前先解绑场景与素材生成脚本。 |
| assets/resources/UI/评分/锤子@2x.png | 4,397 字节 | hammerTishi.prefab 仍引用；daojuTishi 禁用旧 Sprite，改用原生文字和绘制底板。 |
| assets/resources/UI/评分/换色@2x.png | 4,278 字节 | changeTishi.prefab 仍引用；同上。 |

这三张合计 11,968 字节（11.7 KiB），不应直接删除后留下丢失引用。两批共 197,653 字节（193.0 KiB），不等同于最终发布包节省量。

## 不列为未使用

- assets/resources/pop/排行/{1,2,3}.png 和 inrank_item_bg.png：rankPopTs.ts 按路径动态加载。
- assets/bundles/music/：loadRes 按目录预加载，音效名称通过枚举和数字字符串传入，不能按无 UUID 引用删除。
- assets/bundles/Prefabs/：对象池按名称动态创建，包括 flyItem、shengliPop 和 0–3 鼓励语。
- assets/resources/donghua/yu1、yu2、yu3 下 PNG：骨骼动画图集按文件名依赖，不能按无 UUID 引用删除。
- 图集 PNG/plist：包含仍在使用的子图，个别旧子图需另做图集瘦身，不能删除整张。
- assets/resources/UI/目标分数@2x.png：game.scene 仍直接引用，本次不认定未使用。

## 非运行时目录（不影响 H5 包，不建议混同无用素材）

- art/originals：约 4.9 MiB，原版素材和代码备份。
- art/threepage-originals：约 536 KiB，当前三页设计生成脚本使用的基线。
- art/source：约 10 MiB，新美术源图，生成脚本使用其中多张图片，建议保留或归档。
- library、temp、build：导入缓存、临时文件、构建产物，可重新生成，但不是本次素材删除候选。

后续若执行清理，应只先处理上述四张候选，连同引用和生成脚本更新，再完整构建与检查加载页、道具提示。尚未执行任何删除或部署。
