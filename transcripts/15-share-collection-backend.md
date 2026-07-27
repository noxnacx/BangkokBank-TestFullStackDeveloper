## Prompt 1
ตอนนี้ Edit feature เสร็จแล้ว ไปทำ share collection ต่อ (ตอบโจทย์ 
requirement กำกวมข้อ 3.3)

Implement แบบ read-only share link (ไม่ใช่ full multi-owner):

Backend:
1. เพิ่ม field shareToken (nullable, unique) ใน Collection model — 
   migrate schema
2. POST /collections/:id/share — generate share token แบบสุ่ม 
   (crypto-secure) เก็บลง shareToken, ต้อง auth เป็นเจ้าของ collection 
   เท่านั้นถึงจะ generate ได้ (ownership check แบบเดิม)
3. GET /shared/:token — public endpoint (ไม่ต้อง auth เลย) คืนข้อมูล 
   collection + bookmarks ข้างในแบบ read-only เท่านั้น ไม่มี update/
   delete ผ่านทางนี้เด็ดขาด
4. DELETE /collections/:id/share — revoke token (เซ็ต shareToken 
   กลับเป็น null)

สำคัญมาก: endpoint /shared/:token ต้อง scope แค่ collection เดียวที่ 
token นั้นผูกอยู่เท่านั้น ห้ามเปิดช่องให้เข้าถึงข้อมูลอื่นของเจ้าของ
ได้เลยแม้แต่นิดเดียว

เขียน test ครอบ: 
- generate token ได้เฉพาะเจ้าของ (คนอื่น generate ไม่ได้ → 404)
- เข้าดูผ่าน token ถูกต้อง → เห็นข้อมูล read-only
- token ผิด/ไม่มี token → 404
- ผ่าน /shared/:token ไม่สามารถ update/delete อะไรได้เลย 
  (ไม่มี endpoint ให้ mutate ผ่านทางนี้)
- revoke แล้ว token เดิมใช้ไม่ได้อีก

ยังไม่ต้องทำ frontend UI ตอนนี้ ขอ backend ก่อน

## Response 1
สรุป
Schema: Collection.shareToken: String? @unique — migrate ทั้ง schema public (dev) และ test เรียบร้อย

Backend files:

src/auth/public.decorator.ts — @Public() decorator ใหม่
src/auth/auth.guard.ts — แก้ให้เช็ค @Public() ผ่าน Reflector ก่อน verify JWT (endpoint อื่นทั้งหมดยัง require auth เหมือนเดิม)
src/collections/collections.service.ts — เพิ่ม createShareLink, revokeShareLink, getSharedView
src/collections/collections.controller.ts — เพิ่ม POST/DELETE :id/share
src/collections/shared.controller.ts — controller ใหม่แยกต่างหาก มีแค่ GET :token เท่านั้น (ไม่มี mutate method เลยแม้แต่ตัวเดียว — read-only ที่ระดับ routing ไม่ใช่แค่ business logic)
จุดสำคัญด้าน security
Scope แน่นแบบ safe-by-construction: getSharedView หา collection ด้วย shareToken เท่านั้น (ไม่แตะ ownerId เลย) แล้ว query bookmarks scope ด้วย collectionId ของ collection นั้นตรงๆ — ไม่มีทางเห็น collection อื่นของเจ้าของคนเดียวกันได้
404 ไม่ใช่ 403 สำหรับ generate/revoke โดยคนที่ไม่ใช่เจ้าของ — ตรง pattern เดิมทั้งระบบ
ไม่โชว์ ownerId/shareToken ใน public response — เลือก field ที่ return แบบ explicit ทีละตัว ไม่ spread ทั้ง object
Verify ครบทุกข้อที่ขอ (unit + live smoke test บน DB จริง, JWT เซ็นจริง)
generate token ได้เฉพาะเจ้าของ — user อื่น → 404 ✓
เข้าดูผ่าน token ถูกต้อง (ไม่มี Authorization header เลย) → 200 เห็นแค่ collection+bookmarks ของ token นั้น ✓
token ผิด/ไม่เคยออก → 404 ✓
สร้าง collection ที่สองไม่แชร์ไว้คู่กัน (secret) ยืนยันว่าไม่หลุดออกมาใน response เลยแม้แต่คำเดียว ✓
ยิง PUT/PATCH/DELETE/POST ไปที่ /shared/:token → 404 ทุกตัว (route ไม่มีอยู่จริง) ข้อมูลจริงไม่ถูกแตะ ✓
revoke แล้ว token เดิมตายทันที, collection เดิมไม่ถูกกระทบ ✓
Unit tests 58/58, e2e regression 6/6 ผ่านปกติ, ลบไฟล์ scratch ทั้งหมดแล้ว, อัปเดต API_DESIGN.md เพิ่ม section "Collection sharing" ตาม pattern เดิมของไฟล์ — ยังไม่ทำ frontend UI ตามที่ขอ