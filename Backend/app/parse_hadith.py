import os
import re
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
INPUT_FILE = os.path.join(DATA_DIR, "hadith_bukhari.txt")
BOOKS_OUTPUT = os.path.join(DATA_DIR, "hadith_books.json")
HADITH_DIR = os.path.join(DATA_DIR, "hadith_cache")
os.makedirs(HADITH_DIR, exist_ok=True)

# Arabic names for Sahih al-Bukhari books (standard classical titles)
ARABIC_BOOK_NAMES = {
    1: "كتاب بدء الوحي",
    2: "كتاب الإيمان",
    3: "كتاب العلم",
    4: "كتاب الوضوء",
    5: "كتاب الغسل",
    6: "كتاب الحيض",
    7: "كتاب التيمم",
    8: "كتاب الصلاة",
    9: "كتاب مواقيت الصلاة",
    10: "كتاب الأذان",
    11: "كتاب الجمعة",
    12: "كتاب الخوف",
    13: "كتاب العيدين",
    14: "كتاب الوتر",
    15: "كتاب الاستسقاء",
    16: "كتاب الكسوف",
    17: "كتاب سجود القرآن",
    18: "كتاب التقصير",
    19: "كتاب التهجد",
    20: "كتاب فضل الصلاة بمكة والمدينة",
    21: "كتاب العمل في الصلاة",
    22: "كتاب السهو",
    23: "كتاب الجنائز",
    24: "كتاب الزكاة",
    25: "كتاب الحج",
    26: "كتاب العمرة",
    27: "كتاب المحصر",
    28: "كتاب جزاء الصيد",
    29: "كتاب فضائل المدينة",
    30: "كتاب الصوم",
    31: "كتاب صلاة التراويح",
    32: "كتاب فضل ليلة القدر",
    33: "كتاب الاعتكاف",
    34: "كتاب البيوع",
    35: "كتاب السلم",
    36: "كتاب الشفعة",
    37: "كتاب الإجارة",
    38: "كتاب الحوالات",
    39: "كتاب الكفالة",
    40: "كتاب الوكالة",
    41: "كتاب المزارعة",
    42: "كتاب المساقاة",
    43: "كتاب الاستقراض",
    44: "كتاب الخصومات",
    45: "كتاب اللقطة",
    46: "كتاب المظالم",
    47: "كتاب الشركة",
    48: "كتاب الرهن",
    49: "كتاب العتق",
    50: "كتاب المكاتب",
    51: "كتاب الهبة وفضلها",
    52: "كتاب الشهادات",
    53: "كتاب الصلح",
    54: "كتاب الشروط",
    55: "كتاب الوصايا",
    56: "كتاب الجهاد والسير",
    57: "كتاب فرض الخمس",
    58: "كتاب الجزية والموادعة",
    59: "كتاب بدء الخلق",
    60: "كتاب أحاديث الأنبياء",
    61: "كتاب المناقب",
    62: "كتاب فضائل أصحاب النبي",
    63: "كتاب مناقب الأنصار",
    64: "كتاب المغازي",
    65: "كتاب تفسير القرآن",
    66: "كتاب فضائل القرآن",
    67: "كتاب النكاح",
    68: "كتاب الطلاق",
    69: "كتاب النفقات",
    70: "كتاب الأطعمة",
    71: "كتاب العقيقة",
    72: "كتاب الذبائح والصيد",
    73: "كتاب الأضاحي",
    74: "كتاب الأشربة",
    75: "كتاب المرضى",
    76: "كتاب الطب",
    77: "كتاب اللباس",
    78: "كتاب الأدب",
    79: "كتاب الاستئذان",
    80: "كتاب الدعوات",
    81: "كتاب الرقاق",
    82: "كتاب القدر",
    83: "كتاب الأيمان والنذور",
    84: "كتاب كفارات الأيمان",
    85: "كتاب الفرائض",
    86: "كتاب الحدود",
    87: "كتاب الديات",
    88: "كتاب استتابة المرتدين",
    89: "كتاب الإكراه",
    90: "كتاب الحيل",
    91: "كتاب التعبير",
    92: "كتاب الفتن",
    93: "كتاب الأحكام",
    94: "كتاب التمني",
    95: "كتاب أخبار الآحاد",
    96: "كتاب الاعتصام بالكتاب والسنة",
    97: "كتاب التوحيد"
}

def parse_all():
    print(f"Reading {INPUT_FILE}...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    books_dict = {}
    hadiths_by_book = {}

    current_book_num = 1
    current_book_name = "Revelation"

    i = 0
    total_parsed = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        m_book = re.match(r"^Sahih al-Bukhari - Book (\d+):\s*(.*)$", line)
        if m_book:
            b_num = int(m_book.group(1))
            b_name = m_book.group(2).strip()
            if b_num > 0 and b_name:
                current_book_num = b_num
                current_book_name = b_name
            i += 1
            continue

        content = line
        while i + 1 < len(lines) and not re.search(r"\(Bukhari \d+\)\s*$", content) and not lines[i + 1].startswith("Sahih al-Bukhari - Book"):
            i += 1
            content += " " + lines[i].strip()

        m_hadith = re.search(r"\(Bukhari (\d+)\)\s*$", content)
        if m_hadith:
            h_num = int(m_hadith.group(1))
            body = content[:m_hadith.start()].strip()
            m_narrator = re.match(r"^(Narrated [^:]+:)\s*(.*)$", body)
            if m_narrator:
                narrator = m_narrator.group(1)
                text_en = m_narrator.group(2)
            else:
                narrator = ""
                text_en = body

            hadith_obj = {
                "id": h_num,
                "hadithNumber": h_num,
                "bookNumber": current_book_num,
                "bookName": current_book_name,
                "narrator": narrator,
                "text_en": text_en,
                "collection": "Sahih al-Bukhari",
                "grade": "Sahih",
                "reference": f"Sahih al-Bukhari {h_num}"
            }

            if current_book_num not in hadiths_by_book:
                hadiths_by_book[current_book_num] = []
            hadiths_by_book[current_book_num].append(hadith_obj)

            if current_book_num not in books_dict:
                books_dict[current_book_num] = {
                    "number": current_book_num,
                    "name": current_book_name,
                    "name_ar": ARABIC_BOOK_NAMES.get(current_book_num, f"كتاب {current_book_name}"),
                    "collection": "Sahih al-Bukhari",
                    "hadiths_count": 0,
                    "start_hadith": h_num,
                    "end_hadith": h_num
                }

            b_entry = books_dict[current_book_num]
            b_entry["hadiths_count"] += 1
            b_entry["start_hadith"] = min(b_entry["start_hadith"], h_num)
            b_entry["end_hadith"] = max(b_entry["end_hadith"], h_num)
            total_parsed += 1

        i += 1

    print(f"Total parsed: {total_parsed} hadiths in {len(books_dict)} books")

    # Save books list
    books_list = [books_dict[k] for k in sorted(books_dict.keys())]
    with open(BOOKS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(books_list, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(books_list)} books to {BOOKS_OUTPUT}")

    # Save each book's hadiths into hadith_cache/book_{num}.json
    for b_num, h_list in hadiths_by_book.items():
        book_file = os.path.join(HADITH_DIR, f"book_{b_num}.json")
        with open(book_file, "w", encoding="utf-8") as f:
            json.dump({
                "book": books_dict[b_num],
                "hadiths": h_list
            }, f, ensure_ascii=False, indent=2)

    print(f"Successfully cached all {len(hadiths_by_book)} book JSON files in {HADITH_DIR}")

if __name__ == "__main__":
    parse_all()
