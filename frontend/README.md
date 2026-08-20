# SALX Frontend v1

Frontend được nâng cấp từ `SAL-Frontend-Starter`, giữ nguyên business flow của backend + smart contract SAL hiện tại.

## Bổ sung trong bản này

- Branding SALX và logo SALX.
- Light / Dark theme, lưu lựa chọn bằng localStorage.
- Song ngữ Việt / Anh, dictionary tập trung tại `src/contexts/LanguageContext.tsx`.
- Wallet login modal: MetaMask + Coin98.
- Multi-injected wallet discovery qua EIP-6963, có fallback `window.coin98.provider` cho Coin98.
- Dashboard cá nhân: SAL holdings, CO2 tương ứng, project, listings, proceeds, refund, SBT count.
- Trang Retire riêng giống flow CarboX nhưng gọi đúng SAL backend + smart contract hiện tại.
- SBT card hai mặt (front / back), flip để xem audit trail, dùng nhận diện SALX.
- Trang Leaderboard từ endpoint backend hiện có.
- Giữ `/portfolio` làm alias cho `/dashboard` để không làm gãy route cũ.

## Business logic không đổi

- Project metadata: backend -> IPFS -> owner `submitProject` on-chain.
- Validator/Admin flow vẫn đi qua backend hiện tại.
- Listing vẫn do project owner tạo, mỗi listing có `pricePerUnit` riêng.
- 1 SAL = 10 kg CO2e chỉ là đơn vị carbon.
- Retirement: backend tạo + ký metadata -> frontend gọi `retireSAL` -> burn SAL -> mint GreenCertificateSBT.
- MongoDB vẫn là indexed view; blockchain vẫn là source of truth.

## Chạy local

```bash
cp .env.example .env
npm install
npm run dev
```

Điền đúng 3 contract address đang được backend hiện tại index trong `.env`.

## Cấu trúc dễ thay UI

- UI/layout: `src/pages`, `src/components`, `src/index.css`
- Theme: `src/contexts/ThemeContext.tsx`
- Ngôn ngữ: `src/contexts/LanguageContext.tsx`
- Wallet UX: `src/components/wallet`, `src/contexts/WalletContext.tsx`
- Backend calls: `src/services/backend.ts`
- Blockchain calls: `src/services/blockchain.ts`
- ABI: `src/contracts/abis`

Khi thay Figma/layout sau này, ưu tiên sửa `pages/components/index.css`; không sửa `services` nếu business flow không thay đổi.

## Design references

Ba ảnh người dùng cung cấp được giữ trong `design-reference/` để lần chỉnh UI tiếp theo không phải tìm lại:

- `SALX-brand-board.png`
- `SBT-front-reference.png`
- `SBT-back-reference.png`
