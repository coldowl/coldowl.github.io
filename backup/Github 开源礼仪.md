[how-to-contribute](https://opensource.guide/zh-hans/how-to-contribute/)
https://github.com/firstcontributions/first-contributions

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

