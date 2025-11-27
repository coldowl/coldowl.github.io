[how-to-contribute](https://opensource.guide/zh-hans/how-to-contribute/)
https://github.com/firstcontributions/first-contributions

你怎么能直接 commit 到我的 master 分支啊？！GitHub 上不是这样！你应该先 fork 我的仓库，然后从 develop 分支 checkout 一个新的 feature 分支，比如叫 feature/confession。然后你把你的心意写成代码，并为它写好单元测试和集成测试，确保代码覆盖率达到95%以上。接着你要跑一下 Linter，通过所有的代码风格检查。然后你再 commit，commit message 要遵循 Conventional Commits 规范。之后你把这个分支 push 到你自己的远程仓库，然后给我提一个 Pull Request。在 PR 描述里，你要详细说明你的功能改动和实现思路，并且 @ 我和至少两个其他的评审。我们会 review 你的代码，可能会留下一些评论，你需要解决所有的 thread。等 CI/CD 流水线全部通过，并且拿到至少两个 LGTM 之后，我才会考虑把你的分支 squash and merge 到 develop 里，等待下一个版本发布。你怎么直接上来就想 force push 到 main？！GitHub 上根本不是这样！我拒绝合并！

### 怎么给开源项目提拉取请求（Pull Request）？
在 GitHub 上给开源项目提 PR（Pull Request）大致分为以下几个步骤：

#### 1. Fork 项目

* 打开目标项目的 GitHub 页面。
* 点击右上角 **Fork**，将项目复制到你的 GitHub 仓库下。
* 现在你有一份开源项目的副本了，在 `fork仓库` 里的任何修改都不会弄乱原始代码库。

#### 2. Clone 到本地

```bash
git clone https://github.com/你的用户名/项目名.git
cd 项目名
```

#### 3. 添加上游（Upstream）远程仓库，这样能随时同步原项目的更新

```bash
git remote add upstream https://github.com/原作者/项目名.git
```


#### 4. 创建新分支，不要在 `main/master` 上直接改动，可取的做法是新建一个分支

```bash
git checkout -b feature/你的修改内容
```


#### 5. 修改代码并提交到 `fork` 仓库，在本地修改完成后

```bash
git add .
git commit -m "简要说明修改内容"
git push origin feature/你的修改内容
```

#### 6. 提交 Pull Request

* 回到你 Fork 的仓库页面。
* GitHub 会提示你刚推送了一个分支，点击 **Compare & pull request**。
* 填写标题和描述，说明修改了什么、为什么要改。
* 确认目标分支是 **原仓库的 main/master**，提交 PR。


#### 7. 等待维护者 Review

* 维护者可能会提出修改意见，你可以在本地修改后继续 `git push`，PR 会自动更新。
* 通过后，维护者会合并你的代码。

### Git Commit 规范 
Conventional Commits（约定式提交）
`<type>(<scope>): <subject>`
- type
  - feat：新增功能 
  - fix：修复 bug 
  - docs：仅修改文档
  - style：代码格式调整（无逻辑变化）
  - refactor：重构（无新功能，无修 bug）
  - chore：构建、脚本、依赖升级等杂项
  - test：测试相关
  - perf：性能优化
- scope
  - ui
  - core
  - network
  - protocol
  - build
  - auth
  - api
  - db
 - subject
   - 用一句话说明做了什么，不超过 50 字符，而且别写句号
   - 用动词开头，现在时，最好使用祈使句（“增加/修复/优化”）
 - 例子
feat(protocol): 添加远程控制相关协议结构体
fix(ui): 修复参数面板不能滚动的问题
refactor(core): 优化状态机逻辑
