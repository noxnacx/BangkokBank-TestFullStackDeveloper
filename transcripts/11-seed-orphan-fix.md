## Prompt 1
Seed สำเร็จแล้ว User A ผูกกับ sub จริงแล้ว 
(User B เป็น placeholder ต่อไปได้ ไม่ต้องแก้ เพราะมีไว้ทดสอบ 
ownership isolation ไม่ใช่ทดสอบ login จริง)

ยืนยัน query ว่า User A ใน DB ตอนนี้ผูกกับ sub จริงถูกต้อง 
แล้วรัน live smoke test เดิม (Collections/Bookmarks) ซ้ำอีกรอบ 
เพื่อยืนยันไม่มี regression จากการเปลี่ยน seed data

## Response 1
พบปัญหาจริงระหว่างยืนยัน: query DB แล้วเจอว่ามี 3 users ไม่ใช่ 2 — ข้อมูลเก่า 2 collections + 5 bookmarks ใต้ placeholder ตัวเก่า (auth0|PLACEHOLDER-CANDIDATE-REPLACE-ME) ยังตกค้างอยู่ ทั้งที่ seed สำเร็จแล้วสำหรับ sub จริง เหตุผล: seed script ลบข้อมูลเก่าแบบ scoped ด้วยค่า OWNER_A/OWNER_B ปัจจุบัน เท่านั้น พอ OWNER_A เปลี่ยนจาก placeholder เป็น sub จริง ข้อมูลใต้ placeholder ตัวเก่าเลยไม่มี logic ไหนรู้จักมันอีกต่อไป กลายเป็นขยะตกค้าง

แก้แล้ว: ลบ orphaned rows (5 bookmarks + 2 collections) ใต้ placeholder ตัวเก่าออก ยืนยันด้วย query ตรงว่าตอนนี้ User A ผูกกับ sub จริง auth0|62e089faea483987422db6cc ถูกต้อง — 2 collections, 5 bookmarks (4 มี collection + 1 uncategorized), ไม่มี cross-owner leak, User B ยังเป็น placeholder ตามที่ตั้งใจ (มีไว้ทดสอบ isolation ไม่ใช่ login จริง)

Live smoke test ซ้ำ — Collections + Bookmarks ทั้งสองชุดผ่านหมดผ่าน HTTP จริงด้วย JWT เซ็นจริง ไม่มี regression, unit tests 47/47 และ e2e regression 6/6 ผ่านปกติ — ลบไฟล์ scratch ทั้งหมดทิ้งแล้ว

บันทึกบทเรียนไว้ใน AI_WORKFLOW.md: ครั้งหน้าถ้าเปลี่ยนค่า seed ownerId อีก ต้องเช็ค orphaned rows ใต้ค่าเก่าด้วยเสมอ ไม่ใช่แค่เชื่อว่ารัน seed ซ้ำแล้วจบ
