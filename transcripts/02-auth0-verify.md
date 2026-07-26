## Prompt 1
เรามาลุยกันต่อใน backend กัน
ก่อนจะตัดสินใจออกแบบ auth guard ฉันอยากให้ตรวจสอบ Auth0 tenant จริงก่อน
โดยไม่ต้องเดา ให้ทำตามนี้:

1. Fetch discovery document จาก:
   https://dev-yg.us.auth0.com/.well-known/openid-configuration
   แล้วสรุปให้ฟังว่า:
   - รองรับ response_types อะไรบ้าง (มี code สำหรับ Authorization Code 
     flow ไหม มี implicit ด้วยไหม)
   - grant_types_supported มีอะไรบ้าง
   - code_challenge_methods_supported รองรับ S256 (PKCE) ไหม
   - id_token_signing_alg_values_supported ใช้ algorithm อะไร (RS256 หรืออื่นๆ)
   - jwks_uri อยู่ตรงไหน

2. Fetch JWKS จาก jwks_uri ที่ได้ แล้วสรุปว่ามี key อะไรบ้าง 
   ใช้ algorithm ไหนในการ sign

3. จากข้อมูลที่ได้ทั้งหมด ช่วยวิเคราะห์และเสนอทางเลือกให้ฉันตัดสินใจว่า:
   - API ควรรับ Bearer token เป็น access token หรือ ID token
   - ข้อดี/ข้อเสียของแต่ละทางเลือกในบริบทนี้
   - อ้างอิงจากสิ่งที่ tenant รองรับจริง ไม่ใช่ default ทั่วไป

ยังไม่ต้องเขียนโค้ด auth guard ตอนนี้ ขอแค่ผลการตรวจสอบและข้อเสนอก่อน

## Response 1
1) OIDC Discovery Document (https://dev-yg.us.auth0.com/.well-known/openid-configuration)
response_types_supported:
["code", "token", "id_token", "code token", "code id_token", "token id_token", "code token id_token"]

มี code → รองรับ Authorization Code flow ✅
มี token / id_token เดี่ยวๆ และ combination ต่างๆ → Implicit flow ยังเปิดอยู่ ด้วย (tenant ไม่ได้ปิด legacy flow)
grant_types_supported:
client_credentials, authorization_code, refresh_token, password, implicit, device_code, token-exchange, password-realm, passwordless/otp, mfa-oob, mfa-otp, mfa-recovery-code, jwt-bearer

ครบสูตร Auth0 มาตรฐาน รวมถึง client_credentials (สำหรับ machine-to-machine) และ password grant (Resource Owner Password — legacy, เปิดอยู่)
code_challenge_methods_supported:
["S256", "plain"]

รองรับ PKCE S256 ✅ (แต่ plain ก็เปิดอยู่ด้วย — ไม่ได้บังคับ S256 อย่างเดียว)
id_token_signing_alg_values_supported:
["HS256", "RS256", "PS256"]

Tenant อนุญาต ให้เซ็น ID token ได้ทั้งแบบ symmetric (HS256, ใช้ client secret) และ asymmetric (RS256/PS256) — แต่ algorithm จริงที่ใช้ขึ้นกับการตั้งค่าของแต่ละ Auth0 Application (client) ไม่ใช่ค่าคงที่ของ tenant ต้องไปเช็ค “Signing Algorithm” ในหน้า Application settings ของแต่ละ client ถึงจะรู้แน่ชัด
jwks_uri: https://dev-yg.us.auth0.com/.well-known/jwks.json

2) JWKS (.well-known/jwks.json)
พบ 2 keys ทั้งคู่:

kty: RSA, use: sig, alg: RS256
kid: tOu0FHcN3C2etrel4Qhaz และ kid: AU8Qa0nEiLZ2kCdVGwpR0 (2 key เพื่อรองรับ key rotation)
สำคัญ: ใน JWKS มีแค่ RSA/RS256 เท่านั้น ไม่มี key สำหรับ HS256 เลย — ซึ่งถูกต้องตามหลักการ เพราะ HS256 เป็น symmetric algorithm (ใช้ client secret เซ็น) จึงไม่มีทาง publish public key ผ่าน JWKS ได้ตั้งแต่ต้น

3) วิเคราะห์: Access Token vs ID Token สำหรับ API
ประเด็น	Access Token	ID Token
ตรวจสอบผ่าน JWKS ได้จริงไหม	✅ ได้ ถ้าถูก request มาพร้อม audience ที่ตรงกับ Auth0 API (Resource Server) ที่ลงทะเบียนไว้ในเทนแนนต์ — ตอนนั้น Auth0 จะออก JWT ที่เซ็นด้วย RS256 ตาม JWKS นี้	⚠️ เสี่ยง — tenant เปิด HS256 ไว้เป็นตัวเลือก ถ้า Application ไหนตั้งเป็น HS256 (ค่า default เก่าของ "Regular Web App" หลาย config) API จะ verify ผ่าน JWKS ไม่ได้เลย เพราะไม่มี symmetric key ให้ดึง ต้องเอา client secret มาแชร์กับ backend ซึ่งไม่ควรทำ
ออกแบบมาเพื่ออะไร	ออกแบบมาให้ resource server/API ใช้ตรวจสอบสิทธิ์การเข้าถึง (aud = API identifier, มี scope/permissions)	ออกแบบมาให้ client app ใช้ยืนยันตัวตนผู้ใช้เท่านั้น (aud = client_id ของแอปที่ login ไม่ใช่ API)
เข้ากับสิ่งที่ tenant เปิดไว้	เข้ากันดีกับ code flow + PKCE S256 ที่ tenant รองรับ — flow มาตรฐานคือ Auth Code+PKCE ขอ access token พร้อม audience	ใช้ได้เฉพาะกรณีบังคับทุก client ให้เซ็นด้วย RS256 เท่านั้น (ต้องไปเช็ค/แก้ config รายแอปใน dashboard ก่อน ซึ่งข้อมูลจาก discovery/JWKS อย่างเดียวยืนยันไม่ได้)
ข้อเสนอ
แนะนำใช้ Access Token เป็น Bearer token สำหรับ API เพราะ:

Tenant เปิด Authorization Code + PKCE (S256) ไว้ครบ — เป็น flow ที่ตั้งใจออกแบบมาคู่กับการขอ access token ผ่าน audience parameter
JWKS ที่ fetch มามีแค่ RS256 key เท่านั้น หมายความว่าตราบใดที่มีการตั้งค่า Auth0 API (Resource Server) ไว้ในเทนแนนต์ (ยังไม่ได้เช็คส่วนนี้ — ต้องดูใน Auth0 Dashboard → APIs) access token ที่ออกมาจะ verify ผ่าน JWKS นี้ได้แน่นอน
ID token มีความเสี่ยงเรื่อง algorithm ไม่คงที่ (HS256 vs RS256 ขึ้นกับแต่ละ client) และผิดหลักการออกแบบ OIDC ที่ aud ของ ID token คือ client_id ของฝั่ง frontend ไม่ใช่ API
สิ่งที่ยังตรวจสอบไม่ได้จากข้อมูลชุดนี้ (ต้องเช็คเพิ่มใน Auth0 Dashboard ก่อนสรุป 100%):

มี Auth0 API (Resource Server) ที่มี audience identifier ตรงกับที่ backend จะเช็คไหม — ถ้ายังไม่มี ต้องสร้างก่อน ไม่งั้น Auth0 จะออก opaque access token (ไม่ใช่ JWT) แทน ซึ่ง verify ด้วย JWKS ไม่ได้เลย
Signing algorithm ที่ตั้งไว้จริงในแต่ละ Application (client) ที่จะใช้ล็อกอิน
ต้องการให้ผมเช็คส่วน Auth0 API/Resource Server ต่อไหมครับ (ถ้ามี Management API token หรือช่วยดูใน dashboard ได้)? หรือจะยืนยันแนวทาง Access Token แล้วค่อยไปออกแบบ guard กันต่อ

## Prompt 2
ยืนยันแนวทางเราจะใช้ Access Token เป็น Bearer credential

เพิ่มเติม: tenant มี API Audience ที่ใช้ได้แล้วคือ 
https://bbl-candidate-test-api

ช่วยสรุปเหตุผลทั้งหมดนี้เป็น draft สั้นๆ สำหรับใส่ใน DECISIONS.md ให้หน่อย
(ทำไมเลือก access token, หลักฐานจาก discovery doc + JWKS ที่สนับสนุน,
ความเสี่ยงของ ID token ที่ตัดออก)

ยังไม่ต้องเขียนโค้ด auth guard ตอนนี้ ขอแค่ draft เอกสารก่อน

## Response 2
เขียน draft ลงใน DECISIONS.md แล้ว สรุปเนื้อหา: decision ใช้ access token, หลักฐานจาก discovery+JWKS ที่สนับสนุน (Auth Code+PKCE S256, JWKS มีแค่ RS256 key, API Audience https://bbl-candidate-test-api ใช้งานได้จริง), และความเสี่ยงของ ID token ที่ตัดออก (HS256 verify ผ่าน JWKS ไม่ได้, ผิดหลักการออกแบบ OIDC)

ยังไม่แตะโค้ด auth guard ตามที่สั่งไว้ — พร้อมไปต่อเมื่อไหร่บอกได้เลยครับ
