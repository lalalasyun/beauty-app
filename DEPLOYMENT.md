# Beauty App - デプロイ構成ドキュメント

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│                  Cloudflare Pages                    │
│                                                     │
│  ┌──────────────┐       ┌────────────────────────┐  │
│  │  Static SPA  │       │   Pages Functions       │  │
│  │  (React +    │──────▶│   (Hono API)            │  │
│  │   Vite)      │ /api  │                         │  │
│  └──────────────┘       │  ┌───────┐  ┌────────┐ │  │
│        dist/            │  │  D1   │  │   R2   │ │  │
│                         │  │(SQLite│  │(Photos)│ │  │
│                         │  └───────┘  └────────┘ │  │
│                         └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

| レイヤー | 技術 | 用途 |
|---------|------|------|
| フロントエンド | React 19 + Vite 6 + Tailwind CSS 4 + shadcn/ui | SPA |
| バックエンド | Hono (Cloudflare Pages Functions) | REST API |
| データベース | Cloudflare D1 (SQLite) | 顧客・施術記録 |
| 画像ストレージ | Cloudflare R2 | ビフォーアフター写真 |
| テスト | Vitest + Testing Library | ユニット/API テスト |
| CI/CD | GitHub Actions | 自動テスト・デプロイ |
| 認証（将来） | Better Auth + Google OAuth | ユーザー認証 |

---

## 環境一覧

| 環境 | D1 DB名 | R2 バケット名 | デプロイトリガー |
|------|---------|--------------|----------------|
| ローカル | ローカル (Miniflare自動) | ローカル (Miniflare自動) | `npm run dev` |
| ステージング | `beauty-app-stg-db` | `beauty-app-stg-photos` | `develop` ブランチ push |
| 本番 | `beauty-app-prod-db` | `beauty-app-prod-photos` | `main` ブランチ push |

---

## 前提条件

- Node.js 20+
- npm
- Cloudflare アカウント
- GitHub アカウント（CI/CD用）

---

## 1. ローカル開発環境セットアップ

### 1.1 依存パッケージインストール

```bash
npm install
```

### 1.2 ローカルD1データベース作成 & マイグレーション

```bash
npm run db:migrate:local
```

これにより `.wrangler/` 配下にローカルSQLiteファイルが作成される。

### 1.3 開発サーバー起動

**フロントエンド開発（HMR付き）:**

```bash
npm run dev
```

Vite dev server が `http://localhost:5173` で起動。
`/api/*` へのリクエストは `http://localhost:8788` にプロキシされる。

**APIサーバー（Wrangler経由）:**

```bash
npm run dev:server
```

Wrangler が `http://localhost:8788` でPages Functions をローカル実行。
D1 と R2 は Miniflare によりローカルでエミュレートされる。

**フルスタック（ビルド後）:**

```bash
npm run dev:full
```

---

## 2. Cloudflare リソース作成

### 2.1 Wrangler CLI 認証

```bash
npx wrangler login
```

### 2.2 D1 データベース作成

**ステージング:**

```bash
npx wrangler d1 create beauty-app-stg-db
```

**本番:**

```bash
npx wrangler d1 create beauty-app-prod-db
```

コマンド出力の `database_id` を `wrangler.toml` の該当箇所に貼り付ける。

### 2.3 R2 バケット作成

**ステージング:**

```bash
npx wrangler r2 bucket create beauty-app-stg-photos
```

**本番:**

```bash
npx wrangler r2 bucket create beauty-app-prod-photos
```

### 2.4 D1 マイグレーション実行

**ステージング:**

```bash
npm run db:migrate:staging
```

**本番:**

```bash
npm run db:migrate:production
```

---

## 3. Cloudflare Pages プロジェクト作成

### 3.1 ダッシュボードから作成

1. Cloudflare Dashboard → Pages → 「プロジェクトを作成」
2. GitHub リポジトリを接続
3. ビルド設定:
   - **フレームワークプリセット**: なし
   - **ビルドコマンド**: `npm run build`
   - **出力ディレクトリ**: `dist`
4. 環境変数は不要（バインディングで設定）

### 3.2 バインディング設定

Pages プロジェクトの設定 → Functions → バインディング:

| 種類 | 変数名 | リソース |
|------|--------|---------|
| D1 database | `DB` | 対応するD1データベース |
| R2 bucket | `BUCKET` | 対応するR2バケット |

**ステージングと本番で別のバインディングを設定すること。**

---

## 4. GitHub Actions CI/CD

### 4.1 必要なシークレット

GitHub リポジトリの Settings → Secrets and variables → Actions:

| シークレット名 | 値 | 取得方法 |
|---------------|---|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン | ダッシュボード → API トークン → トークンを作成 (Edit Cloudflare Workers) |
| `CLOUDFLARE_ACCOUNT_ID` | アカウントID | ダッシュボード → Workers & Pages → 右サイドバー |

### 4.2 ワークフロー

- `main` ブランチへの push → **本番デプロイ**
- `develop` ブランチへの push → **ステージングデプロイ**
- PR → **テストのみ実行**

---

## 5. D1 スキーマ

```sql
-- 顧客テーブル
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_kana TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 施術記録テーブル
CREATE TABLE IF NOT EXISTS treatment_records (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  treatment_date TEXT NOT NULL DEFAULT (date('now')),
  memo TEXT DEFAULT '',
  before_image_key TEXT DEFAULT '',
  after_image_key TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_records_customer ON treatment_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON treatment_records(treatment_date DESC);
```

---

## 6. API エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/customers?search=` | 顧客一覧（検索対応） |
| GET | `/api/customers/:id` | 顧客詳細 |
| POST | `/api/customers` | 顧客登録 |
| PUT | `/api/customers/:id` | 顧客更新 |
| DELETE | `/api/customers/:id` | 顧客削除 |
| GET | `/api/records?customer_id=` | 施術記録一覧 |
| GET | `/api/records/:id` | 施術記録詳細 |
| POST | `/api/records` | 施術記録登録 |
| PUT | `/api/records/:id` | 施術記録更新 |
| DELETE | `/api/records/:id` | 施術記録削除（R2画像も削除） |
| POST | `/api/images/upload` | 画像アップロード (FormData) |
| GET | `/api/images/:key` | 画像取得 |

---

## 7. R2 画像ストレージ

### ファイルパス規則

```
records/{record_id}/before.webp
records/{record_id}/after.webp
```

### 制限

- 最大ファイルサイズ: 10MB
- 対応形式: JPEG, PNG, WebP
- クライアントサイドでWebPに変換・圧縮（最大1920px）してからアップロード

---

## 8. 認証（将来対応）

### 設計

- `server/middleware/auth.ts` にパススルーミドルウェアを配置済み
- Better Auth 導入時にミドルウェアを差し替えるだけで認証を追加可能
- Hono Context の `user` 変数に認証ユーザー情報が入る設計

### Better Auth 導入手順（将来）

1. `npm install better-auth`
2. Better Auth の設定ファイルを作成（D1 アダプター使用）
3. Google OAuth クレデンシャルを Cloudflare に設定
4. `server/middleware/auth.ts` のパススルーを実際の認証チェックに置換
5. フロントエンドにログイン画面を追加

---

## 9. トラブルシューティング

### ローカルD1が動作しない

```bash
# .wrangler ディレクトリを削除して再作成
rm -rf .wrangler
npm run db:migrate:local
```

### wrangler.toml の database_id エラー

D1 作成時に出力された実際の `database_id` に置き換えること。
ローカル開発のみなら `placeholder-replace-after-creation` のままでOK。

### R2 アップロードがタイムアウト

- クライアントサイドで画像を圧縮してからアップロードしているか確認
- 最大10MBの制限を超えていないか確認
