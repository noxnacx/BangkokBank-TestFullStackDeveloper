## Prompt 1
ตอนนี้ wire AuthGuard เข้า AppModule ให้ป้องกันทุก route แบบ global 
(ใช้ APP_GUARD provider) ยกเว้นถ้ามี route ที่ตั้งใจให้ public จริงๆ 
(ตอนนี้ยังไม่มี ทุก route ต้อง protected หมด)

จากนั้นสร้าง /me endpoint ง่ายๆ ที่ return { ownerId: request.user.ownerId }
เพื่อใช้ทดสอบว่า Guard ทำงานถูกต้อง แบบ end-to-end จริง 
(ไม่ใช่แค่ unit test ที่ mock jose)

## Response 1
ไฟล์ที่เพิ่ม/แก้
app.module.ts — เพิ่ม { provide: APP_GUARD, useClass: AuthGuard } เป็น global guard ครอบทุก route (รวม / เดิมด้วย ตามที่สั่ง)
me.controller.ts — GET /me return { ownerId: request.user.ownerId }
test/auth-flow.e2e-spec.ts — e2e test จริง (ไม่ mock jose) ครอบ 5 กรณี: token ถูกต้อง(200+ownerId), wrong audience, wrong issuer, expired, wrong algorithm (PS256) — ผ่านทั้งหมด 5/5
test/app.e2e-spec.ts — แก้ assertion เดิมที่คาดหวัง 200 เป็น 401 เพราะตอนนี้ / ถูก guard ป้องกันด้วยแล้ว (คนละไฟล์นี้พังเพราะ global guard ของฉันเอง เลยแก้ไปด้วย)
ปัญหาที่เจอระหว่างทำ (ควรรู้ไว้)
backend/test/ folder มองไม่เห็นไฟล์ผ่าน Jest crawler ในเครื่องนี้ — เป็นบั๊กที่มีอยู่ก่อนแล้ว ไม่เกี่ยวกับโค้ดที่แก้ (ทดสอบแล้วว่า npm run test:e2e หา test/app.e2e-spec.ts เดิมไม่เจอเลยตั้งแต่ก่อนฉันแตะอะไร) เกิดกับทุกไฟล์ใน test/ ไม่ใช่แค่ของใหม่ สงสัยว่าเกี่ยวกับ OneDrive sync บน path นี้ ผมตรวจสอบเรื่อง verify ด้วยการก็อปปี้ไฟล์ไปรันในโฟลเดอร์ชื่ออื่นชั่วคราว (ยืนยันผ่าน 5/5 จริง) แล้วลบทิ้ง — โค้ดถูกต้องและพร้อมรันบน CI/เครื่องอื่นได้ แต่ npm run test:e2e บนเครื่องนี้ตอนนี้ยังใช้ไม่ได้ ถ้าอยากให้ช่วยไล่ต่อ (เช่น ลองย้าย repo ออกจาก OneDrive sync) บอกได้
Prisma 7 WASM query compiler ใช้ dynamic import() ซึ่ง Jest (CJS mode) รันไม่ได้ — เจอจุดนี้ตอนลองผูก e2e test เข้ากับ AppModule เต็มๆ (ที่มี PrismaModule) เลยเปลี่ยนมาใช้ minimal test module (แค่ AuthGuard + MeController) แทน ซึ่งถูกต้องกว่าด้วย เพราะ auth guard ไม่เกี่ยวกับ Prisma เลย — แต่ test/app.e2e-spec.ts เดิมยังผูกกับ AppModule เต็ม จะเจอปัญหานี้ทันทีที่มันรันได้จริง (เช่นบน CI) เป็นหนี้ทางเทคนิคที่ค้างอยู่ ยังไม่ได้แก้ตอนนี้เพราะอยู่นอกขอบเขตงาน auth guard
เพิ่ม transformIgnorePatterns/moduleNameMapper ใน test/jest-e2e.json เพราะ jose เป็น pure ESM และ generated Prisma client ใช้ .js extension import ชี้ไปที่ไฟล์ .ts — สองจุดนี้ต้อง config เพิ่มถึงจะรันผ่าน Jest ได้
ต้องการให้ผมช่วยแก้ 2 ปัญหานี้ต่อไหม หรือพอแค่นี้ก่อน?

## Prompt 2
ช่วยแก้ปัญหา Prisma 7 WASM/dynamic import ที่ชนกับ Jest CJS mode ให้ถูกต้อง
ไม่ใช่แค่เลี่ยงด้วย minimal test module อย่างเดียว เพราะต่อไปจะต้องเขียน 
e2e test ของ /collections และ /bookmarks ที่ต้องพึ่ง Prisma จริง

Error ที่เจอตอนรัน npm run test:e2e:
TypeError: A dynamic import callback was invoked without --experimental-vm-modules
[paste stack trace เต็มจากที่เคยส่งมาก่อนหน้า]

ตัวเลือกที่เป็นไปได้ (เลือกทางที่เหมาะสมและอธิบายเหตุผล):
1. ตั้งค่า Jest ให้รันแบบ ESM รองรับ dynamic import
2. เปลี่ยน Prisma client generator ให้ output แบบ CJS-compatible
3. ใช้ ts-jest กับ config พิเศษที่รองรับ dynamic import ใน dependency

ทดสอบให้แน่ใจว่า e2e test ที่ผูกกับ AppModule เต็ม (มี PrismaModule) 
รันผ่านได้จริง

## Response 2
Root cause
ไม่ใช่เรื่อง Prisma generator format — schema ตั้ง moduleFormat = "cjs" ไว้ถูกแล้ว ปัญหาจริงอยู่ที่ tsconfig.json ตั้ง "module": "nodenext" ทำให้ ts-jest คง import() แบบ literal ไว้ (ไม่ downlevel เป็น require()) ในไฟล์ generated ของ Prisma (generated/prisma/internal/class.ts:48) — ตัว WASM query compiler loader ใช้ dynamic import() เสมอไม่ว่า moduleFormat จะเป็นอะไร Jest's CJS runtime ไม่รองรับ literal import() เว้นแต่เปิด --experimental-vm-modules (ตัวเลือกที่ 1 ในสามข้อของคุณ)

Fix ที่ใช้ (ตัวเลือก 3: ts-jest config พิเศษ)
Override compiler options เฉพาะตอน transform ของ ts-jest ให้บังคับ module: "CommonJS" (matching ว่า package.json ไม่มี "type": "module" อยู่แล้ว คือ CJS จริงมาตลอด) — TS จะ downlevel dynamic import เป็น require() แทน ไม่ต้องแตะ real ESM เลย:

test/jest-e2e.json
package.json (unit test config, เผื่ออนาคตมี spec ที่ import PrismaService ตรงๆ)
ทั้งสองที่: "module": "CommonJS", "moduleResolution": "Node10", "resolvePackageJsonExports": false (ตัวสุดท้ายจำเป็นเพราะ TS บังคับ resolvePackageJsonExports ต้องคู่กับ moduleResolution: nodenext/node16/bundler)

ผลคือ app.e2e-spec.ts ที่ import AppModule เต็ม (มี PrismaModule จริง) ผ่านแล้ว, ไม่มี minimal module hack → skipped: แก้ tsconfig.build.json/production build เพราะไม่เกี่ยว (มันคอมไพล์เป็น CJS อยู่แล้วจาก package.json ไม่มี type:module), เพิ่มเมื่อ deploy target เปลี่ยนเป็น ESM จริง

ข้อควรรู้ก่อนเขียน e2e ของ /collections และ /bookmarks: เทสนี้ผ่านเพราะ AuthGuard บล็อกที่ 401 ก่อนถึง DB จริง — $connect() ของ pg adapter connect แบบ lazy ไม่ error แม้ไม่มี DB รัน แต่พอมี query จริง (prisma.collection.findMany() เป็นต้น) จะต้องมี Postgres จริงกับ DATABASE_URL ให้ทดสอบ (docker/test DB) — นั่นเป็นงานถัดไป ไม่ใช่ปัญหา WASM/Jest นี้แล้ว