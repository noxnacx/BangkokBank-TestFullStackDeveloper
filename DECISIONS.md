# DECISIONS

## 2026-07-27 — ใช้ Access Token เป็น Bearer credential สำหรับ API

**บริบท:** ก่อนออกแบบ auth guard บน backend (NestJS) ได้ตรวจสอบ Auth0 tenant จริง
(`https://dev-yg.us.auth0.com`) โดย fetch OIDC discovery document และ JWKS
เพื่อยืนยันว่า tenant รองรับอะไรจริง แทนที่จะอิงตาม default ทั่วไปของ Auth0

**Decision:** API จะรับ **Access Token** เป็น Bearer token (ไม่ใช่ ID token)
โดยตรวจสอบ signature ผ่าน JWKS และเช็ค `aud` ให้ตรงกับ API Audience ของ tenant:
`https://bbl-candidate-test-api`

**หลักฐานที่สนับสนุนจาก discovery document + JWKS:**
- `response_types_supported` มี `code` → tenant รองรับ Authorization Code flow
- `code_challenge_methods_supported` มี `S256` → รองรับ PKCE เต็มรูปแบบ คู่กับ Auth Code flow
- Auth Code + PKCE เป็น flow มาตรฐานที่ขอ access token ผ่าน `audience` parameter ตรงกับ resource server ที่ต้องการเรียก
- JWKS ที่ `jwks_uri` (`.well-known/jwks.json`) มี key แค่ 2 ตัว ทั้งคู่เป็น `kty: RSA`, `alg: RS256` เท่านั้น
  → ยืนยันว่ามี public key พร้อมให้ resource server verify signature แบบ asymmetric ได้จริง ไม่ต้องแชร์ secret ใดๆ กับ backend
- Tenant มี API Audience ที่ใช้งานได้แล้ว: `https://bbl-candidate-test-api`
  → เมื่อ frontend ขอ token พร้อม `audience` นี้ Auth0 จะออก JWT access token (ไม่ใช่ opaque token) ที่เซ็นด้วย RS256 ตาม JWKS ข้างต้น

**ความเสี่ยงของ ID token ที่ตัดออก:**
- `id_token_signing_alg_values_supported` ของ tenant มี `HS256` รวมอยู่ด้วย (นอกจาก RS256/PS256)
  HS256 เป็น symmetric algorithm ที่เซ็นด้วย client secret — ไม่มี public key ใน JWKS ให้ backend ตรวจสอบได้เลย
  ถ้า Application (client) ไหนถูกตั้งค่าเป็น HS256 (ค่า default เก่าของ Regular Web App หลายกรณี) backend จะ verify signature ผ่าน JWKS ไม่ได้ ต้องเอา client secret มาไว้ที่ backend ซึ่งไม่ปลอดภัยและผิดหลักการ
- โดยหลักการออกแบบ OIDC, ID token มีไว้ให้ **client application** ใช้ยืนยันตัวตนผู้ใช้เท่านั้น (`aud` = client_id ของแอปที่ล็อกอิน) ไม่ได้ออกแบบมาให้ resource server ใช้ตรวจสอบสิทธิ์เข้าถึง API
- Signing algorithm ของ ID token ขึ้นกับการตั้งค่ารายแอปใน Auth0 Dashboard ไม่ใช่ค่าคงที่ของ tenant จึงไม่สามารถการันตีความสม่ำเสมอ (consistency) ในระยะยาวได้เท่า access token ที่ผูกกับ API Audience โดยตรง

**ผลลัพธ์:** auth guard จะ verify JWT access token ด้วย RS256 ผ่าน JWKS ของ tenant
และเช็ค `aud` = `https://bbl-candidate-test-api`

## 2026-07-27 — ไม่มี User model, ใช้ ownerId ผูกกับ Auth0 `sub` ตรงๆ

**บริบท:** ออกแบบ `schema.prisma` สำหรับ `Collection` และ `Bookmark` ต้องตัดสินใจว่า
จะ sync user จาก Auth0 มาเก็บเป็นตาราง `User` ของตัวเองไหม หรือใช้ `ownerId`
(Auth0 `sub` claim ที่ verify แล้วใน `AuthGuard`) เป็น string อ้างอิงตรงๆ โดยไม่มีตาราง
`User` เลย

**Decision:** ไม่สร้าง `User` model — `ownerId` เป็น `String` column ธรรมดาในทั้ง
`Collection` และ `Bookmark` ผูกกับ `sub` claim โดยตรง

**เหตุผล:**
- Auth0 เป็น source of truth ของ identity อยู่แล้ว และ `sub` ผ่านการ verify
  signature/aud/iss/exp ใน `AuthGuard` ก่อนถึง controller ทุกครั้ง — เชื่อถือได้โดยไม่ต้อง
  มีตาราง `User` มายืนยันซ้ำ
- ไม่มี local profile data (ชื่อ, email, preference) ที่ต้องเก็บตอนนี้ — เพิ่มตาราง
  `User` ตอนนี้คือ speculative (YAGNI)
- FK ไปตาราง `User` ก็ไม่ได้ enforce integrity ที่มีความหมายจริง เพราะ "user ที่ valid"
  นิยามโดย Auth0 ไม่ใช่โดย row ในตารางเรา

**จุดที่ต้องกลับมาคิดใหม่:** ถ้าทำ feature แชร์ collection ระหว่างหลาย user จะต้องมี
join table (เช่น `CollectionMember`) ตอนนั้นค่อยประเมินอีกครั้งว่าต้อง sync ข้อมูล
user จริงไหม (เช่น โชว์ชื่อ/อีเมลสมาชิกโดยไม่ยิง Auth0 Management API ทุกครั้ง)

## 2026-07-27 — `onDelete: SetNull` สำหรับ `Bookmark.collectionId`

**บริบท:** เมื่อลบ `Collection` ต้องตัดสินใจว่า `Bookmark` ที่อยู่ใน collection นั้นควร
เกิดอะไรขึ้น มี 3 ทางเลือก: `Cascade` (ลบตาม), `SetNull` (ตัดความสัมพันธ์ กลายเป็น
uncategorized), `Restrict` (ห้ามลบถ้ายังมี bookmark อ้างอิง)

**Decision:** เลือก `onDelete: SetNull`

**เหตุผล:**
- ตรงกับ design เดิมที่ `collectionId` เป็น nullable อยู่แล้ว — "ไม่มี collection"
  (uncategorized) เป็นสถานะปกติของ `Bookmark` ไม่ใช่ error state
- ป้องกันไม่ให้การลบ collection เดียวทำลาย bookmark หลายอันแบบเงียบๆ โดยไม่มีการ
  ยืนยันแยกต่างหาก (ต่างจาก `Cascade` ที่ลบทันทีและกู้คืนไม่ได้)
- ยังไม่ทำ feature แชร์ collection ตอนนี้ จึงยังไม่ต้องการความเข้มงวดระดับ `Restrict`

**ทบทวนใหม่เมื่อไร:** ถ้าทำ feature แชร์ collection ระหว่างหลาย user จริง ให้กลับมา
พิจารณา `Restrict` แทน เพราะตอนนั้นการลบ collection โดยเจ้าของคนเดียวอาจกระทบ
bookmark ที่คนอื่นมองว่าเป็นของตัวเองอยู่ ต้องมี confirmation step ที่ชัดเจนกว่า
`SetNull` เงียบๆ
