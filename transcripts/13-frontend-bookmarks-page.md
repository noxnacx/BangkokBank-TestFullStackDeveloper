## Prompt 1
ตอนนี้ทำหน้า /bookmarks ต่อ ใช้ pattern เดียวกับ /collections เป๊ะ:
- RequireAuth guard เดิม
- api/bookmarks.ts แยก pure function เหมือน api/collections.ts

เพิ่มเติมเฉพาะของ bookmarks:
- filter by collection (dropdown เลือก collection ที่มี หรือ 
  "uncategorized" หรือ "ทั้งหมด")
- ฟอร์ม create ต้องมี url, title (required), notes (optional), 
  collectionId (optional dropdown)
- แสดง view detail ผ่าน Dialog เหมือนเดิม

Verify ด้วย Playwright เหมือนที่ทำกับ Collections ครบทุก flow 
(list, create, filter, view detail, delete)

## Response 1
สรุป
หน้า /bookmarks — src/pages/Bookmarks.tsx, src/api/bookmarks.ts, pattern เดียวกับ Collections เป๊ะ (RequireAuth, error handling รวมศูนย์ที่ 401)

Refactor เล็กน้อยที่จำเป็น: ดึง ApiError/parseJsonOrThrow ที่ซ้ำกันระหว่าง api/collections.ts กับ api/bookmarks.ts ออกเป็น src/api/http.ts ใช้ร่วมกัน — เป็นจุดที่ DRY สมเหตุสมผลเพราะมี 2 caller จริงแล้ว ไม่ใช่ premature abstraction

เรื่องเฉพาะของ Bookmarks
Filter by collection — ไม่ได้ทำ server-side filter สำหรับ "Uncategorized" เพราะ backend รองรับแค่ filter ด้วย collectionId จริงตัวเดียว ไม่มี concept "uncategorized" ให้ query แต่แรก แก้แบบง่ายสุด: fetch bookmarks ทั้งหมดครั้งเดียว แล้ว filter ฝั่ง client ด้วย useMemo (ครอบคลุมทั้ง all/uncategorized/collection เฉพาะ ด้วย logic เดียว ไม่ต้องเพิ่ม endpoint ใหม่)
Create form ใช้ MUI Select แบบเดียวกับ filter dropdown ดึงรายชื่อ collection จาก listCollections() (reuse จาก Collections page)
เจอบั๊กเล็กน้อยระหว่างเขียน Playwright script (ไม่ใช่บั๊กแอป)
คลิก label ของ MUI Select ไม่เปิด dropdown จริง (overlay บัง click) ต้องเปลี่ยนไปคลิกผ่าน accessible role combobox แทน — เป็นเรื่องของสคริปต์ทดสอบเอง ไม่ใช่ปัญหาของหน้าเว็บ

Verify ครบทุก flow ที่ขอ (Playwright, JWT จริง, ต่อ backend+DB จริง)
List — เห็นข้อมูล seed จริงถูกต้อง (Hacker News, Bookmark (Wikipedia) ใน Reading list, NestJS/Prisma docs ใน Work references, Uncategorized example ไม่มี collection)
Create พร้อมเลือก collection — ปรากฏใน list ทันที
Filter by "Reading list" — เจอ bookmark ที่เพิ่งสร้างถูกต้อง
Filter by "Uncategorized" — bookmark ที่เพิ่งสร้าง (มี collection) หายไปถูกต้อง เหลือแค่ seed's uncategorized ตัวเดียว
View detail ผ่าน Dialog — โชว์ title/url/notes/collection name (resolve จาก id เป็นชื่อถูกต้อง)/id/timestamps ครบ
Delete พร้อม confirmation — ลบสำเร็จ หายจาก list จริง
ไม่มี page error ตลอด flow — ลบไฟล์ scratch และปิด dev server ทั้งหมดเรียบร้อยแล้ว (ยืนยัน port 3000/3001 ว่างจริงด้วย netstat ตามบทเรียนจากรอบก่อน)