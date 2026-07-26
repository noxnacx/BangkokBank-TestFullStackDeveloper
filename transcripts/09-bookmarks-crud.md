## Prompt 1
ตอนนี้ทำ BookmarksModule ต่อ ใช้ pattern เดียวกับ CollectionsModule เป๊ะ:
- ownership filter ที่ query level (where: { id, ownerId })
- atomic update/delete
- DTO + validation แบบเดียวกัน (ValidationPipe ที่ตั้งไว้แล้วเป็น global)

เพิ่มเติมเฉพาะของ Bookmark:
- collectionId เป็น optional ใน DTO (nullable ตาม schema) — ถ้าระบุมา 
  ต้องเช็คด้วยว่า collection นั้นเป็นของ user เดียวกันจริงไหม ก่อน 
  create/update (กันกรณี user A เอา collectionId ของ user B มาใส่ 
  bookmark ตัวเอง — ต้อง reject ด้วย error code ที่เหมาะสม พร้อมอธิบาย
  เหตุผลว่าทำไมเลือก 404 หรือ 400)
- filter by collectionId ใน GET /bookmarks (query param เช่น 
  ?collectionId=xxx)

เขียน unit test ครอบ negative case เพิ่มเติม: 
- user A พยายามใส่ collectionId ของ user B ใน bookmark ของตัวเอง → ต้อง fail
- user A พยายามเข้าถึง/แก้/ลบ bookmark ของ user B → ต้อง 404

Verify ด้วย live smoke test เหมือนที่ทำกับ Collections (ยิง HTTP จริง 
ผ่าน JWT จริง ไม่ใช่ mock)

## Response 1
สรุป
Files: src/bookmarks/ — bookmarks.service.ts, bookmarks.controller.ts, bookmarks.module.ts, DTO 4 ไฟล์ (create/update/patch/list-query), unit test 2 ไฟล์ (26 tests) — pattern เดียวกับ Collections เป๊ะ (query-level ownership filter, atomic update/delete ผ่าน P2025 catch)

collectionId cross-ownership — เลือก 400 ไม่ใช่ 404
assertCollectionOwnership() เช็คด้วย collection.findUnique({ where: { id: collectionId, ownerId } }) — collectionId ที่ไม่มีจริง กับที่เป็นของ user อื่น คืน null เหมือนกัน (ไม่รั่วว่า collection นั้น "มีอยู่จริงแต่ไม่ใช่ของคุณ" หรือ "ไม่มีอยู่เลย")

เลือก 400 เพราะ resource ที่ URL ชี้ถึง (/bookmarks หรือ /bookmarks/:id) หาเจอปกติ — ปัญหาอยู่ที่ field ใน body ที่ส่งมาไม่ valid สำหรับ user นี้ ตรงกับความหมายมาตรฐานของ 400 (invalid input) มากกว่า 404 ซึ่งควรสงวนไว้กับ "ไม่พบ resource ตาม URL path" (แบบที่ /collections/:id และ /bookmarks/:id ใช้อยู่) — แยกความหมายชัดเจน: 404 = "path นี้ไม่มี", 400 = "ข้อมูลใน body ใช้ไม่ได้"

Semantics ที่เพิ่มจาก Collections: PUT vs PATCH กับ nullable field
Bookmark มี field nullable สองตัว (notes, collectionId) ต่างจาก Collection ที่มีแค่ name field เดียว เลยต้องแยก:

PATCH — field ที่ไม่ส่งมา = ไม่แตะ (undefined ให้ Prisma ข้าม), ส่ง null ตรงๆ = เคลียร์ค่า (ใช้ @IsOptional() ที่ยอมทั้ง undefined/null เฉยๆ ไม่ต้องมี flag พิเศษ)
PUT — full replace: ไม่ส่ง notes/collectionId มา = เคลียร์เป็น null (ทำใน service ด้วย ?? null) เพราะ PUT คือประกาศ state ทั้งหมดใหม่
Verify แล้วจริง
npm test — 47/47 (รวม negative case ที่ขอ: user A ใส่ collectionId ของ B → 400 ไม่ถูกสร้าง/ไม่ถูกแก้; user A เข้าถึง/แก้/ลบ bookmark ของ B → 404)
tsc --noEmit clean, test:e2e regression เดิม 6/6 ผ่าน
Live smoke test ผ่าน HTTP จริงด้วย JWT เซ็นจริง (ไม่ใช่ mock) บน DB จริง: สร้าง collection ของ A และ B, ยืนยัน A เอา collectionId ของ B มาสร้าง/ย้าย bookmark ไม่ได้ (400, ไม่ถูกสร้าง/ไม่ถูกย้ายจริง), ยืนยัน B มองไม่เห็น/แก้ไม่ได้/ลบไม่ได้ bookmark ของ A เลย (404 ทุกท่า, ไม่โผล่ใน list ของ B), PUT เคลียร์ collectionId เป็น null จริงตามที่ออกแบบ — ผ่านหมด ลบไฟล์ scratch ทิ้งแล้ว
พร้อมไปต่อ frontend หรือ auth flow จริงได้เลย