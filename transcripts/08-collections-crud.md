## Prompt 1
ตอนนี้พร้อมเขียน CRUD สำหรับ /collections แล้ว

ช่วยสร้าง CollectionsModule (controller + service + DTOs) ที่รองรับ:
- GET /collections — list ทั้งหมดของ user ที่ login อยู่ (filter ownerId 
  จาก request.user.ownerId เสมอ)
- GET /collections/:id — get one, ถ้าไม่ใช่ของ user นี้หรือไม่มีจริง 
  return 404 (ไม่ใช่ 403 — กัน information leak)
- POST /collections — create (ownerId เอาจาก token ไม่รับจาก body)
- PUT /collections/:id — full update
- PATCH /collections/:id — partial update
- DELETE /collections/:id
- GET /collections/:id/bookmarks — bookmarks ทั้งหมดใน collection นี้ 
  (ownership check เดียวกัน)

กำหนด:
- ใช้ DTO + class-validator สำหรับ validate input ทุก endpoint ที่รับ body
- Error response ต้องมี shape เดียวกันทุก endpoint (เช่น 
  { statusCode, message, error })
- ทุก query ต้อง filter ด้วย ownerId จาก request.user เสมอ ห้ามลืมจุดไหน
- อธิบายเหตุผลที่เลือก error handling pattern นี้

เขียน unit test คู่กันไปเลย โดยเฉพาะ negative case: 
พยายามเข้าถึง/แก้/ลบ collection ของ user อื่น ต้อง fail (404)

## Response 1
สรุป
Files:

src/collections/collections.service.ts, collections.controller.ts, collections.module.ts
dto/create-collection.dto.ts, update-collection.dto.ts (extends create — PUT ทับด้วย shape เดียวกัน), patch-collection.dto.ts (optional field)
ติดตั้ง class-validator/class-transformer (ยังไม่มีในโปรเจกต์)
app.module.ts — เพิ่ม CollectionsModule + global ValidationPipe({whitelist, forbidNonWhitelisted, transform}) ผ่าน APP_PIPE (แบบเดียวกับที่ AuthGuard ผูกผ่าน APP_GUARD)
24 unit tests ใน collections.service.spec.ts + collections.controller.spec.ts
Ownership pattern — ทำไม 404 ไม่ใช่ 403 แบบมีหลักประกันจริง
ทุก query filter ownerId ที่ตัว query เอง ไม่ใช่ fetch มาก่อนแล้วเช็คทีหลัง:

findOne/findBookmarks: findUnique({ where: { id, ownerId } }) — ของคนอื่นกับไม่มีจริง คืนค่า null เหมือนกันทุกที่ ไม่มี code path ไหนที่แยกสองเคสนี้ออกจากกันได้เลย (กัน info leak โดยโครงสร้าง ไม่ใช่แค่ by convention)
update/remove: update/delete({ where: { id, ownerId } }) — ใช้ Prisma's "extended where" (ยืนยันจาก type CollectionWhereUniqueInput ว่ารองรับ) ทำเป็น query เดียว atomic ไม่มี race condition ระหว่าง check กับ mutate; ถ้าไม่ match จะได้ Prisma error P2025 ซึ่ง service แปลงเป็น NotFoundException
Error shape — ทำไมไม่เขียน custom exception filter
Nest's default filter คืน { statusCode, message, error } ให้ทุก HttpException (รวม NotFoundException, และ BadRequestException ที่ ValidationPipe throw เอง) อยู่แล้วโดยอัตโนมัติ — เขียน filter เองจะเป็นการสร้างสิ่งที่ framework ให้ฟรีซ้ำ สิ่งที่ต้องระวังจริงคือ throw ผ่าน HttpException subclass เสมอ ไม่ปล่อย error ดิบหลุดออกไป (Prisma error ถูกจับแปลงเป็น NotFoundException ในทุกจุดแล้ว)

ยืนยันแล้วจริง ไม่ใช่แค่เขียน
npm test — 24/24 ผ่าน (รวม negative case: get/patch/put/delete ของ collection คนอื่น → 404 เสมอ, create ไม่รับ ownerId จาก DTO)
npm run test:e2e — regression เดิม 6/6 ผ่าน
tsc --noEmit -p tsconfig.build.json — clean (มี pre-existing type error ใน test/auth-flow.e2e-spec.ts เรื่อง jose's KeyLike export ที่ไม่เกี่ยวกับงานนี้ ไม่ได้แตะ)
รัน live smoke test จริงผ่าน DB (ไม่ใช่ mock): sign JWT จริงด้วย local JWKS server (pattern เดียวกับ auth-flow.e2e-spec.ts), ยิง POST/GET/PATCH/PUT/DELETE จริงผ่าน HTTP บน CollectionsController เต็ม — พบว่า forbidNonWhitelisted: true reject body ที่มี ownerId แปลกปลอมด้วย 400 ทันที (เข้มกว่าที่คาดไว้ตอนแรกว่าจะแค่ strip ทิ้งเงียบๆ) แล้วยืนยันด้วยว่า user อื่นเข้าถึง/แก้/ลบไม่ได้เลยสักท่า (404 ทุกอัน) — ผ่านหมด ลบไฟล์ scratch ทิ้งแล้ว
พร้อมทำ BookmarksModule ต่อได้เลย