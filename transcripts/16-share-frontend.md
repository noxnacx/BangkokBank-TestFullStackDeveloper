## Prompt 1
ตอนนี้ backend ของ share collection เสร็จแล้ว ไปทำ frontend UI ต่อ

เพิ่มใน Collections.tsx (หน้า /collections):
1. ในหน้า detail Dialog เดิม เพิ่มปุ่ม "Share" — กดแล้วเรียก 
   POST /collections/:id/share แล้วแสดง share link เต็ม (เช่น 
   http://localhost:3000/shared/{token}) พร้อมปุ่ม copy to clipboard
2. ถ้า collection มี shareToken อยู่แล้ว (เช่นโหลด detail แล้วเจอว่า 
   generate ไว้แล้ว) ให้โชว์ link เดิมแทนที่จะ generate ใหม่ทุกครั้ง
3. ปุ่ม "Revoke" ให้ยกเลิก share link (เรียก DELETE .../share) 
   พร้อม confirmation dialog

สร้างหน้าใหม่ /shared/:token (public route ไม่ต้อง login ผ่าน 
RequireAuth):
1. เรียก GET /shared/:token (ไม่แนบ Bearer token เพราะ public)
2. แสดงชื่อ collection + list bookmarks ข้างใน แบบ read-only 
   (ไม่มีปุ่ม edit/delete ใดๆ ทั้งสิ้น)
3. ถ้า token ผิด/ถูก revoke ไปแล้ว (404) ให้แสดงข้อความที่เหมาะสม 
   เช่น "This share link is invalid or has been revoked"

Verify ด้วย Playwright: generate link → เปิดใน context ใหม่ที่ไม่มี 
session (จำลอง user อื่นที่ไม่ได้ login) → เห็นข้อมูล read-only ถูกต้อง 
→ revoke → เปิด link เดิมอีกครั้ง → เห็น error message ที่ถูกต้อง

## Response 1
สรุป
Frontend files:

api/collections.ts — เพิ่ม shareToken ใน type, createShareLink()/revokeShareLink()
api/shared.ts — ใช้ fetch ตรงๆ ไม่ผ่าน apiFetch เพราะ apiFetch เรียก getTokenSilently() ก่อนเสมอ ซึ่งจะพังสำหรับ visitor ที่ไม่เคย login เลย (ขัดกับเจตนาของ public share link)
pages/Collections.tsx — เพิ่ม Share/Copy/Revoke ใน detail Dialog เดิม (ไม่สร้าง component ใหม่), ปุ่ม "Share" โผล่เฉพาะตอน shareToken เป็น null, ถ้ามีอยู่แล้วโชว์ลิงก์เดิมทันที (จาก field ที่มากับ GET /collections/:id อยู่แล้ว ไม่ต้อง generate ซ้ำ), Revoke มี confirmation dialog แยกต่างหาก
pages/Shared.tsx — หน้าใหม่ public, ไม่มี edit/delete ใดๆ, จับ 404 แสดงข้อความที่ขอเป๊ะ
App.tsx — route /shared/:token ไม่ครอบ RequireAuth
Verify ครบทุกข้อที่ขอ (Playwright, JWT จริง, 2 browser context แยกกัน)
Generate link จาก Collections page → รูปแบบ URL ถูกต้อง (http://localhost:3000/shared/{token})
ปิด-เปิด dialog ใหม่ → เห็น ลิงก์เดิม ไม่ generate ใหม่ ✓
Copy to clipboard → ตรวจ clipboard จริงตรงกับลิงก์ที่โชว์ ✓
เปิดลิงก์ใน browser context ใหม่ที่ ไม่มี session เลย (navbar โชว์ "Log in" ยืนยันว่าไม่ได้ login) → เห็นชื่อ collection + bookmark list แบบ read-only ถูกต้อง, ไม่มีปุ่ม Edit/Delete ปรากฏบนหน้านี้เลยสักปุ่ม (นับจริงผ่าน role selector = 0) ✓
Revoke จากฝั่งเจ้าของ → visitor reload ลิงก์เดิม → เห็นข้อความ "This share link is invalid or has been revoked." ตรงตามที่ขอเป๊ะ ✓
พบ transient issue ระหว่างทดสอบ (login ผ่าน Auth0 timeout ครั้งหนึ่ง — น่าจะจาก automated login ซ้ำๆ กับ tenant เดียวกันหลายรอบในเซสชันนี้) ลองใหม่แล้วผ่านปกติ ไม่ใช่บั๊กของโค้ด

Backend unit tests 58/58 + e2e regression 6/6 ผ่านปกติ (ไม่ได้แตะ backend รอบนี้), ลบไฟล์ scratch และปิด dev server ทั้งหมดเรียบร้อยแล้ว