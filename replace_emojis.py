import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import if renderOption is needed
    if 'renderOption' not in content and 'MenuItem' in content:
        # We need to insert the import after other imports
        import_stmt = "import { renderOption } from '../utils/emoji';\n"
        if '../utils/emoji' not in content:
            # find last import
            imports = list(re.finditer(r'^import .*?;?$', content, re.MULTILINE))
            if imports:
                last_import = imports[-1]
                content = content[:last_import.end()] + '\n' + import_stmt + content[last_import.end():]
            else:
                content = import_stmt + content

    # Transactions.tsx specific replacements
    content = content.replace('<MenuItem value="all">كل الحركات</MenuItem>', '<MenuItem value="all">{renderOption("كل الحركات")}</MenuItem>')
    content = content.replace('<MenuItem value="وارد">وارد 📥</MenuItem>', '<MenuItem value="وارد">{renderOption("وارد")}</MenuItem>')
    content = content.replace('<MenuItem value="صادر">صادر 📤</MenuItem>', '<MenuItem value="صادر">{renderOption("صادر")}</MenuItem>')
    content = content.replace('<MenuItem value="مستهلك">مستهلك 🗑️</MenuItem>', '<MenuItem value="مستهلك">{renderOption("مستهلك")}</MenuItem>')
    content = content.replace('<MenuItem value="تحويل">تحويل 🔄</MenuItem>', '<MenuItem value="تحويل">{renderOption("تحويل")}</MenuItem>')
    content = content.replace('<MenuItem value="تسوية">تسوية ⚖️</MenuItem>', '<MenuItem value="تسوية">{renderOption("تسوية")}</MenuItem>')
    content = content.replace('<MenuItem value="افتتاحي">افتتاحي 🆕</MenuItem>', '<MenuItem value="افتتاحي">{renderOption("افتتاحي")}</MenuItem>')

    content = content.replace('<MenuItem value="all">كل التصنيفات</MenuItem>', '<MenuItem value="all">{renderOption("كل التصنيفات")}</MenuItem>')
    content = content.replace('<MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>', '<MenuItem key={c.name} value={c.name}>{renderOption(c.name, "category")}</MenuItem>')

    content = content.replace('<MenuItem value="all">كل الأوقات 📅</MenuItem>', '<MenuItem value="all">{renderOption("كل الأوقات")}</MenuItem>')
    content = content.replace('<MenuItem value="today">اليوم 🕒</MenuItem>', '<MenuItem value="today">{renderOption("اليوم")}</MenuItem>')
    content = content.replace('<MenuItem value="yesterday">الأمس 🔄</MenuItem>', '<MenuItem value="yesterday">{renderOption("الأمس")}</MenuItem>')
    content = content.replace('<MenuItem value="last7">آخر 7 أيام 📆</MenuItem>', '<MenuItem value="last7">{renderOption("آخر 7 أيام")}</MenuItem>')
    content = content.replace('<MenuItem value="last30">آخر 30 يوم 📅</MenuItem>', '<MenuItem value="last30">{renderOption("آخر 30 يوم")}</MenuItem>')
    content = content.replace('<MenuItem value="currentMonth">الشهر الحالي 🗓️</MenuItem>', '<MenuItem value="currentMonth">{renderOption("الشهر الحالي")}</MenuItem>')
    content = content.replace('<MenuItem value="custom">نطاق مخصص ✏️</MenuItem>', '<MenuItem value="custom">{renderOption("نطاق مخصص")}</MenuItem>')

    content = content.replace('<MenuItem value="all">كل المرفقات 📁</MenuItem>', '<MenuItem value="all">{renderOption("كل المرفقات")}</MenuItem>')
    content = content.replace('<MenuItem value="hasAttachment">يحتوي مرفق 📎</MenuItem>', '<MenuItem value="hasAttachment">{renderOption("يحتوي مرفق")}</MenuItem>')
    content = content.replace('<MenuItem value="noAttachment">بلا مرفق ❌</MenuItem>', '<MenuItem value="noAttachment">{renderOption("بلا مرفق")}</MenuItem>')

    content = content.replace('<MenuItem value="all">كل المنفذين 👥</MenuItem>', '<MenuItem value="all">{renderOption("كل المنفذين")}</MenuItem>')
    content = content.replace('<MenuItem key={emp} value={emp}>{emp}</MenuItem>', '<MenuItem key={emp} value={emp}>{renderOption(emp, "employee")}</MenuItem>')

    # Dashboard.tsx
    content = content.replace('<MenuItem value="all" sx={{ fontWeight: \'bold\' }}>🌐 جميع المستودعات (شامل)</MenuItem>', '<MenuItem value="all">{renderOption("جميع المستودعات")}</MenuItem>')
    content = content.replace('<MenuItem key={wh} value={wh}>🏢 {wh}</MenuItem>', '<MenuItem key={wh} value={wh}>{renderOption(wh, "storehouse")}</MenuItem>')

    # Reports.tsx
    content = content.replace('<MenuItem value="inventory">📊 تقرير الجرد العام وجرد الأرصدة المتوفرة حالياً</MenuItem>', '<MenuItem value="inventory">{renderOption("تقرير الجرد العام وجرد الأرصدة المتوفرة حالياً", "category")}</MenuItem>')
    content = content.replace('<MenuItem value="low_stock">⚠️ تقرير إنفاد مخزون الأمان (المواد منخفضة الرصيد)</MenuItem>', '<MenuItem value="low_stock">{renderOption("تقرير إنفاد مخزون الأمان", "category")}</MenuItem>')
    content = content.replace('<MenuItem value="transactions">🔄 سجل ودفتر حركات المستودع الميداني التفصيلي</MenuItem>', '<MenuItem value="transactions">{renderOption("سجل حركات المستودع التفصيلي", "category")}</MenuItem>')
    content = content.replace('<MenuItem value="category_summary">🏢 تقرير الموازنة والملخص الشامل حسب الفئات والمستودع</MenuItem>', '<MenuItem value="category_summary">{renderOption("تقرير الموازنة والملخص الشامل", "category")}</MenuItem>')
    content = content.replace('<MenuItem value="opening_stock">📋 سند توثيق الأرصدة الافتتاحية للمخزون التأسيسي</MenuItem>', '<MenuItem value="opening_stock">{renderOption("سند توثيق الأرصدة الافتتاحية", "category")}</MenuItem>')
    
    content = content.replace('<MenuItem value="all">كل الفئات والتصنيفات</MenuItem>', '<MenuItem value="all">{renderOption("كل الفئات والتصنيفات")}</MenuItem>')
    content = content.replace('<MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>', '<MenuItem key={cat.name} value={cat.name}>{renderOption(cat.name, "category")}</MenuItem>')

    content = content.replace('<MenuItem value="all">كل الأصناف المدرجة بالمخازن</MenuItem>', '<MenuItem value="all">{renderOption("كل الأصناف المدرجة بالمخازن")}</MenuItem>')
    content = content.replace('<MenuItem key={m.id} value={m.id}>{m.name} ({m.code})</MenuItem>', '<MenuItem key={m.id} value={m.id}>{renderOption(`${m.name} (${m.code})`, "item")}</MenuItem>')

    content = content.replace('<MenuItem value="all">كافة الحركات</MenuItem>', '<MenuItem value="all">{renderOption("كافة الحركات")}</MenuItem>')
    
    content = content.replace('<MenuItem value="all">كل الجهات والشركاء 👥</MenuItem>', '<MenuItem value="all">{renderOption("كل الجهات والشركاء")}</MenuItem>')
    content = content.replace('<MenuItem key={p} value={p}>{p}</MenuItem>', '<MenuItem key={p} value={p}>{renderOption(p, "partner")}</MenuItem>')


    # Materials.tsx
    content = content.replace('<MenuItem value="all">كل التصنيفات العامة</MenuItem>', '<MenuItem value="all">{renderOption("كل التصنيفات العامة")}</MenuItem>')
    content = content.replace('<MenuItem value="all">الكل (الأرصدة والمستنفذة)</MenuItem>', '<MenuItem value="all">{renderOption("الكل (الأرصدة والمستنفذة)")}</MenuItem>')
    content = content.replace('<MenuItem value="normal">متوفر بالمستودعات</MenuItem>', '<MenuItem value="normal">{renderOption("متوفر بالمستودعات")}</MenuItem>')
    content = content.replace('<MenuItem value="critical">مستنفذ / تحت حد الأمان</MenuItem>', '<MenuItem value="critical">{renderOption("مستنفذ / تحت حد الأمان")}</MenuItem>')
    content = content.replace('<MenuItem key={u} value={u}>{u}</MenuItem>', '<MenuItem key={u} value={u}>{renderOption(u)}</MenuItem>')
    content = content.replace('<MenuItem key={store} value={store}>{store}</MenuItem>', '<MenuItem key={store} value={store}>{renderOption(store, "storehouse")}</MenuItem>')
    content = content.replace('<MenuItem value="جهة غير محددة">جهة غير محددة</MenuItem>', '<MenuItem value="جهة غير محددة">{renderOption("جهة غير محددة", "partner")}</MenuItem>')
    content = content.replace('<MenuItem key={partner.id} value={partner.name}>{partner.name}</MenuItem>', '<MenuItem key={partner.id} value={partner.name}>{renderOption(partner.name, "partner")}</MenuItem>')
    content = content.replace('<MenuItem value="new_supplier...">مورد جديد...</MenuItem>', '<MenuItem value="new_supplier...">{renderOption("مورد جديد...")}</MenuItem>')
    content = content.replace('<MenuItem value="">غير محدد</MenuItem>', '<MenuItem value="">{renderOption("غير محدد")}</MenuItem>')
    content = content.replace('<MenuItem value="منخفض">\n                            منخفض 🟢\n                          </MenuItem>', '<MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>')
    content = content.replace('<MenuItem value="متوسط">\n                            متوسط 🟡\n                          </MenuItem>', '<MenuItem value="متوسط">{renderOption("متوسط")}</MenuItem>')
    content = content.replace('<MenuItem value="مرتفع">\n                            مرتفع 🔴\n                          </MenuItem>', '<MenuItem value="مرتفع">{renderOption("مرتفع")}</MenuItem>')


    # Settings.tsx
    content = content.replace('<MenuItem value="مدير نظام">مدير نظام (صلاحيات كاملة)</MenuItem>', '<MenuItem value="مدير نظام">{renderOption("مدير نظام")}</MenuItem>')
    content = content.replace('<MenuItem value="أمين مستودع">أمين مستودع (قراءة وإضافة وتعديل)</MenuItem>', '<MenuItem value="أمين مستودع">{renderOption("أمين مستودع")}</MenuItem>')
    content = content.replace('<MenuItem value="مراجع/مُشاهد">مراجع/مُشاهد (قراءة واستعراض فقط)</MenuItem>', '<MenuItem value="مراجع/مُشاهد">{renderOption("مراجع/مُشاهد")}</MenuItem>')


    # Components
    # MaterialFormDialog.tsx
    content = content.replace('<MenuItem value="منخفض">\n                  منخفض 🟢\n                </MenuItem>', '<MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>')
    content = content.replace('<MenuItem value="متوسط">\n                  متوسط 🟡\n                </MenuItem>', '<MenuItem value="متوسط">{renderOption("متوسط")}</MenuItem>')
    content = content.replace('<MenuItem value="مرتفع">\n                  مرتفع 🔴\n                </MenuItem>', '<MenuItem value="مرتفع">{renderOption("مرتفع")}</MenuItem>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/pages/Transactions.tsx')
process_file('src/pages/Reports.tsx')
process_file('src/pages/Settings.tsx')
process_file('src/pages/Materials.tsx')
process_file('src/pages/Dashboard.tsx')
process_file('src/components/MaterialFormDialog.tsx')
process_file('src/components/CreateTransactionModal.tsx')
