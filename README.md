# Pure — A Minimal Hexo Theme

极简、清爽、功能完善的 Hexo 主题。支持深色模式、文章目录、代码高亮、数学公式、本地搜索、多种评论系统等。

## 预览特性

- 极简设计，大量留白，优雅排版
- 首页文章列表：标题 + 日期 + 分类 + 标签，点击标题进入文章
- 深色模式（跟随系统 / 手动切换）
- 响应式，适配手机、平板、桌面
- 文章目录（TOC）自动生成，滚动高亮
- 代码高亮（Hexo 内置 highlight.js）+ 一键复制，宽代码块自动横向滚动
- 技术提示块：note / tip / warning / danger 等
- 文章系列导航，适合连续教程和知识库
- 文章时效提醒，旧技术文档自动提示读者核对版本
- 数学公式（KaTeX / MathJax）
- 图片懒加载 + 点击放大（Lightbox）
- 本地搜索（`Ctrl/⌘ + K` 唤起）
- 关于页：支持头像、简介、GitHub 等联系链接
- 评论系统：Giscus / Waline / Disqus / Valine
- 站点统计：Google Analytics / 百度统计 / Umami
- 归档页（按年/月分组）、标签云、分类列表
- 文章版权声明、社交分享
- Open Graph / Twitter Card / JSON-LD SEO
- 友好 404 页面

---

## 安装

```bash
cd your-hexo-blog
git clone https://github.com/your-name/hexo-theme-pure themes/pure
```

在博客根目录的 `_config.yml` 中设置：

```yaml
theme: pure
```

---

## 推荐插件

```bash
npm install hexo-generator-search hexo-generator-feed --save
```

在博客 `_config.yml` 中添加：

```yaml
# 本地搜索
search:
  path: search.xml
  field: post
  content: true

# RSS
feed:
  type: atom
  path: atom.xml
  limit: 20
```

---

## 主题配置

编辑 `themes/pure/_config.yml`，所有选项均有中文注释说明。

### 导航菜单

```yaml
menu:
  首页: /
  归档: /archives
  标签: /tags
  分类: /categories
  关于: /about
```

### 深色模式

```yaml
dark_mode:
  enable: true
  default: auto   # auto（跟随系统）| light | dark
```

### 代码高亮

```yaml
highlight:
  enable: true
  theme: atom-one-dark   # 任意 highlight.js 主题名
  copy_button: true
```

可用主题名参考：https://highlightjs.org/demo

### 文章增强

```yaml
post:
  series:
    enable: true
  outdated:
    enable: true
    days: 365
    basis: date      # date | updated
```

文章系列在文章 front-matter 中配置：

```yaml
---
title: Kubernetes 安装配置
series: Kubernetes 实战
series_order: 1
---
```

同一个 `series` 名称的文章会自动组成系列，并按 `series_order` 排序。

文章提示块写法：

```markdown
:::tip
建议先备份配置文件。
:::

:::warning 生产环境注意
执行前请确认防火墙和 SELinux 策略。
:::

:::danger
这个操作会删除数据，请谨慎执行。
:::
```

支持类型：`note`、`tip`、`info`、`success`、`warning`、`danger`。

### 数学公式

```yaml
math:
  enable: true
  engine: katex   # katex | mathjax
```

同时需要在 `_config.yml` 中禁用 Hexo 内置的 marked 转义：

```yaml
marked:
  mangle: false
  headerIds: false
```

### 关于页

```yaml
about:
  avatar: /images/avatar.jpg   # 头像图片路径
  name: "你的名字"               # 留空则使用站点 author
  bio: "一句话介绍自己"
  links:
    github: "https://github.com/yourname"
    email: "you@example.com"    # 不含 mailto:
    twitter: ""                 # 留空则隐藏
    website: ""
```

### 评论系统

以 Giscus 为例：

```yaml
comments:
  enable: true
  provider: giscus
  giscus:
    repo: "username/repo"
    repo_id: "R_xxx"
    category: "Announcements"
    category_id: "DIC_xxx"
```

前往 https://giscus.app 获取配置参数。

### 站点统计

```yaml
analytics:
  google:
    enable: true
    id: "G-XXXXXXXXXX"
```

---

## 创建页面

### 关于页

```bash
hexo new page about
```

编辑 `source/about/index.md`，将 front-matter 中的 `layout` 设为 `about`：

```yaml
---
title: 关于
layout: about
---

这里可以写正文内容（Markdown），会显示在联系链接下方。
```

头像、简介和联系链接在主题配置 `_config.yml` 的 `about` 节中统一配置。

### 标签页

```bash
hexo new page tags
```

编辑 `source/tags/index.md`：

```yaml
---
title: 标签
layout: tags
---
```

### 分类页

```bash
hexo new page categories
```

编辑 `source/categories/index.md`：

```yaml
---
title: 分类
layout: categories
---
```

### 404 页面

在博客 `source/` 目录下创建 `404.md`：

```yaml
---
title: 页面未找到
layout: 404
permalink: /404.html
---
```

---

## 文章 Front-matter

```yaml
---
title: 文章标题
date: 2024-01-01
updated: 2024-01-02      # 可选，最后更新时间
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
series: 系列名称           # 可选，同名文章会自动组成系列
series_order: 1            # 可选，系列内排序
outdated: false            # 可选，关闭单篇文章的时效提醒
cover: /images/cover.jpg  # 可选，封面图
description: 文章摘要      # 可选，用于 SEO
---
```

使用 `<!-- more -->` 标记摘要截断位置。

---

## 目录结构

```
themes/pure/
├── _config.yml          # 主题配置（中文注释）
├── layout/
│   ├── layout.ejs       # 基础布局
│   ├── index.ejs        # 首页
│   ├── post.ejs         # 文章页
│   ├── page.ejs         # 自定义页面
│   ├── about.ejs        # 关于页（支持头像 + 联系链接）
│   ├── archive.ejs      # 归档页
│   ├── tags.ejs         # 标签列表
│   ├── tag.ejs          # 单标签页
│   ├── categories.ejs   # 分类列表
│   ├── category.ejs     # 单分类页
│   ├── 404.ejs          # 404 页面
│   └── _partial/        # 可复用片段
│       ├── head.ejs
│       ├── header.ejs
│       ├── footer.ejs
│       ├── post-card.ejs
│       ├── pagination.ejs
│       ├── toc.ejs
│       ├── comments.ejs
│       ├── share.ejs
│       ├── search-modal.ejs
│       └── analytics.ejs
└── source/
    ├── css/main.css
    └── js/
        ├── main.js
        └── search.js
```

---

## 浏览器支持

现代浏览器（Chrome、Firefox、Safari、Edge 最新版）。不支持 IE。

## License

MIT
