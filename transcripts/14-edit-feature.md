## Prompt 1
เพิ่มปุ่ม Edit ในหน้า /collections และ /bookmarks:
- /collections: form แก้ name (เรียก PUT หรือ PATCH — เลือกอันที่เหมาะกับ 
  ฟอร์มเดียวที่มี field เดียว)
- /bookmarks: form แก้ url/title/notes/collectionId (เรียก PATCH 
  สำหรับ partial edit)

ใช้ Dialog เดียวกับที่มีอยู่แล้วสำหรับ view detail แค่เพิ่ม editable 
mode แทนที่จะสร้าง component ใหม่

Verify ด้วย Playwright เหมือนที่ผ่านมา

## Response 1
สรุป
Edit ผ่าน Dialog เดิม — ไม่ได้สร้าง component ใหม่ แค่เพิ่ม isEditing state ให้ DialogContent/DialogActions เดิม render แบบ conditional (static view ↔ edit form) ตามที่ขอ

API ที่เพิ่ม
api/collections.ts: updateCollection(id, name) — PUT เพราะ Collection มี field เดียว (name) และฟอร์ม edit ส่งค่าเต็มเสมอ ไม่มีเคส "บาง field ไม่ส่ง" ที่ PATCH มีไว้จัดการ
api/bookmarks.ts: updateBookmark(id, input) — PATCH ตามที่ขอ ฟอร์ม edit ส่งทุก field เสมอ (notes/collectionId เป็น null ชัดเจนเวลาเคลียร์ค่า ไม่ใช่ omit — ตรงกับ semantics ที่ backendออกแบบไว้ตั้งแต่ต้น: omit=ไม่แตะ, null=เคลียร์)
เจอปัญหาเล็กน้อยตอนเขียน Playwright script (ไม่ใช่บั๊กแอป)
getByLabel('Name') แบบไม่ scope ไป match ทั้ง field "Name" ในฟอร์ม edit และ "New collection name" ในฟอร์ม create ด้วย (substring match) แก้โดย scope locator ไปที่ [role="dialog"] ก่อนเสมอ

Verify ครบ (Playwright, JWT จริง, DB จริง)
Collections: สร้าง → เปิด detail → กด Edit → แก้ name → Save → dialog แสดงชื่อใหม่ถูกต้อง + list refresh เห็นชื่อใหม่ทันที → ลบทิ้ง
Bookmarks: สร้างแบบไม่มี collection/notes → เปิด detail → กด Edit → แก้ title + เพิ่ม notes + ผูก collection "Reading list" → Save → dialog แสดงค่าทั้งหมดถูกต้องครบ (title/notes/collection) → ยืนยันด้วยว่า filter "Reading list" เห็น bookmark นี้จริงหลัง edit (พิสูจน์ collectionId เปลี่ยนจริง) → ลบทิ้ง
ไม่มี page error ตลอด flow, unit tests 47/47 + e2e regression 6/6 ผ่านปกติ
พบ collection ค้าง 1 อันจาก run แรกที่พังก่อนแก้ script (ไม่เกี่ยวกับโค้ดแอป) — ลบออกจาก DB เรียบร้อยแล้ว, ลบไฟล์ scratch ทั้งหมดทิ้งแล้วเช่นกัน

Dev servers (frontend :3000, backend :3001) ยังรันอยู่เผื่อจะทดสอบต่อ — บอกได้ถ้าอยากให้ปิด