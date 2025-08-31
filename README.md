# realtime-notify (monorepo)

**目的**: Rails(backend) と React(frontend) を同居させたモノレポ構成で、通知サービスの基盤を提供します。

## リポジトリ構成（骨子）
```
realtime-notify/
├─ backend/ # Rails 7 API (通知発火・永続化・キュー)
├─ frontend/ # React/Next.js (UI/ダッシュボード)
├─ .github/
│ └─ workflows/ # CIは後続Issueで追加
├─ .gitignore
├─ .node-version
├─ .ruby-version
└─ README.md
```

## 起動方針（骨子）
- **開発**:
  - Backend: `cd backend && bin/dev` もしくは `rails s`
  - Frontend: `cd frontend && pnpm dev`（または `npm run dev`）
- **環境変数**: ルート直下ではなく、各パッケージ配下に `.env` を置く（例: `backend/.env`, `frontend/.env.local`）
- **依存管理**: 各パッケージで独立管理（後続でワークスペース化を検討）

## 運用方針（骨子）
- ブランチ: `feature/issue{n}-...` を推奨（例: `feature/issue1-repo-basics`）
- CI/CD: GitHub Actions を利用（ワークフローは段階的に導入）
- コミット規約: Conventional Commits（例: `chore(repo): scaffold monorepo basics (issue #1)`）

## 今後の課題（メモ）
- actions/setup-node & actions/setup-ruby 導入
- Lint/Format 統一（ESLint/Prettier & RuboCop/StandardRB）
- ルートに `Makefile` or `task` で起動コマンド集約
