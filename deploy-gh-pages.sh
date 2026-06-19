#!/usr/bin/env bash
# 将 dist/ 目录推送到远程 gh-pages 分支
# 用法：chmod +x deploy-gh-pages.sh && ./deploy-gh-pages.sh
set -e

DIST_DIR="dist"
BRANCH="gh-pages"
REPO_URL=$(git -C . remote get-url origin)

if [ ! -d "$DIST_DIR" ]; then
  echo "[ERROR] '$DIST_DIR' 目录不存在，请先运行：npm run build"
  exit 1
fi

echo "==> 正在将 $DIST_DIR/ 发布到 $BRANCH 分支..."

# 创建临时目录用于发布
TMP_DIR=$(mktemp -d)
cp -R "$DIST_DIR"/. "$TMP_DIR"/

# 添加 .nojekyll（GitHub Pages 默认会处理 Jekyll，需禁用以支持 _ 开头文件）
touch "$TMP_DIR/.nojekyll"

# 写入 index（用于展示信息）
cat > "$TMP_DIR/DEPLOYED.md" <<'EOF'
Deployed via deploy-gh-pages.sh
EOF

# 初始化临时 git 仓库并推送
cd "$TMP_DIR"
git init
git checkout -b "$BRANCH"
git add -A
git -c user.email="deploy-bot@local" -c user.name="Deploy Bot" \
    commit -m "chore(deploy): publish $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f "$REPO_URL" "$BRANCH"

echo ""
echo "✅ 发布成功！"
echo "   分支：$BRANCH"
echo "   目录：$DIST_DIR/"
echo ""
echo "==> 下一步：在 GitHub 仓库 Settings → Pages 中"
echo "    Source 选择：Deploy from a branch"
echo "    Branch：$BRANCH / (root)"
echo ""
echo "    部署完成后访问："
echo "    $(echo "$REPO_URL" | sed 's/.*github.com[:/]/https:\/\/\1.github.io\//' | sed 's/.git$/\//')"
echo ""

# 清理
rm -rf "$TMP_DIR"
