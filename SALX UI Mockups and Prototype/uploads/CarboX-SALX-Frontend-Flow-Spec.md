# CarboX (SALX) — Frontend Flow & Data Spec

Tài liệu này tổng hợp toàn bộ luồng nghiệp vụ, API backend, contract call on-chain,
và data shape hiện có trong hệ thống — dùng làm tham chiếu khi thiết kế/redesign UI.
Nguồn sự thật của toàn hệ thống là **blockchain**; MongoDB chỉ là read-model để
query nhanh, được đồng bộ bởi một blockchain indexer chạy nền.

Mạng: Ethereum Sepolia testnet. Đơn vị quy đổi cố định: **1 SAL = 10 kg CO2e**.

---

## 0. Kiến trúc & nguyên tắc chung

```
Ví người dùng ──ký giao dịch──▶ Smart Contract (nguồn sự thật)
                                       │  emit events
                                       ▼
                              Backend Indexer (đồng bộ nền)
                                       │  ghi read-model
                                       ▼
                                   MongoDB
                                       │  REST API
                                       ▼
                                  Frontend (React)
```

Ba smart contract:
- **SAL1155** — ERC-1155, token đại diện tín chỉ carbon (1 SAL = 10kg CO2e), có blacklist theo project.
- **GreenCertificateSBT** — ERC-721 Soulbound (không transfer được), chứng chỉ retire, 1 chứng chỉ có thể gộp 1–5 project.
- **SALMarketplace** — trung tâm: submit/vote/approve project, tạo/mua listing, retire SAL (ký EIP-712).

Nguyên tắc UI quan trọng: **mọi hành động ghi dữ liệu on-chain đều cần ví ký giao dịch**
(submit project, tạo listing, mua, huỷ, rút tiền, retire...). Backend chỉ chuẩn bị dữ liệu
(metadata IPFS, chữ ký EIP-712, quote phí) — không bao giờ tự thực hiện hành động thay
người dùng thường (trừ các API admin có riêng khoá `x-admin-key`).

---

## 1. Luồng "Submit Project → Vote → Approve → Mint SAL"

**Vai trò:** Chủ dự án (project owner), Validator, Admin/Owner contract.

| Bước | Actor | Hành động | API / Contract call |
|---|---|---|---|
| 1 | Chủ dự án | Điền form dự án (tên, mô tả, CO2 đề xuất, loại, địa điểm, phương pháp luận, ngày giám sát, ảnh, tài liệu MRV) | Upload từng file: `POST /api/upload/ipfs` (field `document`, tối đa 5MB/file) |
| 2 | Chủ dự án | Tạo metadata + nhận quote phí | `POST /api/projects/metadata` → trả `projectURI`, `ipfsHash`, `quote` (phí tokenization, `marketplacePaused`, `ownerBlacklisted`), và `nextAction` (contract, method, args, valueWei/ETH) |
| 3 | Chủ dự án | Ký gửi giao dịch on-chain, đặt cọc `proposedCO2Kg/10 × feePerSAL` | `SALMarketplace.submitProject(projectURI, proposedCO2Kg)` kèm `value` |
| — | (hệ thống) | Contract **snapshot** ngay lúc submit: danh sách validator đủ điều kiện (trừ chính chủ dự án) + quorum cần đạt = `(eligible/2)+1` — chống thao túng validator sau này | event `ProjectSubmitted`, `ProjectValidatorSnapshot` |
| 4 | Indexer | Ghi `Project` (status `Pending`) vào Mongo | — |
| 5 | Validator | Xem tiến trình vote | `GET /api/projects/votes/:onChainProjectId` → `{approvalVotes, rejectionVotes, approvalQuorum, quorumReached, votes[]}` |
| 6 | Validator | Bỏ phiếu approve/reject | `SALMarketplace.voteOnProject(projectId, approve)` (hoặc qua backend demo: `POST /api/projects/vote/:onChainProjectId` cần `x-admin-key`) |
| 7 | Admin/Owner | Khi đạt quorum, duyệt & mint SAL cho chủ dự án | `PUT /api/projects/approve/:id` (Mongo _id) — backend tự đối chiếu metadata IPFS với dữ liệu on-chain trước khi gọi `approveAndMintSAL(projectId, approvedCO2Kg, tokenURI)`; hoàn phần phí tokenization thừa nếu approvedCO2Kg < proposedCO2Kg |
| 8 | Chủ dự án | Có thể huỷ project đang Pending (chưa approve) để nhận lại toàn bộ cọc | `SALMarketplace.cancelPendingProject(projectId)` |
| — | Chủ dự án | Xem/rút phần phí được hoàn (từ approve một phần hoặc huỷ) | `SALMarketplace.tokenizationFeeRefundBalances(address)` (đọc) → `withdrawTokenizationFeeRefund()` (ghi) |

**Trạng thái Project on-chain thực tế:** `Pending → Approved` hoặc `Pending → Cancelled`.
Contract **không có trạng thái "Rejected"** — validator vote "false" chỉ đơn thuần không cộng vào approvalVotes,
không tự động chuyển trạng thái. (Có route legacy `/api/projects/rejected` chỉ phục vụ dữ liệu cũ, ghi rõ
"Smart contract hiện tại không có trạng thái Rejected".)

**Blacklist project/owner** (nhánh riêng, do Admin/Owner thực hiện, không thuộc luồng vote thường):
- `POST /api/admin/blockchain/projects/:projectId/blacklist` `{reason}` / `.../unblacklist`
- `POST /api/admin/blockchain/owners/:address/blacklist` `{reason}` / `.../unblacklist`
- Khi 1 project bị blacklist: không thể tạo listing mới, không thể mua trên listing hiện có, không thể dùng để retire; SAL đang escrow trong marketplace được trả về seller qua cơ chế `releaseBlacklistedSAL` (chỉ dùng để hoàn trả, không phải để bán/retire tiếp).
- Khi 1 ví (owner) bị blacklist: không thể submit project mới, không thể tạo listing, không thể mua, không thể retire.

---

## 2. Luồng Marketplace (niêm yết & mua bán SAL)

| Bước | Actor | Hành động | API / Contract call |
|---|---|---|---|
| 1 | Chủ SAL (thường là chủ project đã approve) | Duyệt marketplace được giữ SAL thay mặt (1 lần, ẩn sau nút "list") | `SAL1155.setApprovalForAll(marketplaceAddress, true)` (tự động gọi trước khi tạo listing nếu chưa approve) |
| 2 | Chủ SAL | Tạo listing (chọn project, số lượng, giá/SAL trong khoảng `minPrice`–`maxPrice`) | `SALMarketplace.createListing(projectId, amount, pricePerUnit)` — SAL được chuyển vào escrow của contract |
| 3 | Ai cũng xem được | Danh sách listing đang mở, filter theo `active`, `projectId`, `seller` | `GET /api/listings?active=true&projectId=&seller=` |
| 4 | Người mua | Xem chi tiết 1 listing | `GET /api/listings/:listingId` |
| 5 | Người mua | Mua 1 phần hoặc toàn bộ listing | `SALMarketplace.buySAL(listingId, salAmount)` kèm `value = salAmount × pricePerUnit` — trừ phí platform (`platformFeeBps`, mặc định 200 = 2%), phần còn lại cộng vào `sellerBalances` của người bán |
| 6 | Người bán | Huỷ listing, nhận lại phần SAL chưa bán | `SALMarketplace.cancelListing(listingId)` (chỉ seller) hoặc `forceCancelListing(listingId)` (chỉ admin/owner) |
| 7 | Người bán | Rút tiền bán được | `SALMarketplace.withdrawProceeds()` |

**Dữ liệu cần cho UI marketplace:** kết hợp `Listing` (giá, số lượng còn lại, seller) với `Project`
tương ứng (tên, ảnh, loại, địa điểm, mô tả — lấy từ `projectMetadata`) để hiển thị card đầy đủ.

**Giới hạn giá** (đọc on-chain, có thể thay đổi bởi Owner): `minPrice` = 0.001 ETH, `maxPrice` = 1000 ETH (mặc định).

---

## 3. Luồng Retire (nghỉ hưu SAL → mint chứng chỉ SBT)

Đây là luồng phức tạp nhất vì hỗ trợ **gộp tối đa 5 project nguồn vào 1 chứng chỉ duy nhất**,
và cần chữ ký EIP-712 từ backend để chống giả mạo metadata.

| Bước | Actor | Hành động | API / Contract call |
|---|---|---|---|
| 1 | Người dùng | Xem số dư SAL theo từng project đã sở hữu | Đọc on-chain `SAL1155.balanceOf(address, projectId)` cho từng project approved |
| 2 | Người dùng | Xem cấu hình giới hạn hệ thống | Đọc on-chain: `MAX_RETIREMENT_PROJECTS` (mặc định 5), `KG_CO2_PER_SAL` (10), `certificateMintFee()` |
| 3 | Người dùng | Chọn 1–5 project nguồn + số lượng SAL mỗi project | (UI thuần, không gọi API) |
| 4 | Người dùng | Yêu cầu backend tạo metadata gộp + chữ ký ủy quyền | `POST /api/certificates/metadata` `{ownerAddress, projectIds[], salAmounts[]}` → trả `certificateURI`, `metadataCID`, `imageURI`, `retirement.sources[]` (breakdown từng project), và `authorization {nonce, deadline, signature, signer}` |
| 5 | Người dùng | Duyệt marketplace giữ SAL thay mặt (nếu chưa) | `SAL1155.setApprovalForAll` (tự động) |
| 6 | Người dùng | Ký giao dịch retire, trả phí mint chứng chỉ | `SALMarketplace.retireSAL(projectIds[], salAmounts[], certificateURI, deadline, signature)` kèm `value = certificateMintFee` — contract verify chữ ký khớp `metadataSigner` bằng EIP-712, đốt SAL từng project, mint 1 SBT duy nhất |
| 7 | Indexer | Bắt event `MultiProjectSALRetired` + `CertificateMintFeeCollected` | Ghi `Certificate` vào Mongo |
| 8 (fallback) | Frontend | Nếu indexer chưa kịp đồng bộ, tự đọc receipt on-chain ngay | `GET /api/certificates/tx/:txHash` — trả `202 PENDING` nếu chưa có, hoặc chứng chỉ đầy đủ ngay khi backend tự parse được |

**Ràng buộc nghiệp vụ cần thể hiện rõ trên UI:**
- Tối đa 5 project nguồn / 1 chứng chỉ (backend + contract đều chặn).
- 1 chứng chỉ chỉ tính 1 lần phí mint (`certificateMintFee`), không nhân theo số project.
- Chữ ký ủy quyền có `deadline` (hết hạn) và `nonce` dùng 1 lần — nếu người dùng chờ quá lâu trước khi ký ví, cần luồng "tạo lại metadata" thay vì gửi request cũ.
- Certificate là **Soulbound** — không thể transfer, chuyển nhượng, bán lại. UI cần truyền tải rõ điều này (khác NFT thường).

---

## 4. Luồng xem Certificate (chứng chỉ đã mint)

| Hành động | API |
|---|---|
| Xem toàn bộ chứng chỉ theo ví | `GET /api/certificates/wallet/:address` → mảng chứng chỉ, mỗi cái có `sources[]` (breakdown từng project: projectId, projectName, retiredTokenAmount, retiredCO2Kg), `certificateURIHttp`, `imageURL`, `explorerURL` (link Etherscan), `status` (`ACTIVE`/`REVOKED`) |
| Xem theo tokenId | `GET /api/certificates/token/:tokenId` |
| Xem theo tx hash (kèm fallback tự sync) | `GET /api/certificates/tx/:txHash` |
| Xem raw metadata JSON | `GET /api/certificates/:tokenId/metadata` |
| Xem composition trực tiếp từ contract (không qua backend) | `GreenCertificateSBT.getCertificateComposition(tokenId)` → `(projectIds[], salAmounts[])` |

**Trạng thái certificate:** `PENDING` (chờ index) → `ACTIVE` → có thể bị `REVOKED` bởi Owner (kèm `reason`,
gọi qua contract `revokeCertificate`, chưa có route backend admin riêng trong danh sách hiện tại — cần bổ
sung nếu muốn có UI revoke). Certificate revoked thì `tokenURI()` sẽ revert khi đọc on-chain.

---

## 5. Luồng ví & mạng (Wallet)

- Hỗ trợ **MetaMask** và **Coin98** (phát hiện qua EIP-6963 + fallback legacy `window.ethereum`/`window.coin98`).
- Kết nối: `connectWallet(kind)` → tự động `ensureTargetChain()` (ép đúng Sepolia, tự thêm mạng nếu ví chưa có).
- Có `switchToNetwork(chainId)` riêng cho UI chuyển mạng thủ công.
- Đọc số dư native ETH: `nativeBalance(address)`.
- UI cần xử lý: chưa cài ví / sai mạng / từ chối kết nối / đổi tài khoản giữa chừng (event `accountsChanged` — cần lắng nghe nếu chưa có).

---

## 6. Luồng tài chính cá nhân (Portfolio)

Đọc trực tiếp on-chain (không qua backend), gộp thành 1 lần gọi `accountFinance(address)`:

| Trường | Nguồn | Ý nghĩa |
|---|---|---|
| `proceedsETH` | `sellerBalances(address)` | Tiền bán SAL chưa rút |
| `refundETH` | `tokenizationFeeRefundBalances(address)` | Phí tokenization được hoàn chưa rút |
| `certificateFeeETH` | `certificateMintFee()` | Phí mint chứng chỉ hiện hành (tham khảo) |
| `minPriceETH` / `maxPriceETH` | `minPrice()` / `maxPrice()` | Khung giá cho phép khi tạo listing |
| `paused` | `paused()` | Marketplace có đang tạm dừng không |

Kết hợp thêm dữ liệu backend:
- `GET /api/projects?status=all` lọc theo `ownerWallet` → project của tôi (kể cả Pending).
- `GET /api/listings?seller=address` → listing của tôi.
- `GET /api/certificates/wallet/:address` → chứng chỉ của tôi.
- Số dư SAL theo từng project: on-chain `SAL1155.balanceOf(address, projectId)` — cần loop qua từng project approved.

---

## 7. Luồng Admin / Vận hành hệ thống

Toàn bộ route admin yêu cầu header `x-admin-key` khớp `ADMIN_SECRET_KEY` trong `.env` backend
(hiện là secret demo, nhập tay và lưu tạm ở `sessionStorage` phía FE — **cần thiết kế lại thành xác thực
theo ví** nếu muốn dùng thật, vì hiện tại bất kỳ ai biết secret đều có toàn quyền admin).

| Chức năng | API |
|---|---|
| Danh sách project chờ duyệt | `GET /api/projects/pending` |
| Danh sách project legacy bị reject (chỉ dữ liệu cũ) | `GET /api/projects/rejected` |
| Vote hộ (demo) | `POST /api/projects/vote/:onChainProjectId` `{approve}` |
| Duyệt & mint | `PUT /api/projects/approve/:id` `{approvedCO2Kg, onChainProjectId?, tokenURI?}` |
| Xoá project legacy chưa từng lên chain | `DELETE /api/projects/:id` |
| Tạm dừng / mở lại toàn bộ marketplace | `POST /api/admin/blockchain/pause` / `/unpause` |
| Blacklist / unblacklist 1 project | `POST /api/admin/blockchain/projects/:projectId/blacklist` `{reason}` / `/unblacklist` |
| Blacklist / unblacklist 1 ví chủ dự án | `POST /api/admin/blockchain/owners/:address/blacklist` `{reason}` / `/unblacklist` |
| Thêm/xoá validator | *(chỉ có on-chain, chưa có route backend)* `SALMarketplace.addValidator(address)` / `removeValidator(address)` |
| Rút treasury (phí tích luỹ) | *(chỉ có on-chain, chưa có route backend)* `SALMarketplace.claimTreasury(to, amount)` — đọc số dư qua `treasuryBalance` |
| Cập nhật phí/tham số hệ thống | *(chỉ có on-chain)* `updatePlatformFee`, `updateSALTokenizationFeePerSAL`, `updateCertificateMintFee`, `updateMetadataSigner`, `updatePriceRange` |

---

## 8. Luồng dữ liệu tổng hợp / công khai (không cần ví)

| Trang / mục đích | API | Trả về |
|---|---|---|
| Trang chủ — thống kê tổng | `GET /api/projects/stats` | `{totalApprovedProjects, totalAvailableCarbon, totalRetiredCarbon, sourceOfTruth}` |
| Bảng xếp hạng | `GET /api/leaderboard` | Top 10 ví theo tổng SAL đã retire: `{parentWalletAddress, totalRetired, totalRetiredCO2Kg, certificateCount}` |
| Danh sách project (public) | `GET /api/projects?status=approved\|pending\|all` | Mảng `Project` |
| Lịch sử vote 1 project | `GET /api/projects/votes/:onChainProjectId` | Chi tiết + từng phiếu vote |
| Lịch sử phí theo project | `GET /api/fees/project/:projectId` | Mảng `FeeEvent` (TokenizationDepositReceived, TokenizationFeeCollected, TokenizationFeeRefundCredited, TokenizationFeeRefundWithdrawn, CertificateMintFeeCollected, TreasuryClaimed) |
| Lịch sử phí theo ví | `GET /api/fees/wallet/:address` | Mảng `FeeEvent` |
| Lịch sử phí theo tx | `GET /api/fees/tx/:txHash` | Mảng `FeeEvent` |
| Lịch sử giao dịch theo ví (có cache Redis 5 phút) | `GET /api/transactions/history/:address` | Mảng `Transaction` (MINT/TRANSFER/RETIRE/BURN) |
| Chi tiết 1 giao dịch theo hash | `GET /api/transactions/:txHash` | Transaction chính + toàn bộ event liên quan (`events[]`) |
| Sức khoẻ hệ thống | `GET /api/health` (alias `/api/status`) | Trạng thái Mongo/Redis/RPC/indexer |

---

## 9. Data shapes chính (TypeScript, đã dùng trong FE hiện tại)

```ts
type ProjectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

interface Project {
  _id: string;
  chainId: number;
  marketplaceContractAddress: string;
  projectName: string;
  ownerWallet: string;
  ipfsHash: string;
  projectURI?: string | null;
  projectMetadata?: Record<string, any> | null;   // tên, mô tả, loại, địa điểm, methodology, ảnh, documents...
  metadataValidationStatus?: 'UNVERIFIED' | 'VALID' | 'INVALID' | 'UNAVAILABLE';
  metadataValidationErrors?: string[];
  tokenURI?: string | null;
  tokenMetadata?: Record<string, any> | null;
  totalCarbon: number;
  proposedCO2Kg?: number | null;
  approvedCO2Kg?: number | null;
  mintedTokenAmount: number;
  status: ProjectStatus;
  onChainProjectId?: number | null;
  approvalVotes: number;
  rejectionVotes: number;
  eligibleValidatorCount: number;
  approvalQuorum: number;
  listedTokens: number;
  soldTokens: number;
  activeListingId?: number | null;
  pricePerCredit?: string | null;
  blacklisted: boolean;
  blacklistReason?: string | null;
  cancelled: boolean;
  createdAt?: string;
}

interface Listing {
  listingId: number;
  projectId: number;
  sellerAddress: string;
  initialAmount: number;
  remainingAmount: number;
  pricePerUnitWei: string;
  pricePerUnitETH: string;
  active: boolean;
  createdOnChainAt?: string | null;
}

interface Stats {
  totalApprovedProjects: number;
  totalAvailableCarbon: number;
  totalRetiredCarbon: number;
  sourceOfTruth: 'blockchain' | string;
}

interface VoteProgress {
  projectId: number;
  approvalVotes: number;
  rejectionVotes: number;
  approvalQuorum: number;
  quorumReached: boolean;
  votes: Array<{ validatorAddress: string; approve: boolean; txHash?: string; votedAt?: string }>;
}

interface CertificateSource {
  projectId: number;
  projectName: string;
  retiredTokenAmount: number;
  retiredCO2Kg: number;
}

interface Certificate {
  certificateTokenId: number;
  ownerAddress: string;
  projectId: number;              // 0 nếu multi-project
  projectName?: string;
  projectCount?: number;
  sources?: CertificateSource[];  // breakdown đầy đủ khi multi-project
  retiredTokenAmount: number;
  retiredCO2Kg: number;
  certificateURI?: string;
  certificateURIHttp?: string | null;
  imageURI?: string | null;
  imageURL?: string | null;
  explorerURL?: string | null;    // link Etherscan tx
  txHash?: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  mintedAt?: string;
  metadata?: Record<string, any>;
}

interface TransactionEvent {
  txHash: string;
  transactionType?: 'MINT' | 'TRANSFER' | 'RETIRE' | 'BURN';
  fromAddress?: string;
  toAddress?: string;
  projectId?: number;
  tokenAmount?: number;
  co2Kg?: number;
  timestamp?: string;
}
```

---

## 10. Bảng tổng hợp toàn bộ hằng số & tham số hệ thống (đọc on-chain)

| Tham số | Nguồn | Mặc định | Ghi chú UI |
|---|---|---|---|
| `KG_CO2_PER_SAL` | constant | 10 | Hiển thị quy đổi mọi nơi có SAL |
| `MAX_RETIREMENT_PROJECTS` | constant | 5 | Giới hạn chọn nguồn khi retire |
| `platformFeeBps` | biến (owner sửa được) | 200 (2%) | Hiển thị phí sàn khi mua |
| `salTokenizationFeePerSAL` | biến | 0.00000667 ETH | Hiển thị khi submit project (nhân với số SAL tối đa) |
| `certificateMintFee` | biến | 0.00067 ETH | Hiển thị khi retire |
| `minPrice` / `maxPrice` | biến | 0.001 / 1000 ETH | Validate input giá khi tạo listing |
| `treasuryBalance` | biến, chỉ owner đọc có ý nghĩa quản trị | — | Trang admin/treasury |
| `paused` | biến | false | Banner cảnh báo toàn hệ thống khi true |

---

## 11. Tổng hợp toàn bộ mục/trang cần có trên frontend

Danh sách đầy đủ (không phân biệt đã làm UI hay chưa) — dùng làm checklist khi thiết kế lại:

1. **Trang chủ** — stats tổng quan, mô tả luồng 3 bước (Discover → Trade → Retire), CTA.
2. **Marketplace** — danh sách listing, filter (loại project, search), sort (giá, số lượng), mua.
3. **Chi tiết Project** *(hiện chưa có trang riêng)* — mô tả đầy đủ, tài liệu MRV, tiến trình vote, lịch sử giá, tổng SAL mint/bán/retire của riêng project đó.
4. **Submit Project** — form + upload tài liệu IPFS + submit on-chain.
5. **Retire** — chọn multi-source (tối đa 5), xem quy đổi, ký & mint chứng chỉ.
6. **Portfolio/Dashboard** — số dư theo project, tạo/huỷ listing, rút proceeds/refund, huỷ project pending, project của tôi.
7. **Certificates** — danh sách chứng chỉ (kèm composition breakdown, trạng thái ACTIVE/REVOKED), lịch sử giao dịch của ví.
8. **Leaderboard** — top ví theo tổng carbon đã retire.
9. **Fees/Treasury** *(hiện chưa có trang)* — lịch sử phí theo project/ví/tx; với admin: xem treasuryBalance, rút treasury.
10. **Admin — Project Review** — duyệt/pending, vote hộ (demo), xem tiến trình quorum.
11. **Admin — Blacklist Control** *(hiện chưa có UI)* — blacklist/unblacklist project và ví, kèm lý do.
12. **Admin — System Control** — pause/unpause, cập nhật phí/tham số, quản lý validator (add/remove) *(hiện chưa có UI)*.
13. **Validator Dashboard** *(hiện chưa tách riêng, đang gộp vào Admin)* — lịch sử đã vote, project đang chờ vote của riêng validator đó.
14. **Activity/Explorer công khai** *(hiện chưa có)* — toàn bộ giao dịch hệ thống (không giới hạn theo 1 ví), dạng block-explorer mini.
15. **Rejected/Cancelled Projects** *(hiện chưa có view công khai)* — minh bạch hoá project bị huỷ/blacklist.
16. **Wallet connect/switch network** — hỗ trợ MetaMask + Coin98, xử lý sai mạng, đổi tài khoản.
17. **Notification/Alert center** *(có model User.notificationConfig nhưng chưa có UI)*.
18. **Quản lý ví phụ (child wallets)** *(có model User.childWallets nhưng chưa có UI)*.
19. **Biểu đồ/thống kê theo thời gian** *(chưa có)* — carbon retired theo tháng, giá SAL trung bình theo tuần (dữ liệu đã có sẵn qua blockNumber/timestamp trong Mongo).

---

*Tài liệu tổng hợp từ mã nguồn thực tế (backend Express + smart contract Solidity + frontend React hiện có) ngày kiểm tra gần nhất trong phiên làm việc này.*
