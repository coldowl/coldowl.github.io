[fetch_wiki_images.py](https://github.com/user-attachments/files/23181190/fetch_wiki_images.py)

引子 — 一次偶然的启发  

前阵子在 Hacker News 刷到一条关于“ADS‑B 数据可视化”的讨论，链接指向 ClickHouse/adsb.exposed 项目。点进去一看，项目作者Alexey Milovidov 等人使用 GridLayer + ClickHouse 后端，实现了一个出彩的 ADS‑B 可视化工程。项目使用 ClickHouse 作为后端存储与在线查询引擎，以极高的吞吐与并发支持地图瓦片式可视化。并且支持多种数据源（adsbexchange、airplanes.live 等），并把这些数据整合后用于地图渲染与报告生成。

我注意到在前端（index.html）里有一个“报告”系统，当鼠标悬停在某些字段（如飞机型号）时，会调用维基百科 API 去尝试获取对应图片并显示——这给了我极好的灵感。

作为正在开发 ADS‑B 接收机的一名爱好者，我一直苦于没有稳定、详实的飞机元数据（例如机型全称、图片、版权信息等），这篇文章恰好触及了我的痛点：如果能把飞机数据和图片结合，就能显著提升我的项目体验与用户界面。于是我开始着手把思路落地。

我的目标  
把收集到的 ADS‑B 数据（至少有注册号、ICAO hex、可能的型号/业主信息）与一个尽量完整的 Aircraft 数据库（包含图片与版权信息）链接起来，并能自动为每条飞机记录找到一张合理的图片并把图片和版权信息保存下来/展示出来。

总体思路与流程（从数据到图片）
1. 数据来源
   - 实时 ADS‑B 数据：来自本地接收机或上游集成（例如 adsbexchange、airplanes.live）。这些数据提供了 ICAO hex、注册号（N‑号）、航班号、以及部分机型字段。
   - 补充元数据：通过已有公开数据表（adsb.exposed 示例里有 flickr_mercator、flickr 等预抓取的照片表）或外部数据库（例如 planespotters、airframes）来补充型号/照片索引。
2. 识别候选关键字
   - 优先使用 model（机型名），若无则尝试 registration（注册号，如 N901GW）、owner/operator（业主）、ICAO hex 等，组合搜索词（如 "A320 aircraft"、"N901GW aircraft"）以提高命中率。
3. 搜索并获取图片（客户端实现思路）
   - 先尝试精确页面匹配（action=query&titles=...）。
   - 若精确查无结果，则使用搜索接口（action=query&list=search）取第一个结果作为候选。
   - 使用 Wikimedia REST API 的 page summary（/api/rest_v1/page/summary/{title}）优先获取 thumbnail 或 originalimage（单次请求通常能得到缩略图信息）。
   - 若需要更详细版权信息，则调用 action=query&prop=imageinfo&iiprop=extmetadata 对 File:<image> 请求 extmetadata（LicenseShortName、Artist、Credit 等）。
   - 对返回的缩略图 URL 做合理处理（或直接请求指定尺寸的 pithumbsize），并缓存搜索结果以减少重复请求。
4. 下载与保存
   - 将图片按规则命名并保存到指定目录（例如以 registration/title 命名），同时记录 image_url 与 attribution（版权/作者）到数据库或 CSV/JSON 记录中。
5. 展示与交互
   - 在前端（地图或报告）实现 hover 显示图片与版权信息，或在你的接收机界面上显示缩略图和链接到原始维基页面/媒体页。

关键实现细节（我实际做的技术点）
- 优先使用 Wikimedia REST summary：它语义清晰，通常能一次性返回摘要、thumbnail/originalimage、pageimage 等字段，比起逐次调用 action=query 的多个参数，效率和稳定性都更好。
- 当 REST summary 未提供时，用 pageimages + pithumbsize 强制获取指定尺寸缩略图，避免手工替换 URL 字符串（比起在缩略图 URL 上做正则替换更稳健）。
- 为了获取版权/作者信息，必须调用 imageinfo.extmetadata（action=query）。extmetadata 包含 LicenseShortName、Artist、Credit、UsageTerms 等字段，可以合成 attribution 文本。
- 做本地缓存：对于同一个搜索词尽量只请求一次（memory cache 或把结果序列化到本地文件），鼠标快速移动或批量处理时能节约很多请求数。
- 处理特殊情况：
  - Disambiguation 页面：若 summary.type == "disambiguation"，尝试用更具上下文的候选词（比如加上 "aircraft"）。
  - 无图片时降级：返回失败标记并记录候选词供人工补充或后续批量处理。
- 速率限制与礼节：对 Wikipedia 等公共服务做适度的请求间隔（比如 0.1–0.2s），并设置合理的 User‑Agent 标识说明用途与联系方式，避免被限流或封禁。
- 在 Notebook 中运行脚本时注意 argparse 问题：ipykernel 会传入额外的命令行参数导致 parse_args 报错；解决方案包括直接 import 并调用函数、或者使用 parse_known_args() 忽略未知参数。

我用到的核心脚本（简述）
- 一个轻量的 Python 脚本（requests 依赖）实现了上述流程：从 record（包含 ICAO/reg/owner/model）生成候选搜索词，按优先级查找维基页面，取得图片 URL，再调用 imageinfo.extmetadata 获取版权信息，最后下载图片保存并输出结果。
- 脚本包含缓存、简单的重试与节流，并能在 Jupyter Notebook 中显示下载的图片（若需要）。

<!-- Failed to upload "fetch_wiki_images.py" -->

运行体验与结果  
- 在本地用几条示例记录测试后（包括只含注册号或仅含 owner 的记录），脚本能成功为大部分记录找到合适的维基图片并把版权信息抓取下来。对于少数没有公开维基条目的个例（例如某些私人小型飞机或老旧注册号），脚本会返回“未找到图片”的结果，这时可以用第三方数据库（FAA、planespotters）补充 model，再重新搜索维基或直接搜 Commons / Flickr 等站点。
- 将图片与 ADS‑B 数据结合后，地图/报告界面在视觉上提升很大：用户把鼠标移动到飞机型号/注册号时可以看到飞机外观与授权信息，调试与展示都更直观。

版权与合规注意事项
- 维基百科及 Wikimedia Commons 上的图片由众多不同许可持有人上传，常见许可包括 CC BY、CC BY‑SA、公有领域等。务必在展示或再分发时遵守相应许可（显示作者、链接来源、注明许可类型等）。调用 imageinfo.extmetadata 能获取必要的版权元数据。
- 对于商业用途，务必核实图片许可是否允许该用途（部分图片禁止商业用途或有 ShareAlike 的要求）。
- 在批量抓取图片时要尊重 remote 服务（限速、不要短时间内大量并发请求），并在 User‑Agent 中留下联系方式便于被联系。

下一步我打算
- 批量化：把脚本改为线程池/异步方式并限制并发（例如 5–10 个并发），对大数据库批量抓取更高效同时安全。
- 数据增强：先把 registration 映射到 model（使用 FAA/planespotters API 或本地数据），再用 model 查维基，提高命中率。
- 本地镜像或缓存代理：若需要长期大量请求，可以考虑把常用的图片/元数据缓存在自己的存储或 CDN 上（并保留版权信息）。
- 更智能的匹配：用自然语言处理或简单规则（如正则清洗型号字符串）来改进搜索词，减少错误匹配。

结语  
从 Hacker News 的一次浏览，到翻阅 ClickHouse/adsb.exposed 源码并借鉴其思路，再到把维基百科与 ADS‑B 数据结合成一个可用的图片抓取流水线，这个过程既满足了我的工程好奇心，也解决了项目里一个实际的痛点。希望这篇整理能帮助同样在做 ADS‑B 或飞行相关数据可视化的朋友们少走弯路——我可以把用于抓图的脚本（含批处理与 notebook 调用示例）整理好附在文下。

—— End —  