# AI Workflow

## Tools & Models
- **Claude Code** (คำสั่งหลักตลอดโปรเจกต์) — ใช้ orchestrate ทั้ง backend 
  (NestJS/Prisma) และ frontend (React/Vite) รวมถึงรัน test/verify ผ่าน 
  terminal โดยตรง
- **Playwright** — ใช้ผ่าน Claude Code สำหรับ live smoke test ทุก feature 
  ที่เกี่ยวกับ browser (auth flow, CRUD UI, sharing) แทนการเชื่อว่า 
  "build ผ่าน = ใช้งานได้"
- **Custom slash command** `/verify-endpoint`
  (`.agent/commands/verify-endpoint.md`) — สรุป pattern การ verify ที่ใช้ซ้ำ
  ทุก endpoint ตลอดโปรเจกต์นี้ไว้เป็นคำสั่งเดียว (unit test + live smoke
  test ผ่าน JWT เซ็นจริงบน DB จริง + เช็ค negative case ownership) เพื่อไม่ต้อง
  อธิบาย pattern เดิมซ้ำทุกครั้งที่เพิ่ม endpoint ใหม่ สร้างขึ้นตอนงานหลัก
  เสร็จไปแล้ว (retrospective) แต่สรุปจาก pattern ที่ใช้จริงตลอดทาง ไม่ใช่คิด
  ขึ้นมาลอยๆ — ถ้ามี command นี้อยู่ตั้งแต่ตอน implement `/bookmarks` ครั้งแรก
  การเช็ค cross-owner `collectionId` (ดู [DECISIONS.md](DECISIONS.md)) จะถูก
  live-HTTP-verify ไปพร้อมกับ unit test ใน pass เดียวกันเลย แทนที่จะเป็นงาน
  ที่ต้องนึกขึ้นได้แยกต่างหากทีหลัง — งานปริมาณเท่าเดิม แค่เรียงลำดับดีขึ้น

## Task Decomposition
แบ่งงานเป็น phase ตามลำดับ dependency ไม่ prompt รวบยอด:
1. Scaffold (backend/frontend แยกกัน)
2. Verify Auth0 tenant ก่อนออกแบบ auth (ไม่เดา)
3. Auth guard + e2e test คู่กัน
4. Prisma schema + seed
5. CRUD ทีละ resource (Collections ก่อน เพราะ Bookmarks อ้างอิงถึง) 
   พร้อม test คู่กันทุกครั้ง ไม่แยกทำ test ทีหลัง
6. Frontend auth flow → หน้า CRUD ทีละหน้า (reuse pattern จากหน้าแรก)
7. Feature เสริม (Edit, Share) หลัง core ทั้งหมดเสถียรแล้วเท่านั้น

หลักการที่ยึดตลอด: ทุก prompt ระบุ scope ชัดว่า "ยังไม่ต้องทำอะไร" 
กัน agent ทำเกินขอบเขตที่ตรวจสอบไม่ทัน

## 2-3 สิ่งที่ AI ทำได้ดี
1. **จับ security edge case ที่ไม่ได้สั่งตรงๆ** — ตอนเขียน AuthGuard 
   เจอเองว่า tenant เปิด HS256 ไว้ด้วย (จากบริบทใน DECISIONS.md) 
   แล้วป้องกัน algorithm confusion attack โดยไม่ต้องบอก
2. **ไล่ root cause จริงแทนที่จะเลี่ยงปัญหา** — ปัญหา Prisma+Jest ตอนแรก
   ดูเหมือนเป็นเรื่อง Prisma generator แต่ไล่จนเจอว่าจริงๆ อยู่ที่ 
   tsconfig module setting แล้วแก้ที่ต้นเหตุจริง ไม่ใช่ patch หลบ
3. **Verify แบบ adversarial ไม่ใช่แค่ happy path** — ทุก feature (CRUD, 
   auth, sharing) มี live smoke test ที่ลองโจมตี/ทดสอบ negative case 
   จริงผ่าน HTTP ด้วย JWT เซ็นจริง ไม่ใช่แค่ mock

## Cost/Token Awareness
ใช้ prompt ที่ scope แคบในแต่ละครั้ง (ทีละ module/feature) แทนการ 
prompt รวบยอดทั้งระบบ ช่วยให้:
- แก้ไขเฉพาะจุดได้เร็วเมื่อผลลัพธ์ไม่ตรง ไม่ต้อง re-generate โค้ดทั้งก้อน
- ตรวจสอบ output ได้ละเอียดขึ้นต่อรอบ (ทานได้จริง ไม่ใช่กวาดตาดูผ่านๆ)
- Trade-off: ใช้จำนวน prompt มากกว่าการสั่งรวบยอด แต่ output แต่ละรอบ
  คุณภาพสูงกว่าและ debug ง่ายกว่ามาก

## TODO / Pending

- ~~[2026-07-27] แทนที่ placeholder ownerId ด้วย sub จริง~~ —
  **แก้แล้ว [2026-07-27]**: login จริงด้วย `candidate@test.com` ผ่าน frontend
  PKCE flow (Playwright ขับ Universal Login ให้), decode access token จริงที่ได้
  → `sub = "auth0|62e089faea483987422db6cc"` แทนค่าใน `backend/prisma/seed.ts`
  `OWNER_A` แล้ว รัน `npm run prisma:seed` ซ้ำสำเร็จ ยืนยันด้วย query ตรงว่า
  User A มี 2 collections/5 bookmarks ผูกกับ sub จริงถูกต้อง, live smoke test
  ของ Collections+Bookmarks รันซ้ำผ่านหมด ไม่มี regression

  **บทเรียนที่เจอระหว่างทาง:** seed script ลบข้อมูลเก่าแบบ scoped ด้วยค่า
  `OWNER_A`/`OWNER_B` **ปัจจุบัน** เท่านั้น — พอเปลี่ยนค่า placeholder เป็น sub
  จริง ข้อมูลเก่าที่ seed ไว้ใต้ placeholder ตัวเก่ากลายเป็นขยะตกค้างในตาราง
  ทันที เพราะ script ไม่รู้จักค่าเก่าอีกต่อไป (deleteMany เทียบกับ constant
  ใหม่ ไม่เจอ match) ต้อง manual cleanup แยกอีกที — ครั้งต่อไปถ้าจะเปลี่ยนค่า
  seed ownerId อีก ให้เช็ค orphaned rows ใต้ค่าเก่าด้วยเสมอ ไม่ใช่แค่เชื่อว่า
  รัน seed ซ้ำแล้วจบ

- ~~[2026-07-27] แทนที่ placeholder VITE_AUTH0_CLIENT_ID ด้วยของจริง~~ —
  **แก้แล้ว [2026-07-27]**: client_id จริง (`H9F6QG5SzTKMv0tbmgxLj9LjG1EKVllA`)
  มีอยู่แล้วในสเปกต้นฉบับ ไม่ต้องสร้าง Application ใหม่ ใส่ใน
  `frontend/.env` แล้ว ยืนยันด้วย Playwright ว่า login ผ่าน Universal Login
  จริงด้วย `candidate@test.com`, แลก code เป็น access token จริงสำเร็จ
  (ไม่ใช่แค่ redirect URL ถูกต้องเหมือนรอบก่อน)

## Prompt ที่ได้ผลดี

### ตัวอย่าง 1: Auth Guard implementation
**Prompt:**
ตอนนี้ตัดสินใจแล้วว่าใช้ Access Token (RS256) เป็น Bearer credential
ตามที่สรุปไว้ใน DECISIONS.md

ช่วยเขียน AuthGuard สำหรับ NestJS ที่:
1. ดึง Bearer token จาก Authorization header
2. Verify signature ด้วย RS256 โดยใช้ public key จาก JWKS 
   (https://dev-yg.us.auth0.com/.well-known/jwks.json)
3. ตรวจสอบ audience (aud) ต้องตรงกับ https://bbl-candidate-test-api
4. ตรวจสอบ issuer (iss) ต้องตรงกับ tenant ที่ถูกต้อง
5. ตรวจสอบ expiry (exp) ของ token
6. ถ้า token ไม่ผ่านการตรวจสอบข้อใดข้อหนึ่ง ให้ throw UnauthorizedException
7. ถ้าผ่าน ให้แนบข้อมูล user (โดยเฉพาะ sub claim ที่จะใช้เป็น ownerId) 
   ไว้ใน request object เพื่อให้ controller ใช้ต่อได้

ใช้ library ที่เหมาะสมสำหรับ JWKS verification (เช่น jwks-rsa + passport-jwt 
หรือ nestjs built-in) และอธิบายเหตุผลที่เลือก library นั้น

อธิบายทุกส่วนของโค้ดว่าทำไมต้องเขียนแบบนี้ โดยเฉพาะจุดตรวจสอบความปลอดภัย
แต่ละจุด (audience, issuer, signature, expiry)

ยังไม่ต้องเขียน controller หรือ business logic อื่น ขอแค่ Guard ก่อน

**ทำไมได้ผลดี:**
- สั่งให้ "อธิบายเหตุผลทุกจุด" แทนที่จะขอแค่โค้ด → ทำให้ agent ต้อง justify 
  การเลือก library (jose vs passport-jwt+jwks-rsa) แทนที่จะเลือกแบบ default
- ระบุ security checklist ชัดเจน (signature, audience, issuer, expiry) 
  ทำให้ agent ไม่พลาดจุดไหนไป
- ผลลัพธ์ที่ไม่คาดคิด: agent เจอและป้องกัน algorithm confusion attack 
  (hard-code algorithms: ['RS256']) ซึ่งไม่ได้ระบุไว้ใน prompt ตรงๆ 
  แต่มาจากบริบทที่ให้ไว้ก่อนหน้าใน DECISIONS.md (tenant เปิด HS256 ด้วย)

  ### ตัวอย่าง 2: Verify Auth0 tenant ก่อนตัดสินใจ

**Prompt:**
ก่อนจะตัดสินใจออกแบบ auth guard ผมอยากให้ตรวจสอบ Auth0 tenant จริงก่อน
โดยไม่ต้องเดา ให้ทำตามนี้:

1. Fetch discovery document จาก:
   https://dev-yg.us.auth0.com/.well-known/openid-configuration
   แล้วสรุปให้ฟังว่า: รองรับ response_types อะไรบ้าง, grant_types_supported,
   code_challenge_methods_supported รองรับ S256 ไหม, 
   id_token_signing_alg_values_supported, jwks_uri อยู่ตรงไหน

2. Fetch JWKS จาก jwks_uri ที่ได้ แล้วสรุปว่ามี key อะไรบ้าง 
   ใช้ algorithm ไหนในการ sign

3. จากข้อมูลที่ได้ทั้งหมด ช่วยวิเคราะห์และเสนอทางเลือกให้ผมตัดสินใจว่า
   API ควรรับ Bearer token เป็น "access token" หรือ "ID token"

ยังไม่ต้องเขียนโค้ด auth guard ตอนนี้ ขอแค่ผลการตรวจสอบและข้อเสนอก่อน

**ทำไมได้ผลดี:**
- บังคับให้ agent เช็คของจริงก่อนตัดสินใจ แทนที่จะให้ agent เดาจาก 
  training data ทั่วไปว่า Auth0 tenant "ปกติ" รองรับอะไร
- ผลลัพธ์ที่ได้ต่างจาก default ที่คาดไว้จริง: tenant นี้เปิด implicit flow 
  และ HS256 ไว้ด้วย (ไม่ได้ปิด legacy flow) ถ้าไม่เช็คก่อนอาจพลาดจุดนี้ 
  แล้วออกแบบ guard ที่มีช่องโหว่โดยไม่รู้ตัว
- เป็นจุดเริ่มต้นที่ทำให้ prompt ต่อๆ ไป (auth guard) มีบริบทแน่นขึ้น 
  เพราะอ้างอิงจากข้อมูลจริงใน DECISIONS.md แทนที่จะเป็น assumption ลอยๆ

---

## Prompt ที่ไม่ได้ผลในตอนแรก (ต้องแก้ระหว่างทาง)

### ตัวอย่าง: ผูก e2e test เข้ากับ AppModule เต็ม

**Prompt เดิม:**
เขียน e2e test สำหรับ auth flow ที่ทดสอบผ่าน AppModule จริง 
ครอบ happy path + negative case (wrong audience, wrong issuer, expired, 
wrong algorithm)

**ปัญหาที่เจอ:**
Prisma 7 ใช้ WASM query compiler ที่มี dynamic `import()` ซึ่ง Jest 
(CJS mode) รันไม่ได้ — พอ agent ลอง wire test เข้ากับ AppModule เต็ม 
(ที่มี PrismaModule ติดมาด้วย) test ก็ fail ทันทีตั้งแต่ตอน bootstrap 
module ทั้งที่ auth guard เองไม่เกี่ยวกับ Prisma เลย

**วิธีแก้ (ชั่วคราว):**
ปรับ prompt ใหม่ให้ agent ใช้ minimal test module (แค่ AuthGuard + 
MeController โดยไม่ import AppModule เต็ม) ซึ่งแก้ปัญหาเฉพาะหน้าได้ 
และมีเหตุผลรองรับ (auth ไม่ต้องพึ่ง Prisma) แต่ยังเหลือหนี้ทางเทคนิค 
คือ test อื่นที่ผูกกับ AppModule เต็ม (เช่น test เดิมของ CRUD) 
จะเจอปัญหาเดียวกันทันทีที่เขียนขึ้นมา

**สิ่งที่ได้เรียนรู้**
ครั้งต่อไปควรถาม agent เช็ค dependency conflict (Prisma version vs 
test runner) ตั้งแต่ตอน scaffold แทนที่จะไปเจอตอนเขียน test — 
จะได้ตัดสินใจเรื่อง Jest config ตั้งแต่ต้น ไม่ต้องแก้ทีหลัง


**อัปเดต — แก้ปัญหาจริงแล้ว (ไม่ใช่แค่เลี่ยง):**

Root cause จริงไม่ใช่ Prisma generator format (schema ตั้ง `moduleFormat: 
"cjs"` ถูกอยู่แล้ว) แต่เป็น `tsconfig.json` ที่ตั้ง `"module": "nodenext"` 
ทำให้ ts-jest ปล่อย dynamic `import()` ผ่านไปตรงๆ แทนที่จะ downlevel เป็น 
`require()` — Jest CJS runtime เลยรันไม่ได้

**Fix จริง:** override compiler options เฉพาะตอน ts-jest transform ให้บังคับ
`module: "CommonJS"` (`test/jest-e2e.json` + `package.json` unit test config)
ทำให้ TS downlevel import เป็น require() ให้อัตโนมัติ ไม่ต้องพึ่ง 
`--experimental-vm-modules` และไม่ต้องแยก minimal test module อีกต่อไป

ผลคือ `app.e2e-spec.ts` ที่ import `AppModule` เต็ม (มี `PrismaModule` จริง) 
รันผ่านได้แล้ว — ของเดิมที่เขียนว่า "เหลือหนี้ทางเทคนิค" ตอนนี้ชำระแล้ว

**บทเรียนที่แท้จริง:**
เมื่อเจอ error ที่ stack trace ชี้ไปที่ dependency (เช่น Prisma) อย่ารีบสรุป
ว่า dependency นั้นเป็นสาเหตุ ควรไล่ดู compiler/transpiler settings 
(tsconfig, ts-jest config) ก่อน เพราะ error message ที่โผล่มาจาก 
`node_modules` มักมีต้นตอจริงอยู่ที่การตั้งค่าฝั่งเราเอง ไม่ใช่ตัว 
dependency พัง — การ debug ที่ดีคือไล่จาก config ของเราก่อน 
แล้วค่อยสงสัย dependency เป็นลำดับถัดไป

**ข้อควรระวังสำหรับขั้นตอนถัดไป (เขียนไว้กันลืม):**
Auth flow test ผ่านได้เพราะ AuthGuard บล็อกที่ 401 ก่อนถึง DB จริง — 
`$connect()` ของ pg adapter เป็น lazy connect เลยไม่ error แม้ไม่มี DB รัน 
อยู่ พอเขียน e2e test ของ `/collections` และ `/bookmarks` ที่มี query จริง 
(`prisma.collection.findMany()`) จะ**ต้องมี Postgres จริงรันอยู่** 
(ผ่าน Docker) ก่อนถึงจะทดสอบได้ — เตรียมเรื่องนี้ไว้ก่อนเขียน CRUD tests
