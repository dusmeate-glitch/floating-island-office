# 发布到 GitHub Pages

这个站点是纯静态文件，根目录和 `dist/` 都可以直接发布。

## 用仓库根目录发布（推荐）

1. 新建仓库（例如 `floating-island-office`），把本目录内容推上去。
2. GitHub → Settings → Pages → Build and deployment：
   - Source: **Deploy from a branch**
   - Branch: `main`（或 `master`）
   - Folder: `/ (root)`
3. 保存后等待一两分钟，站点一般是：
   `https://<your-user>.github.io/floating-island-office/`
4. 建议同时打开：
   `https://<your-user>.github.io/floating-island-office/#gbw-HYFDOsZbeHJvrWlqr20nHG`

若仓库名是 `username.github.io`，则发布在域名根路径。相对路径（`./js/...`、`./css/...`）两种都可用。

## 只发布 dist/

```bash
rsync -a --delete --exclude dist --exclude screenshots --exclude '.git' ./ dist/
```

然后将 Pages 的 Folder 设为 `/dist`，或把 `dist/` 内容推到 `gh-pages` 分支。

## Cloudflare Pages / 任意静态托管

上传整个目录（或 `dist/`），构建命令留空，发布目录填 `/` 或 `dist`。不需要 Node 构建。

## 本地预览发布结果

```bash
python3 -m http.server 4173
# 打开 http://127.0.0.1:4173/?mode=day
```

## 注意

- 不要把 ntfy 之外的密钥写进仓库。
- topic 写在 hash 里，不会进服务器访问日志的 path 部分，但仍是知道链接即可订阅。
- 本环境不会替你创建 GitHub 账号或索取 token。若需要从这台机器做一次临时公网演示，可用你自己的隧道工具把 `4173` 暴露出去；默认没有常驻公网地址。
