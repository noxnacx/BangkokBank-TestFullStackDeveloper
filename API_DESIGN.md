## /collections

### Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | /collections | List collections ของ user ที่ login อยู่ | Required |
| GET | /collections/:id | Get one collection | Required |
| GET | /collections/:id/bookmarks | List bookmarks ใน collection นี้ | Required |
| POST | /collections | Create collection ใหม่ | Required |
| PUT | /collections/:id | Full update | Required |
| PATCH | /collections/:id | Partial update | Required |
| DELETE | /collections/:id | Delete collection | Required |

### Request/Response shape

**Collection object:**
```json
{
  "id": "string (cuid)",
  "name": "string",
  "ownerId": "string",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

**POST /collections — body:**
```json
{ "name": "string (required)" }
```
`ownerId` มาจาก JWT `sub` claim เท่านั้น — ไม่รับจาก request body แม้ client จะส่งมา
(ถูก reject ด้วย `400` เพราะ `forbidNonWhitelisted: true` — ดูรายละเอียดเพิ่มเติมด้านล่าง)

### Error shape

ใช้ NestJS default exception filter คืนทุก error เป็น:
```json
{ "statusCode": number, "message": string, "error": string }
```
ไม่ได้เขียน custom exception filter เพราะ framework ให้ shape นี้ฟรีอยู่แล้วสำหรับทุก
`HttpException` (รวม `ValidationPipe` ที่ throw `BadRequestException` เอง) — สิ่งที่ต้อง
ควบคุมเองคือให้ทุก error path throw ผ่าน `HttpException` subclass เสมอ ไม่ปล่อย error
ดิบ (เช่น Prisma error) หลุดออกไปตรงๆ

### Ownership enforcement (privacy invariant)

ทุก endpoint filter ด้วย `ownerId` **ที่ระดับ query เอง** ไม่ใช่ fetch ข้อมูลมาก่อนแล้ว
เช็ค ownerId ทีหลัง:

```ts
// ตัวอย่าง: findOne
this.prisma.collection.findUnique({ where: { id, ownerId } })

// ตัวอย่าง: update / delete (atomic, ไม่มี race condition)
this.prisma.collection.update({ where: { id, ownerId }, data })
this.prisma.collection.delete({ where: { id, ownerId } })
```

**ทำไมสำคัญ:** เมื่อ query filter ด้วย `{ id, ownerId }` ทั้งคู่พร้อมกัน กรณี "collection
เป็นของ user อื่น" กับ "collection ไม่มีอยู่จริง" จะคืนผลลัพธ์เดียวกันเสมอคือ `null`
(หรือ Prisma error `P2025` สำหรับ update/delete) — ไม่มี code path ไหนที่แยกสองเคสนี้
ออกจากกันได้ จึงป้องกัน information leak **โดยโครงสร้างของ query เอง** ไม่ใช่แค่อาศัย
ความรอบคอบตอนเขียนโค้ด (safe by construction ไม่ใช่ safe by convention)

Service แปลง `null`/`P2025` เป็น `NotFoundException` (404) เสมอ — **ไม่ใช่ 403** เพราะ
403 จะบอกทางอ้อมว่า "id นี้มีอยู่จริงแค่เข้าไม่ได้" ซึ่งยืนยันการมีอยู่ของข้อมูล
user อื่น ขัดกับ privacy invariant ที่ต้องไม่ให้ user รู้แม้แต่ "การมีอยู่" ของ
ข้อมูลคนอื่น

`update`/`delete` ใช้ query เดียว (`where: { id, ownerId }`) แทนการ fetch-then-mutate
2 ขั้นตอน เพื่อตัด race condition ที่อาจเกิดระหว่างช่วงเช็คสิทธิ์กับช่วงแก้ข้อมูล

### จุดที่พฤติกรรมไม่เป็นไปตามที่คาดตอนแรก

ตั้ง `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
เป็น global pipe คาดไว้แต่แรกว่า field แปลกปลอมที่ client ส่งมา (เช่น พยายามส่ง
`ownerId` ปลอมมาใน POST body) จะถูก **strip ทิ้งเงียบๆ** ตาม `whitelist: true`

ผลจริงตอนทดสอบ (live smoke test ยิง HTTP จริง ไม่ใช่ mock): เพราะเปิด
`forbidNonWhitelisted: true` ไว้ด้วย ระบบ **reject ทันทีด้วย 400** แทนที่จะ strip
เงียบๆ — เข้มกว่าที่คาดไว้ ถือเป็นพฤติกรรมที่ดีกว่าเดิม (ชัดเจนกว่าสำหรับ client
ว่าเขาส่ง field ที่ไม่ควรส่งมา) จึงตัดสินใจคงค่านี้ไว้แทนที่จะปรับให้ strip เงียบๆ