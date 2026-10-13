# 律师助手 UAH

独立的 Windows 律师助手原型，基于纯 UAH/Goose 通用桌面宿主。下载运行不需要安装母机、Node、Rust 或开发工具。

## 下载和安装

打开 [Releases](https://github.com/wenmin20212-dotcom/UAH-lawyer/releases)，下载 `UAH-Lawyer-0.1.0-win-x64-Setup.exe`，运行安装向导。安装后双击桌面或开始菜单的 **律师助手 UAH**。

支持 Windows 10/11 x64。安装为当前用户，不要求管理员权限。第一次启动需要在程序里配置自己的模型提供方、账号或 API；不附带离线大模型、模型凭据或真实法律数据库。尚未配置模型时，对话功能不能调用模型。

也提供 `UAH-Lawyer-0.1.0-win-x64-Portable.zip`：完整解压到可写目录，打开 `启动.cmd`。不要只解压 EXE。便携版数据位于解压目录，更新前自行保留 data/workspace；安装版更适合一般用户。

文件完整性校验见同一 Release 的 `SHA256SUMS.txt`。当前安装包没有产品代码签名，Windows 可能提示发布者未知；请核对来源和校验值。

## 当前功能范围

版本为 **0.1.0 prototype**。具有通用对话桌面壳，加载律师使命与范围、五项能力定义及 M3 分类草案。五项能力为客户需求理解、事项材料结构化、法律依据检索关联、法律问题分析草稿、专业成果草稿汇报。

这些是职业设计定义，原项目的 confirmed 只表示结构契约检查。当前没有专业 Skill/MCP 实现、原始法律知识库、自动法律业务流程或完整 M4—M9；不把安装成功或文档完整当成业务能力已实现。程序输出是待人类复核的草稿。

## 数据位置和升级

安装版的程序在 `%LOCALAPPDATA%\Programs\UAH-Lawyer`，配置、聊天和工作目录在 `%LOCALAPPDATA%\UAH-Lawyer\Instances\<安装身份>`。同一路径升级复用已有数据；卸载程序保留该独立数据目录。不同安装路径使用不同身份，各电脑各自配置账号。

不向 GitHub 提交客户材料、案件资料、聊天、配置、授权或模型密钥。发布包不继承母机的数据、账号或话题绑定器。

## 开发与重建

此仓库包含专业定义、独立启动源码、数据目录逻辑、构建工具、安装脚本和验证代码；宿主 EXE/后端是固定版本的二进制依赖，并未在这里复制全部 Rust/Electron 源码。来源及版本见 `runtime-reference.json` 和 `THIRD-PARTY-NOTICES.md`。

在 Windows 安装 Node.js 22+ 和 Inno Setup 6 后：

```powershell
npm ci
npm test
npm run build
node tools/build-installer.cjs --compiler 'C:\Program Files (x86)\Inno Setup 6\ISCC.exe'
```

build 从本项目公开 Release 下载 SHA256 固定的宿主依赖，再替换本项目启动层及专业定义；不需要访问私有母机仓库。也可使用 `node tools/build.cjs --base <已解压的本项目便携包目录>`。这重建的是专用发布层，不重新编译通用宿主本体。

安装/启动/升级/卸载的验证摘要会随 Release 发布；模型账号和法律业务质量不在本次安装验证范围内。

## 依赖许可

保留 Goose/UAH 上游 Apache-2.0 许可及附带的第三方许可。详见 `LICENSE-Goose`、`THIRD-PARTY-NOTICES.md` 和运行包中的 Electron/Chromium/Node 许可文件。
