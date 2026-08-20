SALX FRONTEND DROP-IN v2

DÁN VÀO ĐÚNG THƯ MỤC NÀY:
...SALX-Frontend-v1\SAL-Frontend-Starter\

Khi mở thư mục SAL-Frontend-Starter hiện tại, bạn phải nhìn thấy:
package.json
src\
.env
vite.config.ts

Sau đó copy TOÀN BỘ NỘI DUNG của patch này (.env, .env.example, src, README...) vào SAL-Frontend-Starter và chọn Replace.

KHÔNG paste nguyên folder SALX-Frontend-DROP-IN-v2 vào trong src hoặc trong SAL-Frontend-Starter.

Sau khi paste:
1) npm install
2) npm run dev

Contract addresses trong .env đã là deployment Sepolia mới:
Marketplace: 0xbf292971D5b77090CB4044ac178cCec124Fe1b82
SAL1155: 0xcd0B4B97ff46a0B90fb4F0d53E6eD029FDe13E78
SBT: 0x7Fd164320b6Fa7Bcd7F5934808A9B1e3822de7f0

Retire UI mới gửi projectIds[] + salAmounts[] và giới hạn lấy trực tiếp từ smart contract (hiện = 5).
