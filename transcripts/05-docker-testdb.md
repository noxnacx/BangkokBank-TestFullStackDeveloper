## Prompt 1
ก่อนไป implement Prisma schema กับ CRUD ผมอยากเตรียม test database ก่อน

ช่วยตั้งค่า docker-compose.yml สำหรับรัน PostgreSQL ใน container 
สำหรับ dev/test พร้อม:
- port mapping ที่ไม่ชนกับ Postgres ที่อาจรันอยู่ในเครื่องอยู่แล้ว
- volume สำหรับ persist ข้อมูลระหว่าง restart
- ตั้ง DATABASE_URL ใน .env ให้ชี้มาที่ container นี้

อธิบายด้วยว่า e2e test ควรใช้ DB เดียวกับ dev หรือแยกกัน 
(เช่น DATABASE_URL_TEST คนละตัว) และเหตุผลของแต่ละทาง

## Response 1
backend/docker-compose.yml — Postgres 17 alpine เดียว:

port 5433:5432 — ไม่ชนกับ Postgres local ที่อาจรันบน 5432 อยู่แล้ว
named volume postgres_data — persist ข้ามการ restart/docker compose down (ข้อมูลหายเฉพาะตอนสั่ง down -v)
backend/.env — แก้ DATABASE_URL ให้ชี้ไป localhost:5433 (เดิมชี้ 5432) และเพิ่ม DATABASE_URL_TEST ใหม่

ยังไม่ได้รันจริงเพราะ Docker Desktop daemon ไม่ทำงานอยู่ตอนนี้ — docker compose config ยืนยันว่าไฟล์ syntax ถูกต้อง แต่ยังไม่ผ่านการต่อ connection จริง เปิด Docker Desktop แล้วรัน:


docker compose up -d
บอกผมได้เมื่อพร้อม จะรัน prisma migrate dev ยิงจริงให้ยืนยันอีกที

dev DB vs test DB — ทำไมเลือก schema แยก ไม่ใช่ container/database แยก
ใช้ container/database เดียวกัน แยกด้วย ?schema= แทน:

ทางเลือก	ข้อดี	ข้อเสีย
Container แยกกันคนละตัว	Isolation เต็มที่สุด, ทดสอบ migration บน DB สะอาดจริง 100%	ต้องดูแล 2 container, 2 volume, กิน resource มากกว่าโดยไม่จำเป็นสำหรับ dev เดี่ยว
Database แยก (คนละชื่อ) ใน container เดียว	Isolation ดี, backup/restore แยกกันได้	ต้องมี init script สร้าง DB ที่สองตอน container start ครั้งแรก — ซับซ้อนเกินความจำเป็น
Schema แยก (คนละ ?schema=) ใน database เดียว ← เลือกอันนี้	ไม่ต้องมี init script, Prisma รองรับผ่าน connection string param อยู่แล้ว, prisma migrate ยิงคนละ schema ได้อิสระ	Isolation อ่อนกว่า container แยก (share Postgres process/version เดียวกัน — แต่ dev/test ควรใช้ Postgres version เดียวกันอยู่แล้ว ไม่ใช่จุดที่ต้องแยก)
เหตุผลหลัก: e2e test ต้อง wipe/reset ข้อมูลระหว่าง test runs (เช่น deleteMany() ก่อนแต่ละ test) — ถ้าใช้ DB เดียวกับที่กำลัง dev ด้วยมือ (เช่น เปิด Prisma Studio ดูข้อมูลอยู่) test จะไปลบข้อมูลที่กำลังทำงานด้วย การแยกแค่ schema เป็นจุดคุ้มทุนที่สุด — ได้ isolation ที่พอเพียงสำหรับปัญหานี้ โดยไม่ต้องแบก container/volume เพิ่ม

ยังไม่ได้ wire ส่วนที่ทำให้ e2e test จริงอ่าน DATABASE_URL_TEST แทน DATABASE_URL (ต้องสลับ process.env.DATABASE_URL ใน jest setup ก่อน PrismaService ถูกสร้าง) → เก็บไว้ตอนเริ่มเขียน e2e ของ /collections//bookmarks จริง เพราะตอนนั้นจะเห็นชัดว่า setup/teardown ต้องการอะไรบ้าง

## Prompt 2
เปิด Docker Desktop แล้ว รัน docker compose up -d และ prisma migrate dev
เพื่อยืนยันว่า container กับ DATABASE_URL เชื่อมกันได้จริงได้เลย

## Response 2
ยืนยันครบทุกจุด:

- `docker compose up -d` — ดึง image `postgres:17-alpine`, container `backend-postgres-1` ขึ้นบน port `5433` สำเร็จ
- `pg_isready` — container ตอบ "accepting connections"
- `prisma migrate dev` ด้วย `DATABASE_URL` ปกติ — เชื่อมต่อ `mydb` schema `public` ที่ `localhost:5433` ได้จริง (schema ยังไม่มี model เลยรายงาน "already in sync" ซึ่งถูกต้อง)
- `prisma migrate dev` ด้วย `DATABASE_URL_TEST` (override ชั่วคราวตอนรันคำสั่ง) — เชื่อมต่อ schema `test` บน database เดียวกันได้เช่นกัน ยืนยันว่าแยก schema ใช้งานได้จริงตามที่ออกแบบไว้
- รัน `npm run test:e2e` ซ้ำตอนมี DB จริงอยู่เบื้องหลัง (ก่อนหน้านี้ผ่านตอนไม่มี DB เพราะ lazy connect) — ผ่านครบ 2 suites/6 tests เหมือนเดิม ไม่มี regression

Container ปล่อยรันต่อไว้ใช้งานได้เลย (`docker compose down` เมื่อเลิกใช้ — ข้อมูลไม่หายเพราะอยู่ใน volume `postgres_data`, หายเฉพาะตอนสั่ง `down -v`)