[how-to-contribute](https://opensource.guide/zh-hans/how-to-contribute/)
https://github.com/firstcontributions/first-contributions
https://conventional-branch.github.io/zh/

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

一、只git add相关文件提交前先 git status 查看改动，明确git add与本次变更相关的文件（git add <具体路径>），再 git diff --cached --stat 核对。禁止 git add .、-A、--all、* 这类一把梭的操作。暂存错了就 git reset HEAD <路径> 撤销。

二、一次提交只做一件事
每个提交必须原子、完整、可构建。
一件不可分割的任务是一个提交
多个独立任务拆成多个提交
不提交已知有问题的代码
不在开发分支上打补丁式（fix-up）提交

如果开发分支上的提交有问题且尚未推送，用 git reset --soft HEAD~1 修正后重新提交；
已经推送则任何改写、amend、force push 都要先征得同意。

提交前自查：这次改动是否在补完或修正上一个提交？如果是，就 git reset --soft HEAD~1 合并进去重提，而不是新建提交。即便两个提交各自干净，后一个补完前一个也属于 fix-up 提交。

探索性工作可用 temp/、wip/、scratch/ 分支，别直接合并，要另建干净的分支再按原子提交整理。三、提交信息内容subject说明改了什么；正文在问题或修复方式不明显时解释为什么。

subject规则：祈使语气，不超过 72 字符，结尾不加句号描述行为或能力
正文规则：非简单改动必须有正文，主题完全自明时可以省略正文解释根因和修复理由，讲清为什么这是个 bug、为什么需要这次改动不逐文件罗列改动，不赘述 diff 已经能看出来的实现步骤只描述最终状态相对父提交的变化，不描述同一补丁各中间版本之间的差异（如“v2 修复了 X”）

四、相信读者默认读者是熟悉项目的合格开发者，不要解释他们已知的东西：项目编译方法，属于文档而非提交信息显而易见的方法陈述，
反面案例：    Example usage:
      # use mkv container:
      ffmpeg -hwaccel d3d12va -hwaccel_output_format d3d12 -i input.mp4 -c:v av1_d3d12va output.mkv

构建成功、“测试全绿”之类的信息——git提交能存在就说明它通过了

仅在真正不显然时才写：
项目里还不存在的新测试命令或工具
复现结果所需的非标准配置
影响数据解读的异常约束

- 暂存区

在使用 git add 将工作区的修改添加到暂存区前，先用 git status 查看改动，明确添加的是与本次变更相关的文件（git add <具体路径>），再 git diff --cached --stat 核对。

禁止 git add .、-A、--all、* 这类一把梭的操作。暂存错了就 git reset HEAD <路径> 撤销。

- 



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
