# Part B

## Library Lending API

Энэ хэсэгт Express.js дээр суурилсан номын сангийн зээлтийн REST API хэрэгжүүлсэн.

Нөөцүүд:

- `/books`
- `/members`
- `/loans`
- `/reservations`
- `/login`

Гол бизнес дүрэм:

- Нэг гишүүн нэгэн зэрэг хамгийн ихдээ `5` ном зээлнэ
- Зээлийн хугацаа `14 хоног`
- Зээлийг `1` удаа сунгаж болно
- Алдааны хариу нь `RFC 7807 Problem Details` форматаар буцна
- `pagination`, `filtering`, `sorting` query параметрүүд дэмжинэ

## Ажиллуулах

```powershell
cd partB
npm start
```

Сервер асмагц API дараах хаяг дээр ажиллана:

```text
http://localhost:3000
```

## Нэвтрэх тест өгөгдөл

- `admin / admin123`
- `staff / staff123`

`admin` нь ном нэмэх эрхтэй, `staff` нь зориуд `403 Forbidden` тест хийхэд ашиглагдана.

API тодорхойлолт:
- [openapi.yaml](/abs/path/c:/Users/Gg_4_e/lab-api/partB/openapi.yaml:1)

## Postman-оор тест хийх

Import хийх файлууд:

- [library-lending-api.postman_collection.json](/abs/path/c:/Users/Gg_4_e/lab-api/postman/library-lending-api.postman_collection.json:1)
- [library-lending-api.postman_environment.json](/abs/path/c:/Users/Gg_4_e/lab-api/postman/library-lending-api.postman_environment.json:1)

Алхамууд:

1. Postman дээр `Import` дарж collection болон environment 2 файлаа оруулна.
2. Environment-оос `Library Lending API Local`-ийг сонгоно.
3. `baseUrl` нь `http://localhost:3000` байгаа эсэхийг шалгана.
4. Серверээ `npm start` командаар асаана.
5. Collection Runner ашиглаад бүх request-ийг дээрээс доош `Run` хийнэ.

## Collection доторх тестүүд

Эерэг тестүүд:

- login хийх
- ном нэмэх
- гишүүн нэмэх
- ном хайх
- pagination шалгах
- ном зээлэх
- зээл сунгах
- ном буцаах

Сөрөг тестүүд:

- буруу нэвтрэлт `401`
- token-гүй хүсэлт `401`
- эрхгүй хэрэглэгч `403`
- байхгүй ном `404`
- 6 дахь ном зээлэх оролдлого `409`
- 2 дахь удаа сунгах оролдлого `422`

Chained flow:

- `login -> token хадгалах -> protected endpoint ашиглах`

## Төслийн бүтэц

- [src/app.js](/abs/path/c:/Users/Gg_4_e/lab-api/partB/src/app.js:1): app entry
- [src/services/loanService.js](/abs/path/c:/Users/Gg_4_e/lab-api/partB/src/services/loanService.js:1): зээлийн бизнес дүрэм
- [src/controllers](/abs/path/c:/Users/Gg_4_e/lab-api/partB/src/controllers): controller-ууд
- [src/routes](/abs/path/c:/Users/Gg_4_e/lab-api/partB/src/routes): route-ууд
- [src/middleware](/abs/path/c:/Users/Gg_4_e/lab-api/partB/src/middleware): auth ба error handler

## Товч шалгах жишээ

Хэрвээ Postman дээр бүх collection ажиллуулалгүй гараар шалгах бол энэ дарааллаар явж болно:

1. `Login as admin`
2. `Create book as admin`
3. `Create member`
4. `Borrow book`
5. `Extend loan once`
6. `Return loan`
