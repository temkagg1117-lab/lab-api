# Part A

## A.1 Муу API сайжруулалт

Муу API-ийн хуулбар нь [partA/src/bad/usr_mgr.ts](/c:/Users/Gg_4_e/Lab12/partA/src/bad/usr_mgr.ts), засварласан хувилбар нь [partA/src/good/user-directory.ts](/c:/Users/Gg_4_e/Lab12/partA/src/good/user-directory.ts)-д байна.

Илэрхий дизайны алдаанууд:

1. `usr_mgr` нэр нь ойлгомжгүй, товчилсон, convention зөрчсөн.
   Зөрчсөн зарчим: нэршил ба ойлголтын жин.
   Яагаад муу вэ: class нэрээсээ domain-ийн үүргээ тодорхой хэлэхгүй, хэрэглэгч API-г тааж ашиглахад хүргэнэ.
   Сайжруулалт: `UserDirectory` интерфейс, `createUserDirectory()` factory ашиглаж зорилгыг тодорхой болгосон.

2. `db_conn` ба `users_arr` нь `public`.
   Зөрчсөн зарчим: мэдээллийн далдлалт.
   Яагаад муу вэ: дотоод төлөвийг гаднаас шууд эвдэж, invariant алдагдах эрсдэлтэй.
   Сайжруулалт: өгөгдлийг private `Map` индексүүдэд нууж, зөвхөн утгатай public method-оор хандуулсан.

3. `any` өргөн хэрэглэсэн (`db_conn`, `users_arr`, `obj`, return type).
   Зөрчсөн зарчим: type safety, self-documenting interface.
   Яагаад муу вэ: compile-time баталгаа алга, хэрэглэгч ямар бүтэц дамжуулах ёстой нь тодорхойгүй.
   Сайжруулалт: `User`, `NewUser`, `UserPatch`, `UserSearchCriteria` зэрэг тодорхой типүүд тодорхойлсон.

4. `do_user_op(obj, flag, timeout)` нэг method олон үл хамаарах үйлдэл хийдэг.
   Зөрчсөн зарчим: deep module биш, олон ойлголтыг нэг дор шахсан interface, SRP.
   Яагаад муу вэ: create/update/delete/restore бүгдийг `flag`-аар удирдах нь call site-ийг ойлгоход хэцүү болгоно.
   Сайжруулалт: `createUser`, `updateUser`, `deleteUser`, `restoreUser` гэж intent-тэйгээр салгасан.

5. `flag: 0=create, 1=update, 2=delete, 3=restore` гэсэн magic number ашигласан.
   Зөрчсөн зарчим: boolean flag / control flag smell, нэршил, readability.
   Яагаад муу вэ: `do_user_op(x, 2, 3000)` гэх мэт код уншихад юу хийх нь мэдэгдэхгүй.
   Сайжруулалт: тус тусын method-уудтай болгож flag dependency-г бүрэн арилгасан.

6. `get_u(id_or_email, flag)` нь хоёр өөр lookup semantics-ийг нэг method-д нуусан.
   Зөрчсөн зарчим: ойлголтын жин, ambiguous parameter.
   Яагаад муу вэ: `flag` ямар утгатай, `id_or_email` яг аль төрөл болох нь method signature-оос харагдахгүй.
   Сайжруулалт: `getUserById(id)` ба `getUserByEmail(email)` гэж хоёр тусдаа method гаргасан.

7. `get_u` нь user-ийг JSON string эсвэл `'ERR_404'` string буцаадаг.
   Зөрчсөн зарчим: алдааны зохиомж, type consistency.
   Яагаад муу вэ: амжилт ба алдаа ижил төрлөөр (`string`) буцаж байгаа тул хэрэглэгч runtime дээр parse хийж ялгана.
   Сайжруулалт: амжилтад typed `User` object буцааж, алдаанд `UserNotFoundError` throw хийдэг болгосон.

8. `find(q)` нь generic `any[]` буцаагаад `SQLException` throw хийнэ гэж comment-оор мэдэгдсэн.
   Зөрчсөн зарчим: abstraction leakage.
   Яагаад муу вэ: дотоод persistence layer-ийн exception public API руу гоожиж байна.
   Сайжруулалт: domain-level `UserDirectoryError` hierarchy ашиглаж, storage detail-ийг public API-гаас нуусан.

9. Comment-оор semantics тайлбарлаж, type system-ийг ашиглаагүй.
   Зөрчсөн зарчим: interface should encode meaning, not comments alone.
   Яагаад муу вэ: comment хоцрогдож болно, compiler ямар ч хамгаалалт хийхгүй.
   Сайжруулалт: method naming, custom types, dedicated exceptions ашиглаж утгыг signature дотор шингээсэн.

10. `timeout` параметр API-ийн түвшинд domain operation-той холилдсон.
    Зөрчсөн зарчим: abstraction boundary.
    Яагаад муу вэ: хэрэглэгч "user create" хийж байна уу эсвэл "transport concern" тохируулж байна уу гэдэг холилдоно.
    Сайжруулалт: domain API-гаас ийм infrastructure concern-ийг салгасан.

Сайжруулсан API-ийн гол шийдлүүд:

- Public surface-ийг `UserDirectory` интерфейсээр илэрхийлсэн.
- Concrete implementation-ийг `InMemoryUserDirectory` private class дотор нуусан.
- Утгатай method нэр, typed input/output, custom exception hierarchy ашигласан.
- Internal state-ийг clone хийж буцааснаар гаднаас шууд өөрчлөхөөс хамгаалсан.

## A.2 Кэш сангийн дизайны шийдвэрлэл

Сангийн эх код нь [partA/lib/cache.ts](/c:/Users/Gg_4_e/Lab12/partA/lib/cache.ts), concrete хэрэгжилтүүд нь [partA/lib/internal/caches.ts](/c:/Users/Gg_4_e/Lab12/partA/lib/internal/caches.ts), тестүүд нь [partA/lib/test/cache.test.ts](/c:/Users/Gg_4_e/Lab12/partA/lib/test/cache.test.ts)-д байна.

Сонгосон сэдэв: кэш сан.

Дизайны үндсэн шийдлүүд:

1. Нэг public интерфейс.
   `Cache<K, V>` нь сангийн ганц нийтэд харагдах abstraction. Хэрэглэгч policy-оос үл хамааран ижил method-уудаар ажиллана.

2. Factory pattern.
   `createCache(policy, options)` нь public entry point. `LruCache`, `LfuCache`, `TtlCache` concrete class-ууд `internal` модуль дотор үлдэж, гадагш export хийгдээгүй.

3. 3 concrete implementation.
   `lru` нь хамгийн сүүлд ашиглагдаагүй entry-г,
   `lfu` нь хамгийн бага давтамжтай entry-г,
   `ttl` нь хугацаа дууссан entry-г цэвэрлэж, шаардлагатай үед хамгийн ойрын дуусах хугацаатай entry-г гаргадаг.

4. Custom exception.
   Сан бүх алдаанд `CacheError` ба `CacheConfigurationError` хэрэглэдэг. Ингэснээр хэрэглэгч дотоод хэрэгжилтийн алдаанаас үл хамааран library-level contract-оор ажиллана.

5. TSDoc contract.
   Public method бүрт precondition, postcondition, error condition-уудыг TSDoc хэлбэрээр тодорхой бичсэн.

6. Testability.
   `clock` dependency injection нэмж өгснөөр TTL болон eviction логикийг deterministic байдлаар тестэлсэн.

7. Unit test coverage.
   Нийт 16 unit test бичсэн. Эдгээр нь basic CRUD behavior, eviction rules, expiry semantics, configuration validation зэргийг хамарсан.
