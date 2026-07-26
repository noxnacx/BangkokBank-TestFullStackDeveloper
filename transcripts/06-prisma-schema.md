## Prompt 1
ตอนนี้พร้อมเขียน Prisma schema จริงแล้ว (มี Postgres test DB พร้อมใช้แล้ว)

ช่วยเขียน schema.prisma สำหรับ 2 model นี้:

model User (ไม่ต้องมีตาราง User จริงก็ได้ ถ้า ownerId อ้างอิงจาก 
Auth0 sub claim โดยตรงโดยไม่ต้อง sync user มาเก็บใน DB เอง — 
ช่วยแนะนำว่าควรมีตาราง User แยกไหม หรือใช้ ownerId เป็น string 
ที่ผูกกับ sub claim ตรงๆ พอ พร้อมอธิบายเหตุผล)

model Collection:
- id, name, ownerId, createdAt, updatedAt

model Bookmark:
- id, url, title, notes (nullable), collectionId (nullable), 
  ownerId, createdAt, updatedAt
- ความสัมพันธ์: bookmark เป็นของ collection ได้ (nullable), 
  ทั้งคู่เป็นของ user คนเดียว (ownerId)

กำหนด:
- ใส่ index บน ownerId ทั้งสอง model (เพราะทุก query ต้อง filter 
  ด้วย ownerId เสมอ ตามที่ตกลงไว้เรื่อง privacy invariant)
- ตัดสินใจว่า relation collection-bookmark ตอนลบ collection 
  ควรเป็น onDelete แบบไหน (Cascade, SetNull, Restrict) แล้วอธิบาย
  trade-off ของแต่ละแบบ — ยังไม่ต้องฟันธงตอนนี้ เสนอตัวเลือกมาก่อน 
  ผมจะตัดสินใจเอง (เพราะเกี่ยวกับโจทย์กำกวมเรื่อง "user อาจอยากแชร์ 
  collection" ที่ต้องคิดร่วมกัน)

ยังไม่ต้อง migrate จริงตอนนี้ ขอดู schema ก่อน

## Response 1
prisma/schema.prisma — validated, ยังไม่ migrate

model Collection {
  id        String     @id @default(cuid())
  name      String
  ownerId   String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  bookmarks Bookmark[]

  @@index([ownerId])
}

model Bookmark {
  id           String      @id @default(cuid())
  url          String
  title        String
  notes        String?
  ownerId      String
  collectionId String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)

  @@index([ownerId])
}
id เป็น String @default(cuid()) — เลือกเพราะ frontend/test generate ID ล่วงหน้าได้โดยไม่ต้อง round-trip ไป DB ก่อน ถ้าไม่ต้องการ ปรับเป็น Int @default(autoincrement()) ก็ได้ (native serial, ง่ายกว่า)

User model — แนะนำไม่ต้องมี
ownerId เป็น string ที่ผูกกับ Auth0 sub ตรงๆ ไม่ sync user เข้า DB เอง เหตุผล:

JWT ถูก verify ครบแล้วใน AuthGuard (signature/aud/iss/exp) — sub ที่ได้มาเชื่อถือได้อยู่แล้ว ไม่ต้องมีตาราง User มาเป็น "แหล่งความจริง" ซ้ำ Auth0 เป็นเจ้าของ identity คนเดียวพอ
ไม่มี local profile data (ชื่อ, email, preference) ที่ต้องเก็บตอนนี้ — ถ้าจะมีใน Collection/Bookmark เพียงพอแล้ว ไม่ต้อง sync (YAGNI)
ข้อเสียของการไม่มี FK: Prisma บังคับ referential integrity บน ownerId ไม่ได้ — แต่จริงๆ ก็ไม่มีอะไรให้บังคับ เพราะ "user ที่ valid" คือ Auth0 sub ไม่ใช่ row ในตารางเรา
จุดที่ควรกลับมาคิดใหม่: ถ้าทำ feature แชร์ collection (many-to-many owners) ตอนนั้นน่าจะต้องมี join table (เช่น CollectionMember{ collectionId, ownerId, role }) — แต่ก็ยังไม่จำเป็นต้องมี User model เต็ม แค่ ownerId string column ใน join table ก็พอ เว้นแต่ต้องโชว์ชื่อ/อีเมลสมาชิกโดยไม่ยิง Auth0 Management API ทุกครั้ง
onDelete สำหรับ Bookmark.collectionId — 3 ทางเลือก (ยังไม่ฟันธง)
ใน schema ตอนนี้ใส่ SetNull ไว้เป็น placeholder ที่ปลอดภัยที่สุด เพื่อให้ validate ผ่านเฉยๆ ยังไม่ใช่ตัวสุดท้าย — สลับได้ก่อน migrate จริง

ทางเลือก	พฤติกรรม	ข้อดี	ข้อเสีย
Cascade	ลบ collection → bookmark ในนั้นหายไปด้วย	Mental model ง่าย: "collection เป็นเจ้าของ bookmark"	ทำลายข้อมูล user โดยไม่ให้กู้คืน แค่กดลบ collection เดียวลบ bookmark ได้หลายอัน; ถ้าอนาคตมี sharing collection ระหว่างหลาย user การลบของคนหนึ่งจะไปลบข้อมูลของอีกคนโดยไม่รู้ตัว — ขัดกับ privacy invariant (ownerId filter) ที่ตกลงกันไว้
SetNull (ที่ใส่ไว้ตอนนี้)	ลบ collection → bookmark ไม่หาย แค่ collectionId กลายเป็น null (ไม่มี collection)	ปลอดภัยสุด, ตรงกับที่ collectionId ออกแบบเป็น nullable อยู่แล้ว (แปลว่า "ไม่มี collection" เป็นสถานะที่ถูกต้องอยู่แล้ว)	ผู้ใช้อาจงงถ้าเจอ bookmark "ลอย" หลังลบ collection โดยไม่มี trail ว่าเคยอยู่ไหน — UI ต้องโชว์ "uncategorized" ให้ชัด
Restrict	ลบ collection ไม่ได้ถ้ายังมี bookmark อ้างอิงอยู่ ต้อง reassign/ลบ bookmark ออกก่อน	กันการลบพลาดแบบสุดขั้ว บังคับ user ตัดสินใจทีละ bookmark	เพิ่ม UX step (ต้องมี flow ย้าย bookmark ออกก่อน), backend ต้อง handle DB constraint error เป็น 409
ประเด็นที่เกี่ยวกับโจทย์กำกวมเรื่อง sharing: ถ้าจะมี sharing แน่ๆ ในอนาคต Restrict ปลอดภัยระยะยาวกว่า (ไม่มีใครลบข้อมูลคนอื่นโดยไม่ตั้งใจ) ถ้ายังไม่มี sharing ตอนนี้ SetNull คุ้มที่สุด (ปลอดภัย + ไม่ต้องเพิ่ม UX flow) — บอกได้เลยว่าจะเอาแบบไหน จะแก้ schema ให้ตรงกับที่ตัดสินใจ

## Prompt 2
เลือก SetNull ตามที่ schema ตั้งไว้อยู่แล้ว (ไม่ต้องแก้)

เหตุผล: ตรงกับ collectionId ที่ออกแบบเป็น nullable อยู่แล้ว 
(uncategorized คือสถานะปกติ) และไม่อยากให้การลบ collection เดียว 
ทำลาย bookmark หลายอันแบบเงียบๆ ไว้ค่อยพิจารณา Restrict ใหม่ถ้าทำ 
feature sharing จริง

ช่วยสรุปเหตุผลทั้ง 2 เรื่องนี้ (ไม่มี User model + onDelete: SetNull) 
เป็น draft สั้นๆ ใส่ DECISIONS.md ต่อจากเรื่อง token choice

จากนั้น migrate จริงได้เลย แล้วรัน npx prisma studio หรือ query ทดสอบ 
เบาๆ เพื่อยืนยันว่า schema ใช้งานได้จริงกับ DB ที่เตรียมไว้

## Response 2
DECISIONS.md — เพิ่ม 2 entries ต่อจากเรื่อง token choice: ไม่มี User model (ownerId ผูก Auth0 sub ตรงๆ) และ onDelete: SetNull พร้อมเหตุผลและจุดที่ต้องทบทวนใหม่ (feature sharing collection)

Migrate จริงแล้ว — ทั้ง schema public (dev) และ test (สำหรับ e2e ในอนาคต) ผ่าน migration add_collection_bookmark เรียบร้อย, prisma generate สร้าง client ใหม่ครอบ Collection/Bookmark แล้ว

ยืนยันด้วย query จริง (ไม่ใช่ prisma studio เพราะเป็น GUI ค้างเทอร์มินัล) — สร้าง collection + bookmark ผูกกัน, ลบ collection, เช็คว่า bookmark.collectionId กลายเป็น null จริงตามที่ตั้ง SetNull ไว้ — ผ่าน แล้วลบไฟล์ทดสอบทิ้ง (เป็น scratch file ไม่ใช่ suite ถาวร)

Regression check — test:e2e (6 tests) และ test (5 tests) ยังผ่านครบหลัง client เปลี่ยน ไม่มีอะไรพัง

พร้อมเขียน CRUD service/controller สำหรับ /collections และ /bookmarks ต่อได้เลย