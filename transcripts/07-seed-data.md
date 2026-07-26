## Prompt 1
ช่วยเขียน Prisma seed script (prisma/seed.ts) ที่สร้างข้อมูลทดสอบ:

- User A (ownerId ใช้ sub claim จริงจาก test user ใน Auth0: 
  candidate@test.com — ถ้ายังไม่รู้ sub จริง ให้ query Auth0 หรือ 
  decode token ทดสอบมาดูก่อน)
  - 2 collections
  - 3-4 bookmarks กระจายในแต่ละ collection + 1 uncategorized

- User B (ownerId เป็น string สมมติที่ต่างจาก User A ชัดเจน 
  เช่น "test-user-b-fake-sub")
  - 1 collection
  - 2 bookmarks

จุดประสงค์คือให้มีข้อมูล 2 users แยกกันชัดเจน เพื่อทดสอบ 
ownership isolation ในขั้นตอน CRUD ต่อไป

เพิ่ม script "prisma:seed" ใน package.json ให้เรียกใช้ง่ายๆ

## Response 1
ผมไม่มี Auth0 credentials (client_id/secret หรือ Management API token) เก็บอยู่ในโปรเจกต์นี้เลย — เช็คแล้วไม่มีที่ไหนในโค้ด/.env/transcripts ให้ query tenant หรือ login แทน candidate@test.com ได้จริง เดา sub เองแล้วเขียนลง seed คงไม่ตรงกับของจริงและจะพังตอนทดสอบ ownership isolation ภายหลัง

AskUserQuestion
OUT
Your questions have been answered: "อยากได้ sub claim จริงของ candidate@test.com มาใส่ใน seed script ยังไง?"="ผมมี sub อยู่แล้ว จะพิมพ์ให้เลย". You can now continue with these answers in mind.
ได้เลยครับ พิมพ์ sub claim มาได้เลย (รูปแบบทั่วไปคือ auth0|xxxxxxxx หรือ email|xxxxxxxx)

## Prompt 2
ไม่มีสิทธิ์เข้า Auth0 Dashboard และยังไม่มี frontend auth flow ให้ login 
จริงเพื่อ decode sub claim ได้ตอนนี้ ให้เปลี่ยนไปใช้ placeholder แทน 
ตามนี้:

1. ใช้ ownerId เป็น placeholder string ที่ชัดเจนว่าไม่ใช่ค่าจริง เช่น:
   - User A: "auth0|PLACEHOLDER-CANDIDATE-REPLACE-ME"
   - User B: "auth0|PLACEHOLDER-USERB-REPLACE-ME"

2. เขียน comment เด่นชัดไว้บนสุดของ seed.ts อธิบายว่า:
   - ค่านี้เป็น placeholder ชั่วคราว
   - ต้องแทนที่ด้วย sub claim จริงหลังทำ frontend auth flow เสร็จ 
     (login ด้วย candidate@test.com แล้ว decode access token ที่ได้)
   - ห้ามลืมแก้ก่อน submit จริง เพราะถ้าไม่แก้ ownership test จะ 
     ทดสอบกับ user ปลอมที่ login จริงไม่ได้

3. เพิ่มบันทึกนี้ใน DECISIONS.md หรือ TODO section ใน AI_WORKFLOW.md 
   ด้วย ว่ามี pending item ที่ต้องกลับมาแก้: 
   "แทนที่ placeholder ownerId ด้วย sub จริงหลังทำ frontend login เสร็จ"

4. ดำเนินการ seed script ต่อได้เลยตามที่ออกแบบไว้ (2 collections + 
   3-4 bookmarks สำหรับ User A, 1 collection + 2 bookmarks สำหรับ User B)

เขียน seed script ให้เสร็จแล้วรัน prisma:seed ยืนยันว่าข้อมูลเข้า DB จริง

## Response 2
สรุป
backend/prisma/seed.ts — comment เด่นชัดบนสุดเตือนเรื่อง placeholder, สร้าง User A (2 collections, 5 bookmarks: 4 มี collection + 1 uncategorized) และ User B (1 collection, 2 bookmarks) แยกกันชัดเจน, idempotent (ลบเฉพาะ ownerId ที่ตรงก่อน insert ใหม่)
backend/prisma.config.ts — เพิ่ม migrations.seed: "tsx prisma/seed.ts"
ติดตั้ง tsx เป็น devDependency ใหม่ (ts-node ใช้ไม่ได้กับ generated client ของ Prisma 7 เพราะ nodenext-style .js→.ts extension resolution ที่ ts-node ในโหมด CJS handle ไม่ได้ — tsx เป็นตัวที่ Prisma เองแนะนำสำหรับ pattern นี้)
backend/package.json — เพิ่ม script "prisma:seed": "prisma db seed"
รัน npm run prisma:seed สำเร็จ แล้วเขียน query ทดสอบยืนยันจริง (ไม่ใช่แค่เชื่อ console.log): count ถูกต้อง, uncategorized bookmark มี 1 อันจริง, ไม่มี cross-owner leak — ผ่านหมด แล้วลบไฟล์ทดสอบทิ้ง
AI_WORKFLOW.md — เพิ่ม TODO section บันทึก pending item เรื่องต้องแทนที่ placeholder ด้วย sub จริงหลัง frontend login เสร็จ
พร้อมไปต่อ CRUD service/controller ได้เลย