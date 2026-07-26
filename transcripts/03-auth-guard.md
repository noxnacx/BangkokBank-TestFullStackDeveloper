## Prompt 1
ตอนนี้ตัดสินใจแล้วว่าใช้ Access Token (RS256) เป็น Bearer credential
ตามที่สรุปไว้ใน DECISIONS.md

ช่วยเขียน AuthGuard สำหรับ NestJS ที่:
1. ดึง Bearer token จาก Authorization header
2. Verify signature ด้วย RS256 โดยใช้ public key จาก JWKS 
   (https://dev-yg.us.auth0.com/.well-known/jwks.json)
3. ตรวจสอบ audience (aud) ต้องตรงกับ https://bbl-candidate-test-api
4. ตรวจสอบ issuer (iss) ต้องตรงกับ tenant ที่ถูกต้อง
5. ตรวจสอบ expiry (exp) ของ token
6. ถ้า token ไม่ผ่านการตรวจสอบข้อใดข้อหนึ่ง ให้ throw UnauthorizedException
7. ถ้าผ่าน ให้แนบข้อมูล user (โดยเฉพาะ sub claim ที่จะใช้เป็น ownerId) 
   ไว้ใน request object เพื่อให้ controller ใช้ต่อได้

ใช้ library ที่เหมาะสมสำหรับ JWKS verification (เช่น jwks-rsa + passport-jwt 
หรือ nestjs built-in) และอธิบายเหตุผลที่เลือก library นั้น

อธิบายทุกส่วนของโค้ดว่าทำไมต้องเขียนแบบนี้ โดยเฉพาะจุดตรวจสอบความปลอดภัย
แต่ละจุด (audience, issuer, signature, expiry)

ยังไม่ต้องเขียน controller หรือ business logic อื่น ขอแค่ Guard ก่อน

## Response 1
Library เลือก: jose ไม่ใช้ passport-jwt + jwks-rsa ตามที่ยกตัวอย่างมา เพราะ:

Guard นี้เป็น CanActivate ธรรมดา ไม่จำเป็นต้องพึ่ง passport's strategy indirection เลย — การเพิ่ม @nestjs/passport + passport-jwt + jwks-rsa (3 แพ็กเกจ) เพื่อทำงานเดียวกันเป็นการเพิ่ม dependency โดยไม่จำเป็น
jose ตัวเดียวมี createRemoteJWKSet (fetch + cache + auto-refetch เมื่อเจอ kid ใหม่ พร้อม rate-limit กันการยิง JWKS รัว ๆ) และ jwtVerify ที่เช็ค signature, iss, aud, exp ให้ในคำสั่งเดียว — โค้ดสั้นกว่า, deps น้อยกว่า, ยังคง maintained active
จุดตรวจสอบความปลอดภัยแต่ละจุด (คอมเมนต์ไว้ในโค้ดด้วย):

Signature — jwtVerify ดึง public RSA key ที่ตรงกับ kid ของ token จาก JWKS ของ tenant มา verify
Algorithm confusion — ล็อก algorithms: ['RS256'] ไว้ตรงๆ แทนที่จะเชื่อ alg header ในตัว token เอง (tenant นี้เปิด HS256 ไว้ในตัวเลือกด้วยตามที่เช็คใน DECISIONS.md ถ้าไม่ล็อกไว้ อาจเปิดช่องให้ปลอมโทเคนแบบ HS256 โดยเอา public key มาใช้เป็น shared secret)
Audience/Issuer — ส่ง issuer/audience เข้า jwtVerify ตรงๆ ถ้าไม่ตรงกับ AUTH0_ISSUER/AUTH0_AUDIENCE จะ throw ทันที กันโทเคนจาก tenant อื่นหรือ API อื่น
Expiry — jwtVerify เช็ค exp (และ nbf/iat) ให้อัตโนมัติ ไม่ต้องเขียนเอง
ทุกกรณี fail จะถูกจับรวมแล้ว throw UnauthorizedException เดียว — ไม่รั่วรายละเอียดว่า fail เพราะอะไร (signature/aud/iss/exp) ออกไปให้ client

request.user.ownerId ถูก set จาก sub claim (ไม่ใช่ email ที่ผู้ใช้เปลี่ยนได้) ให้ controller เอาไปใช้ต่อได้

Config เพิ่มใน .env: AUTH0_ISSUER, AUTH0_AUDIENCE (ค่าจริงจาก DECISIONS.md) — ไม่ hardcode ในโค้ดเพราะเป็นค่าที่ต่างกันได้ระหว่าง dev/staging/prod tenant

Test: auth.guard.spec.ts mock jose ครอบ 4 branch (ไม่มี header / scheme ผิด / verify fail / verify ผ่านแล้ว attach ownerId) — ผ่านหมด, ไม่ยิง network จริง

ยังไม่ได้แตะ controller หรือ wiring เข้า AppModule ตามที่สั่งไว้