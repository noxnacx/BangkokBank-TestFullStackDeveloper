## Prompt 1
ตอนนี้ backend เสร็จหมดแล้ว (auth guard, collections, bookmarks CRUD 
ครบพร้อม tests) ไปทำ frontend auth flow ต่อ

ช่วยเขียน Authorization Code + PKCE flow ฝั่ง React (Vite) ที่:
1. ปุ่ม Login redirect ไป Auth0 authorize endpoint พร้อม code_challenge 
   (S256) และ audience=https://bbl-candidate-test-api
2. หน้า /callback รับ authorization code แล้ว exchange เป็น access token 
   ผ่าน code_verifier ที่เก็บไว้
3. เก็บ access token ใน memory (ไม่ใช้ localStorage เพื่อความปลอดภัย 
   จาก XSS — อธิบายเหตุผลนี้ด้วย) พร้อม mechanism สำหรับแนบ Bearer 
   token ไปกับทุก API call ไปยัง backend
4. ปุ่ม Logout ที่เคลียร์ token และ redirect ไป Auth0 logout endpoint

ใช้ library ที่เหมาะสม (เช่น @auth0/auth0-spa-js หรือเขียน PKCE เอง 
ด้วยมือ) และอธิบายเหตุผลที่เลือก

ยังไม่ต้องทำหน้า /collections หรือ /bookmarks ตอนนี้ ขอแค่ auth 
foundation ก่อน

## Response 1
สรุป
Library เลือก: @auth0/auth0-spa-js (ไม่เขียน PKCE เอง) — เหตุผลเดียวกับที่เลือก jose ฝั่ง backend: PKCE/state/nonce/token-cache เป็นโค้ดที่พลาดง่าย (CSRF ผ่าน state, verifier storage ข้าม redirect, token refresh) และ Auth0 เองเป็นคนเขียน SDK ตัวนี้ให้ทำงานกับ tenant ตัวเองอยู่แล้ว — และ default ของมันคือ cacheLocation: 'memory' อยู่แล้ว (ตั้ง explicit ไว้เพื่อความชัดเจนของ intent เท่านั้น) ตรงกับ requirement ข้อ 3 พอดีโดยไม่ต้องเขียนอะไรเพิ่ม

Files: src/auth/auth0Client.ts, AuthProvider.tsx, LoginButton.tsx, LogoutButton.tsx, src/pages/Callback.tsx, src/api/client.ts (แนบ Bearer ให้ทุก call), แก้ Home.tsx/App.tsx/main.tsx ให้ผูกเข้าด้วยกัน, เพิ่ม enableCors() ที่ backend/src/main.ts (จำเป็นเพราะ frontend/backend คนละ origin)

ทำไม token อยู่ใน memory ไม่ใช่ localStorage
localStorage/sessionStorage เป็น JS-readable ธรรมดา — XSS ใดๆ (dependency ที่ถูกฝังโค้ด, script ที่ inject เข้ามา) อ่านออกไปได้ตรงๆ และอยู่ข้าม reload/tab ทำให้ token ที่หลุดไปใช้ซ้ำได้นาน In-memory (ในตัวแปร JS) ก็ยังถูก XSS ที่รันอยู่ ณ ขณะนั้นอ่านได้เหมือนกัน (ไม่มีอะไรฝั่ง client ปิดช่องโหว่ XSS ได้ 100%) แต่ไม่รอดจาก reload/เปิด tab ใหม่ — เท่ากับลด blast radius ไม่ใช่ปิดช่องโหว่ (ตัวป้องกัน XSS จริงๆ คือ CSP + ไม่ render input ที่ไม่ sanitize ไม่ใช่ที่เก็บ token)

trade-off ที่เจอจริงระหว่างทดสอบ: token หายตอน refresh
เพราะ token ไม่ persist ข้าม reload, AuthProvider เรียก getTokenSilently() ตอน mount เพื่อขอ token ใหม่แบบเงียบๆ ผ่าน hidden iframe (ใช้ Auth0 session cookie) — เจอจริงว่า default timeout ของมันคือ 60s ถ้า Auth0 ตอบช้า/ตอบไม่ถูกต้อง (เช่นตอนทดสอบด้วย placeholder client_id) จะค้างที่ "Loading..." นาน จึงเพิ่ม timeoutInSeconds: 5 เฉพาะจุดนี้ ให้ fallback เป็น "please log in" เร็วขึ้นแทนที่จะรอเต็ม 60s

Verify แล้วจริงในเบราว์เซอร์ (ไม่ใช่แค่ build ผ่าน)
รัน backend (npm run start:dev, ต่อ Postgres container ที่มีอยู่) + frontend (npm run dev) จริง แล้วขับด้วย Playwright (ไม่มี chromium-cli ในเครื่อง Windows นี้ เลยใช้ Playwright ตรงตาม fallback ที่ /run skill แนะนำ):

หน้า Home โหลดแล้วเข้าสู่ state "Home — please log in" ถูกต้อง (พิสูจน์ว่า silent-restore ล้มเหลวอย่างเงียบๆ ตามที่ออกแบบ ไม่ throw ค้าง)
ไม่มี JS error ที่ทำหน้าพัง (มี network 400 หนึ่งจุดจาก silent-auth iframe ที่ชน placeholder client_id — ตามคาด ไม่ใช่ bug)
กด "Log in" แล้ว capture redirect URL จริง เช็คครบ: code_challenge, code_challenge_method=S256, audience=https://bbl-candidate-test-api, redirect_uri=...localhost:5173/callback, response_type=code, plus state/nonce (CSRF/replay protection ที่ auth0-spa-js ใส่ให้ฟรี)
ติดอยู่ที่ TODO เดียว (บันทึกใน AI_WORKFLOW.md แล้ว): VITE_AUTH0_CLIENT_ID เป็น placeholder เพราะไม่มีสิทธิ์เข้า Auth0 Dashboard สร้าง SPA application — ทุกอย่างพร้อมแล้ว รอแค่ client_id จริงตัวเดียวก็ login ได้จริง

## Prompt 2
เจอแล้วว่า Client ID จริงมีอยู่แล้วในสเปกต้นฉบับตั้งแต่ต้น ไม่ต้องสร้างใหม่:

VITE_AUTH0_CLIENT_ID=H9F6QG5SzTKMv0tbmgxLj9LjG1EKVllA

แก้ .env ของ frontend ให้ใช้ค่านี้แทน placeholder แล้วรัน Playwright 
test ซ้ำเพื่อยืนยัน login flow ทำงานจริงจนจบ (ได้ token กลับมาจริง 
ไม่ใช่แค่ redirect URL ถูกต้อง)

ทดสอบ login ด้วย test user จริง (candidate@test.com / @password1234) 
แล้ว decode sub claim จาก access token ที่ได้ ให้ผมดูค่าจริงด้วย 
เพื่อเอาไปแทนที่ placeholder ownerId ใน seed.ts


## Response 2
สรุปสิ่งที่เกิดขึ้น
1. Client ID จริงใช้ได้ — แก้ .env แล้ว

2. เจอ callback URL mismatch — Auth0 ลงทะเบียน callback ไว้ที่ http://localhost:3000/callback (ไม่ใช่ 5173 ของ Vite default) แก้โดย:

vite.config.ts — ตั้ง server.port = 3000
backend/.env — ย้าย backend ไป PORT=3001 (กัน conflict กับ frontend), เพิ่ม FRONTEND_ORIGIN=http://localhost:3000
backend/src/main.ts — แก้ CORS default ให้ตรงกัน
frontend/.env — VITE_API_BASE_URL=http://localhost:3001
3. เจอบั๊กจริงระหว่างทดสอบ (ไม่ใช่แค่ config): token exchange สำเร็จจริง (เห็นจาก network response) แต่หน้าเว็บยังค้างที่ "please log in" — เพราะ AuthProvider คำนวณ state ตอน mount ครั้งเดียว และไม่ remount ตอนเปลี่ยนหน้าไป /callback เลยไม่มีอะไรไปอัปเดต state หลัง exchange เสร็จ แก้โดยดึง logic ออกเป็น refresh() ที่ context เปิดให้เรียกได้ แล้วให้ Callback.tsx เรียกมันหลัง handleRedirectCallback() สำเร็จ — นี่คือเหตุผลที่ "รัน Playwright ทดสอบจนจบ" สำคัญ ถ้าเช็คแค่ redirect URL ถูกต้องแบบรอบก่อนจะไม่มีทางเจอบั๊กนี้เลย

ยืนยันจบ flow จริงด้วย Playwright + candidate@test.com
Login ผ่าน Auth0 Universal Login จริง → ได้ access_token/id_token จริง → หน้าเว็บเปลี่ยนเป็น "Logged in as Candy" ถูกต้อง → กดปุ่ม "Call GET /me" → backend verify JWT จริงผ่าน JWKS แล้วตอบ {"ownerId":"auth0|62e089faea483987422db6cc"} ตรงกับ sub ที่ decode ได้เอง — round-trip เต็มรูปแบบ

sub claim จริงของ candidate@test.com:


auth0|62e089faea483987422db6cc
แทนที่ placeholder แล้ว
backend/prisma/seed.ts — OWNER_A เปลี่ยนจาก placeholder เป็นค่าจริงข้างต้นแล้ว, ลบ TODO ที่เกี่ยวข้องใน AI_WORKFLOW.md ออกและมาร์คว่าแก้แล้วทั้งสองรายการ (client_id + ownerId)

ยังไม่เสร็จ 100%: Docker Desktop ไม่ได้รันอยู่ตอนนี้ (เช็คแล้วไม่เชื่อมต่อ daemon) เลยยังรัน npm run prisma:seed ซ้ำด้วยค่าใหม่ไม่ได้ — DB ตอนนี้ยังมีข้อมูล seed เก่าที่ใช้ placeholder อยู่ เปิด Docker Desktop แล้วบอกได้ จะรัน seed ให้ใหม่ทันที (unit tests 47 ตัวยังผ่านปกติ ไม่กระทบเพราะไม่พึ่ง seed data)