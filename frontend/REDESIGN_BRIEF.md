# SALX Frontend — Redesign Brief cho Claude Desktop

> **Đọc file này TRƯỚC KHI làm bất cứ thứ gì.**
> Đây là source of truth duy nhất cho toàn bộ công việc redesign.

---

## 1. Mục tiêu

Làm lại toàn bộ frontend theo đúng prototype tải từ Claude Design,
file tham chiếu là: `../SALX UI Mockups and Prototype/SALX Prototype.dc.html`

**Chỉ được sửa:**
- `src/pages/*.tsx`
- `src/components/**/*.tsx`
- `src/components/**/*.ts`
- `src/index.css`
- `src/App.tsx` (chỉ phần routes)

**Tuyệt đối không sửa:**
- `src/services/` — backend.ts, blockchain.ts, ipfsService.ts
- `src/types/domain.ts`
- `src/contracts/`
- `src/config/env.ts`
- `src/contexts/WalletContext.tsx` — chỉ có thể THÊM field `role`, không xoá gì

---

## 2. Design tokens — đọc từ prototype

```css
/* Copy từ SALX Prototype.dc.html, :root block */
--bg: #0b1311;
--surf: #101c18;
--surf2: #162119;
--ink: #ede7dc;
--mut: #9ea5a8;
--faint: #8ba69b;
--g: #2dc922;           /* green primary */
--gd: rgba(45,201,34,.18);
--gb: rgba(45,201,34,.08);
--bd: rgba(237,231,220,.12);
--bd2: rgba(237,231,220,.22);
--hdr: rgba(11,19,17,.92);
--org: #e8913c;
--gold: #e7c765;

/* Fonts */
--font-display: 'Syne', sans-serif;       /* headings */
--font-body:    'Sora', sans-serif;        /* body */
--font-mono:    'JetBrains Mono', monospace; /* labels, numbers, badges */
```

Google Fonts cần import: `Syne:wght@700;800`, `Sora:wght@400;500;600`, `JetBrains+Mono:wght@400;500;700`

Light mode tokens (toggle bằng `data-theme="light"`):
```
--bg:#F0EDE4  --surf:#E4E0D6  --surf2:#D6D2C8  --ink:#141a12
--mut:#5c6b5c  --g:#141a12  --bd:rgba(20,26,18,.13)
```

---

## 3. Route mapping — QUAN TRỌNG

### Routes giữ nguyên (đổi path nếu cần):
| Route cũ | Route mới | Page component |
|---|---|---|
| `/` | `/` | `HomePage.tsx` |
| `/marketplace` | `/marketplace` | `MarketplacePage.tsx` |
| `/retire` | `/retire` | `RetirePage.tsx` |
| `/submit-project` | `/submit` | `SubmitProjectPage.tsx` |
| `/dashboard` | `/dashboard` | `PortfolioPage.tsx` |
| `/leaderboard` | `/leaderboard` | `LeaderboardPage.tsx` |
| `/activity` | `/activity` | `ActivityPage.tsx` |
| `/validator` | `/validator` | `ValidatorPage.tsx` — giữ, dùng cho cả validator-home và validator-project |

### Routes bị XOÁ khỏi nav và App.tsx:
| Route | Lý do |
|---|---|
| `/certificates` | **Không có trong prototype.** SBT hiển thị ngay trong RetirePage sau khi retire xong (panel phải). Không có trang riêng. |
| `/admin` | Không có trong prototype. Ẩn khỏi nav, giữ route nếu muốn nhưng không link đến đâu. |

### App.tsx sau khi sửa:
```tsx
<Routes>
  <Route element={<AppShell />}>
    <Route path="/"           element={<HomePage />} />
    <Route path="/marketplace" element={<MarketplacePage />} />
    <Route path="/retire"     element={<RetirePage />} />
    <Route path="/submit"     element={<SubmitProjectPage />} />
    <Route path="/dashboard"  element={<PortfolioPage />} />
    <Route path="/leaderboard" element={<LeaderboardPage />} />
    <Route path="/activity"   element={<ActivityPage />} />
    <Route path="/validator"  element={<ValidatorPage />} />
    {/* Legacy redirects */}
    <Route path="/certificates"  element={<Navigate to="/retire" replace />} />
    <Route path="/submit-project" element={<Navigate to="/submit" replace />} />
    <Route path="/portfolio"     element={<Navigate to="/dashboard" replace />} />
  </Route>
</Routes>
```

---

## 4. Nav / AppShell — QUAN TRỌNG

### Header prototype (height: 64px):
```
[SALX logo]  [SEPOLIA chip]  [nav center]  [theme toggle]  [wallet button]
```

### Nav items theo ROLE:

**User role** (nav center):
```
Marketplace | Retire | Submit | Dashboard | Leaderboard
```

**Validator role** (nav center):
```
Pending Projects  [VALIDATOR badge màu gold]
```

### Wallet button states:
- **Chưa connect:** nút outline "Connect Wallet" → mở modal
- **Đã connect:** pill xanh `● 0xD7…91A2  |  0.84 ETH`

### Theme toggle: nút text `DARK` / `LIGHT` (không phải icon sun/moon)

### Logo: dùng `design-reference/` hoặc `../SALX UI Mockups and Prototype/uploads/Ver10/public/assets/salx-wordmark-dark.png`
- Dark mode: `filter: none`
- Light mode: `filter: brightness(0) saturate(100%)`

---

## 5. Connect Wallet Modal — QUAN TRỌNG (luồng mới)

Modal có **2 bước**, không phải 1:

### Bước 1 — Chọn role ("I AM A…"):
- **USER** (xanh lá): "Buy, sell & retire carbon credits"
- **VALIDATOR** (vàng gold): "Review and vote on carbon projects"

### Bước 2 — Chọn ví:
- MetaMask
- Coin98

### Sau khi connect:
- Role = `user` → điều hướng về `/` (home)
- Role = `validator` → điều hướng về `/validator`

### Cần thêm vào WalletContext:
```ts
role: 'user' | 'validator'  // default: 'user'
setRole: (r: 'user' | 'validator') => void
```
Lưu role vào `localStorage` key `salx.role`.

---

## 6. Luồng Retire + SBT — THAY ĐỔI LỚN NHẤT

### Prototype: KHÔNG có trang `/certificates` riêng.

**RetirePage layout (2 cột):**
```
┌─────────────────────┬──────────────────────────────────┐
│  RETIREMENT         │  SBT PREVIEW / SBT RESULT        │
│  TERMINAL (300px)   │  (fill còn lại)                  │
│                     │                                   │
│  - Chọn project     │  idle:   CertPreview (live update)│
│  - Nhập amount      │  pending: CertPending (tx hash)   │
│  - Preview CO2      │  found:  CertResult (SBT đã mint) │
│  - Nút RETIRE →     │                                   │
└─────────────────────┴──────────────────────────────────┘
```

**SBT Result panel (phase = 'found')** hiển thị:
- SBT #tokenId badge
- Tên project
- Số SAL / CO₂ retired
- Link "View on-chain ↗" (Etherscan)
- Nút "RETIRE MORE" → reset form

**KHÔNG redirect sang trang khác sau retire.** Kết quả hiện ngay panel phải.

### PortfolioPage:
- Có stat tile "CERTIFICATES: N SBT minted" (chỉ số đếm)
- Click tile đó điều hướng về `/retire` (không phải `/certificates`)

---

## 7. Từng page — layout prototype

### HOME (`/`)
- Full-bleed dark, `width: 100vw`, margin-left calc để phá vỡ `sal-shell`
- Hero: animated orbit mark, headline, sub, nút "RETIRE SAL" + "EXPLORE MARKET"
- SAL unit bar: `1 SAL = 10 kg CO₂e`
- Editions rail: horizontal scroll snap, 3 project cards
- Stats: Total Approved, Available Carbon, Retired Carbon (từ `GET /api/projects/stats`)
- CTA section cuối
- Scroll reveal animations trên các section

### MARKETPLACE (`/marketplace`)
- Layout: sidebar filters (240px) + grid 3 cột
- Filters: Project Type, Geography, Vintage year (slider)
- Cards: project cover image, tên, type, price/SAL, supply bar, nút "BUY SAL →"
- Skeleton loading (6 cards) khi đang fetch
- Header stat tiles: Total Listings, Avg Price, Carbon Available

### RETIRE (`/retire`)
- Xem mục 6 ở trên

### SUBMIT (`/submit`)
- Form 2 cột, max-width 760px
- Step indicator: 4 bước (Details → Image → Documents → Review)
- Fields: Project Name, Type (select), Location, CO₂ (kg), Methodology, Monitoring Period, Description (textarea)
- Image upload với aspect ratio toggle: 4:3 / 16:9 / 1:1
- MRV Documents: drop zone, tối đa 5 files, 5MB/file
- Estimated deposit preview
- Nút "UPLOAD TO IPFS →" + "SAVE DRAFT"

### DASHBOARD (`/dashboard`) — tên cũ PortfolioPage
- Header: "PORTFOLIO / 0xD7…91A2", h1 "My Portfolio"
- 4 stat tiles (grid 4 cột): SAL Balance, Proceeds (ETH + WITHDRAW), Fee Refund (ETH + CLAIM), Certificates (count)
- SAL Balances by Project: table với cột Project, Balance SAL, CO₂e, locked badge, LIST button
- Active Listings: grid, mỗi row có project, remaining/total, price, ACTIVE badge, CANCEL button
- Recent Activity: 5 rows gần nhất, link "VIEW ALL →" sang `/activity`

### LEADERBOARD (`/leaderboard`)
- Top 3 rank cards highlight (gold/silver/bronze styling)
- Table đầy đủ: rank, address, CO₂ retired, SAL retired, certificate count
- Từ `GET /api/leaderboard`

### ACTIVITY (`/activity`)
- Filter buttons: ALL | MINT | TRANSFER | RETIRE | BURN
- Table: TYPE badge | PROJECT/TX | AMOUNT | CO₂e | DATE
- Từ `GET /api/transactions/history/:address`

### VALIDATOR (`/validator`)
- Sub-route nội bộ: list (validator-home) ↔ detail (validator-project)
- Dùng React state `selectedProjectId` trong component, không dùng URL param
- List: card mỗi project pending, vote progress bar, nút "REVIEW & VOTE →"
- Detail: breadcrumb "← PENDING PROJECTS", thông tin project, MRV docs, vote history, sticky panel "CAST YOUR VOTE" (APPROVE / REJECT)
- Validator badge (gold) hiện trên header khi role = validator

---

## 8. Thứ tự làm để tiết kiệm token

Làm theo thứ tự này, hoàn thiện từng bước trước khi sang bước tiếp:

1. **`index.css`** — xoá toàn bộ design tokens cũ (`--sal-*`), thay bằng tokens mới (`--bg`, `--surf`, `--g`...), giữ lại các utility class animation/layout. Import Google Fonts.
2. **`WalletContext.tsx`** — thêm `role` + `setRole`.
3. **`App.tsx`** — cập nhật routes theo mục 3.
4. **`AppShell.tsx`** — redesign header theo mục 4 + 5 (modal 2 bước).
5. **`HomePage.tsx`** — full-bleed dark layout.
6. **`MarketplacePage.tsx`** + `MarketDcCard.tsx` + `MarketDcFilters.tsx`.
7. **`RetirePage.tsx`** — hoàn thiện luồng retire + SBT panel.
8. **`PortfolioPage.tsx`** — dashboard theo mục 7.
9. **`SubmitProjectPage.tsx`**.
10. **`LeaderboardPage.tsx`**.
11. **`ActivityPage.tsx`**.
12. **`ValidatorPage.tsx`** — gộp validator-home + validator-project.

---

## 9. Quy tắc code

- **Không dùng className `sal-hero`, `sal-card`, `sal-shell`, `sal-primary`** nữa — đây là tokens cũ.
- Dùng CSS variables mới: `var(--bg)`, `var(--surf)`, `var(--g)`, `var(--ink)`, `var(--mut)`, `var(--bd)`.
- Font headings: `fontFamily: "'Syne', sans-serif"`, `fontWeight: 800`.
- Font labels/numbers: `fontFamily: "'JetBrains Mono', monospace"`.
- Font body: `fontFamily: "'Sora', sans-serif"`.
- Animation fadeUp: `animation: 'fadeUp .35s ease'` — đã có trong CSS.
- **Giữ nguyên toàn bộ logic**: hooks (`useRetireFlow`, `useMarketFilters`...), state, service calls, error handling.
- Khi không chắc một component có còn dùng không → giữ lại, đừng xoá.

---

## 10. File tham chiếu theo thứ tự ưu tiên

1. `../SALX UI Mockups and Prototype/SALX Prototype.dc.html` — **source of truth tuyệt đối** cho layout, component, màu sắc
2. `../SALX UI Mockups and Prototype/uploads/Ver10/src/styles.css` — design tokens chi tiết
3. `CarboX-SALX-Frontend-Flow-Spec.md` (trong thư mục gốc hoặc uploads) — logic nghiệp vụ
4. `design-reference/SALX-brand-board.png` — brand reference
5. `design-reference/SBT-front-reference.png` + `SBT-back-reference.png` — SBT card visual
