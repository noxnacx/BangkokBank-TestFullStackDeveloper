## Prompt 1
ตอนนี้ backend + auth พร้อมสมบูรณ์แล้ว ไปทำหน้า /collections ของ frontend

ช่วยสร้างหน้า /collections ที่:
1. List collections ทั้งหมดของ user ที่ login อยู่ (เรียก GET /collections 
   พร้อม Bearer token ที่มีอยู่แล้วจาก api client)
2. แสดงรายละเอียด 1 collection เมื่อคลิก (view one)
3. ฟอร์ม create collection ใหม่ (แค่ name field)
4. ปุ่ม delete พร้อม confirmation dialog ก่อนลบจริง
5. ใช้ MUI components (Table หรือ List, Dialog, TextField, Button)
6. Handle loading state และ error state ให้เหมาะสม (เช่น 401 
   ให้ redirect ไป login, error อื่นแสดง message)

ถ้ายังไม่ login ให้ redirect ไปหน้า login ก่อน (ใช้ AuthProvider 
ที่มีอยู่แล้ว)

อธิบายโครงสร้าง component ที่เลือกใช้และเหตุผลสั้นๆ

## Response 1
สรุป
หน้า /collections — src/pages/Collections.tsx, src/api/collections.ts, src/auth/RequireAuth.tsx

โครงสร้าง component และเหตุผล
RequireAuth — route guard แยกต่างหาก ครอบ <Route> element ได้ (<RequireAuth><Collections/></RequireAuth>) แทนที่จะเขียน redirect logic ซ้ำในทุกหน้า protected ในอนาคต (เช่น /bookmarks ที่จะตามมา) ใช้ AuthProvider's login() เดิมตรงๆ ไม่สร้าง auth logic ใหม่
api/collections.ts — แยก fetch + JSON parsing + error mapping ออกจาก UI component เป็น pure functions (listCollections, getCollection, createCollection, deleteCollection) คืน ApiError ที่มี .status ให้ page แยกแยะ 401 จาก error อื่นได้ ไม่ต้อง parse response ซ้ำในทุกจุดที่เรียก
Collections.tsx เดียวจบ ไม่แยก route /collections/:id — "view one" ใช้ Dialog แทน เพราะเป็น read-only popup ไม่ต้องการ URL แชร์ได้/back-button ตอนนี้ (skip route param + navigation state ที่ไม่จำเป็น) ยังคงเรียก endpoint GET /collections/:id จริงเพื่อพิสูจน์ endpoint แยกทำงาน ไม่ใช่แค่ reuse ข้อมูลจาก list
401 handling รวมศูนย์ที่ handleApiError เดียว เรียก login() ซ้ำ (Auth0 redirect) แทนที่จะ handle แยกทุก catch block
เจอบั๊กจริงระหว่างทดสอบ (ไม่เกี่ยวกับโค้ด แต่ระดับ process)
คำสั่ง lsof -ti:PORT | xargs kill ที่เคยใช้ restart dev server ไม่เคยฆ่าอะไรจริงบน Windows/Git-Bash เครื่องนี้เลย (เงียบ ไม่ error) — สะสมเป็น node process ค้าง 13 ตัวข้ามเซสชัน ทำให้ Vite เปลี่ยนไปใช้ port 3001 แทน (fallback เงียบๆ เพราะพอร์ต 3000 ถูกจองไว้) ชน backend port พอดี ตอน curl ไปที่ 3001 เลยเจอ Vite HTML แทน backend จริง

แก้แล้ว: ฆ่า process ทั้งหมดด้วย netstat + taskkill (เจอ PID จริง), เพิ่ม strictPort: true ใน vite.config.ts กัน silent-fallback แบบนี้ในอนาคต (พอร์ตชนจะ error ชัดเจนแทน) และบันทึกวิธีแก้ไว้ใน memory เพื่อไม่ให้เจอปัญหาเดิมอีกในเซสชันถัดไป

Verify แล้วจริงในเบราว์เซอร์
Playwright ขับ: login จริง → list เห็น seed data จริง (Reading list, Work references ของ candidate@test.com) → สร้าง collection ใหม่ปรากฏใน list → คลิกดู detail → Dialog โชว์ name/id/created/updated ถูกต้อง → ลบพร้อม confirmation dialog (ข้อความเตือนเรื่อง bookmarks จะกลายเป็น uncategorized ตรงกับ design SetNull) → ยืนยันหายจริงจาก list, ไม่มี page error เลย
