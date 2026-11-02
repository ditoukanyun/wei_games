# 海底连连消 H5 部署

访问：http://118.145.223.121/game/ocean-fish-match/

2026-10-31 部署移动 H5 发布构建。启动场景为 loading。

- 发布目录：`/var/www/projects/game/ocean-fish-match/`
- Nginx 配置：`/etc/nginx/project-locations/ocean-fish-match.conf`
- 本地产物：`build/web-mobile/`
- 页面模板：`build-templates/web-mobile/`
- 校验记录：`verification.json`（261 个文件逐一校验 SHA-256；其他游戏与首页摘要未变）。

每次发布先构建 web-mobile，显式选择 loading 场景（1042344d-c20d-4927-91cc-4f6eec3da4f6），保留旧目录后再替换。配置修改后运行 nginx -t，通过再热重载。

下线时仅移走本游戏的独立 Nginx 配置并校验、热重载；保留发布目录即可恢复。

## 2026-11-02 水族馆视觉版本

58 张位图整体替换，保留五类棋子和原有存档。道具移到棋盘底部；短屏/长屏检查完成。源素材与原版备份在 art/。新增每关结算保护，避免重复触发过关。线上版本参数 aquarium-20261102。旧版备份 /var/backups/ocean-fish-match/before-aquarium-20261102-082614。校验见 evidence/aquarium-validation.json。

## 2026-11-02 三页设计与响应式页头

发布参数 responsive-20261102。已验证加载/首页/关卡场景和完整脚本、261 个线上文件。顶部珍珠与音乐按钮锚定可用视口；手机视觉复核 375×667、360×800、390×844、414×896。音乐缩小、开始按钮下移、礼物增加高对比底牌。旧版在 /var/backups/ocean-fish-match/before-responsive-20261102-195855。

构建使用 `python3 tools/build_h5.py`。默认编辑器为 /Users/wei/Applications/CocosCreator-Verified.app（Cocos 官方 3.8.8 独立副本）；可通过 COCOS_CREATOR_BIN 指定有效安装。项目路径必须使用真实路径，避免 /tmp 与 /private/tmp 别名造成脚本丢失。原编辑器曾将素材导入为未知类型，且 CLI 报 Finished 也可能生成空场景，因此必须运行 verify_h5_release.py 并实际进入游戏，不可只依赖退出码或 Finished。

### 光泽与对齐微调

2026-11-02 更新 gloss-20261102：音乐开关使用正方形渲染框；每日礼物两个按钮均为 330×96、同一中线，图标和文字垂直居中；首页青绿/淡紫按钮增加柔和渐变与高光。发布校验见 evidence/gloss-release.json，画面见 evidence/threepage-gloss-preview.png。

### 关卡提示与续玩按钮

2026-11-02 更新 contrast-20261102：进入关卡提示使用深青底板、奶油白标题与金黄目标分数；继续/重新开始使用等宽 220×82 胶囊按钮。校验记录 evidence/contrast-release.json，关卡实际截图 evidence/contrast-level.png。

### 连消反馈

2026-11-02 更新 combo-20261102：四种鼓励语统一为小型深青/奶油白提示牌，放在进度条附近，轻微缩放后淡出，避免遮挡中央棋盘。已实际触发“太棒了”并确认计分。截图 evidence/combo-prompt-game.png；校验 evidence/combo-release.json。

### 珍珠判断与大字反馈

2026-11-02 feedback-20261102：修复选中道具后重复点击/切换被误报为珍珠不足；换色检查 changeNum 而非 hammerNum；切换清理旧提示。新增 tool-actions 回归验证余额、库存、选择不扣费以及实际使用扣50。实际界面验证200→150。保留加载原生文字、高对比道具提示、橙色大字连消反馈。旧版备份 /var/backups/ocean-fish-match/before-feedback-20261102-210855。线上文件校验 evidence/feedback-release.json。

### 道具选中与取消

2026-11-02 tools-20261102：珊瑚锤/换色选中显示金色光圈及1.06倍缩放；再次点击取消，切换清理旧选择。提示条提供独立“取消 ×”入口。库存以右上角橙金角标展示，无库存才在下方展示珍珠50。375×667、414×896实际检查通过，提示条取消和重复点击取消均不扣费。回归tests/tool-actions.cjs与原有五项检查通过。发布261文件摘要校验见evidence/tool-state-release.json。备份/var/backups/ocean-fish-match/before-tool-state-20261102-212251。

### 道具提示精简

2026-11-02 soft-tools-20261102：按反馈移除顶部提示的取消入口，保留再次点击当前道具取消。次数角标改浅奶油底与柔和青字。实际画面evidence/tool-soft.png，构建及道具回归通过，发布校验evidence/tool-soft-release.json。

### 礼物领取后倒计时

2026-11-02 gift-20261102：冷却入口素材显示“已领取”，倒计时移到独立下行浅色底板，避免与素材标题重叠。重复初始化先清理旧计时回调。已重新进入首页验证冷却状态，截图evidence/gift-countdown-fixed.png，发布校验evidence/gift-release.json。
