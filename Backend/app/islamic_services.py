import os
import json
import logging
import urllib.request
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CACHE_DIR = os.path.join(DATA_DIR, "surah_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

METHOD_MAP = {
    "University of Islamic Sciences, Karachi": 1,
    "Islamic Society of North America (ISNA)": 2,
    "Muslim World League": 3,
    "Umm Al-Qura University, Makkah": 4,
    "Egyptian General Authority of Survey": 5,
    "Institute of Geophysics, University of Tehran": 7,
    "Gulf Region": 8,
    "Kuwait": 9,
    "Qatar": 10,
    "Majlis Ugama Islam Singapura, Singapore": 11,
    "Union Organization islamic de France": 12,
    "Diyanet İşleri Başkanlığı, Turkey": 13,
    "Spiritual Administration of Muslims of Russia": 14,
}

FEATURED_VERSES = [
    {
        "arabic": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        "translation": "Indeed, with hardship comes ease.",
        "surah": "Surah Ash-Sharh",
        "ayah": "94:6"
    },
    {
        "arabic": "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
        "translation": "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
        "surah": "Surah Ar-Ra'd",
        "ayah": "13:28"
    },
    {
        "arabic": "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ",
        "translation": "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
        "surah": "Surah Al-Baqarah",
        "ayah": "2:186"
    },
    {
        "arabic": "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
        "translation": "And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.",
        "surah": "Surah At-Talaq",
        "ayah": "65:2-3"
    },
    {
        "arabic": "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        "translation": "Sufficient for us is Allah, and [He is] the best Disposer of affairs.",
        "surah": "Surah Ali 'Imran",
        "ayah": "3:173"
    },
    {
        "arabic": "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
        "translation": "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
        "surah": "Surah Al-Baqarah",
        "ayah": "2:152"
    }
]

FEATURED_HADITHS = [
    {
        "text": "The best among you are those who have the best manners and character.",
        "source": "Sahih Al-Bukhari · 6064"
    },
    {
        "text": "None of you will believe until you love for your brother what you love for yourself.",
        "source": "Sahih Al-Bukhari · 13"
    },
    {
        "text": "The strong is not the one who overcomes the people by his strength, but the one who controls himself while in anger.",
        "source": "Sahih Al-Bukhari · 6114"
    },
    {
        "text": "He who makes peace between the people by inventing good information or saying good things, is not a liar.",
        "source": "Sahih Al-Bukhari · 2692"
    },
    {
        "text": "A Muslim is the one who avoids harming Muslims with his tongue or his hands.",
        "source": "Sahih Al-Bukhari · 10"
    }
]

def get_surahs_list():
    """Return 114 Surahs list from local metadata"""
    surahs_file = os.path.join(DATA_DIR, "surahs.json")
    if os.path.exists(surahs_file):
        with open(surahs_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def get_surah_detail(surah_id: int):
    """Return full Surah details with verses (Arabic text, translation, etc.)"""
    surah_cache_file = os.path.join(CACHE_DIR, f"surah_{surah_id}.json")
    surah_data = None
    
    if os.path.exists(surah_cache_file):
        try:
            with open(surah_cache_file, "r", encoding="utf-8") as f:
                surah_data = json.load(f)
        except Exception as e:
            logger.error(f"Error loading cached surah {surah_id}: {e}")

    if not surah_data:
        try:
            req = urllib.request.Request(
                f"https://api.alquran.cloud/v1/surah/{surah_id}",
                headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                surah_data = data.get("data")
                with open(surah_cache_file, "w", encoding="utf-8") as f:
                    json.dump(surah_data, f, ensure_ascii=False)
        except Exception as e:
            logger.warning(f"Could not fetch surah {surah_id} from cloud: {e}")

    # Load translation from quran.txt
    english_translations = {}
    quran_txt = os.path.join(DATA_DIR, "quran.txt")
    if os.path.exists(quran_txt):
        prefix = f"Quran {surah_id}:"
        with open(quran_txt, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith(prefix):
                    parts = line.split(" - ", 1)
                    if len(parts) == 2:
                        ayah_num = int(parts[0].replace(prefix, "").strip())
                        english_translations[ayah_num] = parts[1].strip()

    # Assemble verses
    verses = []
    if surah_data and "ayahs" in surah_data:
        for ayah in surah_data["ayahs"]:
            v_num = ayah.get("numberInSurah", 1)
            verses.append({
                "number": v_num,
                "text_ar": ayah.get("text", ""),
                "text_en": english_translations.get(v_num, f"Verse {v_num}"),
                "juz": ayah.get("juz", 1),
                "audio": f"https://cdn.islamic.network/quran/audio/128/ar.alafasy/{ayah.get('number', v_num)}.mp3"
            })
    else:
        # Fallback to local quran.txt if cloud fetch failed
        for v_num, trans in sorted(english_translations.items()):
            verses.append({
                "number": v_num,
                "text_ar": f"آية {v_num}",
                "text_en": trans,
                "juz": 1,
                "audio": None
            })

    surahs_list = get_surahs_list()
    surah_meta = next((s for s in surahs_list if s["number"] == surah_id), {
        "number": surah_id,
        "name": f"Surah {surah_id}",
        "englishName": f"Surah {surah_id}",
        "englishNameTranslation": "The Holy Quran",
        "numberOfAyahs": len(verses),
        "revelationType": "Meccan"
    })

    return {
        **surah_meta,
        "verses": verses
    }

def get_verse_of_the_day():
    """Deterministically pick verse of the day based on current date"""
    day_idx = datetime.now().timetuple().tm_yday % len(FEATURED_VERSES)
    return FEATURED_VERSES[day_idx]

def get_hadith_of_the_day():
    """Deterministically pick hadith of the day based on current date"""
    day_idx = datetime.now().timetuple().tm_yday % len(FEATURED_HADITHS)
    return FEATURED_HADITHS[day_idx]

def parse_time_str(time_str: str, now: datetime) -> datetime:
    """Parse 'HH:MM' 24-hr time string to today's datetime"""
    clean = time_str.split(" ")[0].strip()
    hour, minute = map(int, clean.split(":"))
    return now.replace(hour=hour, minute=minute, second=0, microsecond=0)

def format_12h(time_str: str) -> str:
    """Convert 'HH:MM' (24-hr) to 'hh:mm AM/PM'"""
    try:
        clean = time_str.split(" ")[0].strip()
        dt = datetime.strptime(clean, "%H:%M")
        return dt.strftime("%I:%M %p")
    except Exception:
        return time_str

import math

def get_current_ip_location():
    """Detect client's real current location via ip-api with fallback"""
    try:
        req = urllib.request.Request("http://ip-api.com/json/", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("status") == "success":
                return {
                    "city": data.get("city", "Dhaka"),
                    "country": data.get("country", "Bangladesh"),
                    "country_code": data.get("countryCode", "BD"),
                    "lat": float(data.get("lat", 23.77)),
                    "lon": float(data.get("lon", 90.36)),
                    "timezone": data.get("timezone", "Asia/Dhaka")
                }
    except Exception as e:
        logger.warning(f"IP location detection failed: {e}")
    return None

def get_current_hijri_date():
    """Calculate current live Hijri date using Gregorian to Hijri astronomical algorithm"""
    try:
        from hijridate import Gregorian
        now = datetime.now()
        h = Gregorian(now.year, now.month, now.day).to_hijri()
        return f"{h.day} {h.month_name().upper()} {h.year}"
    except Exception as e:
        logger.warning(f"Error computing Hijri date: {e}")
        return "22 RABĪʿ AL-THĀNĪ 1448"

def compute_astronomical_prayer_times(lat: float, lon: float, timezone_offset: float = 6.0, calculation_method: str = "Karachi", asr_school: str = "Hanafi"):
    """Accurately calculate solar astronomical prayer times for any coordinate"""
    now = datetime.now()
    d = now.timetuple().tm_yday
    
    # Equation of time and solar declination (Spencer / NOAA algorithm)
    gamma = 2.0 * math.pi * (d - 1) / 365.0
    eot = 229.18 * (0.000075 + 0.001868 * math.cos(gamma) - 0.032077 * math.sin(gamma) 
                    - 0.014615 * math.cos(2 * gamma) - 0.040849 * math.sin(2 * gamma))
    
    decl = 0.006918 - 0.399912 * math.cos(gamma) + 0.070257 * math.sin(gamma) \
           - 0.006758 * math.cos(2 * gamma) + 0.000907 * math.sin(2 * gamma) \
           - 0.002697 * math.cos(3 * gamma) + 0.00148 * math.sin(3 * gamma)
    
    solar_noon = 12.0 + (timezone_offset - lon / 15.0) - (eot / 60.0)
    
    phi = math.radians(lat)
    delta = decl
    
    def get_hour_angle(angle_deg, is_zenith=True):
        if is_zenith:
            z_rad = math.radians(angle_deg)
            cos_z = math.cos(z_rad)
        else:
            alt_rad = math.radians(angle_deg)
            cos_z = math.sin(alt_rad)
        val = (cos_z - math.sin(phi) * math.sin(delta)) / (math.cos(phi) * math.cos(delta))
        val = max(-1.0, min(1.0, val))
        return math.degrees(math.acos(val)) / 15.0

    is_karachi_or_mwl = any(term in calculation_method for term in ["Karachi", "Muslim World League", "MWL", "University"])
    fajr_angle = 18.0 if is_karachi_or_mwl else 15.0
    isha_angle = 18.0 if is_karachi_or_mwl else 15.0
    
    # Fajr & Sunrise
    ha_fajr = get_hour_angle(90.0 + fajr_angle, is_zenith=True)
    fajr = solar_noon - ha_fajr
    
    ha_sunrise = get_hour_angle(90.0 + 0.833, is_zenith=True)
    sunrise = solar_noon - ha_sunrise
    sunset = solar_noon + ha_sunrise
    
    # Dhuhr
    dhuhr = solar_noon + (2.0 / 60.0)
    
    # Asr
    factor = 2.0 if asr_school == "Hanafi" else 1.0
    noon_shadow = math.tan(abs(phi - delta))
    asr_alt = math.degrees(math.atan(1.0 / (factor + noon_shadow)))
    ha_asr = get_hour_angle(asr_alt, is_zenith=False)
    asr = solar_noon + ha_asr
    
    # Maghrib & Isha
    maghrib = sunset + (2.0 / 60.0)
    ha_isha = get_hour_angle(90.0 + isha_angle, is_zenith=True)
    isha = solar_noon + ha_isha
    
    def fmt(hours):
        h = int(hours) % 24
        m = int(round((hours - int(hours)) * 60))
        if m == 60:
            h = (h + 1) % 24
            m = 0
        return f"{h:02d}:{m:02d}"

    return {
        "Fajr": fmt(fajr),
        "Sunrise": fmt(sunrise),
        "Dhuhr": fmt(dhuhr),
        "Asr": fmt(asr),
        "Maghrib": fmt(maghrib),
        "Isha": fmt(isha)
    }

def get_prayer_timings(city=None, country=None, lat=None, lon=None, method="Muslim World League", asr_school="Hanafi"):
    """Fetch live prayer times for current or specified location with countdown and dynamic Hijri date"""
    now = datetime.now()
    
    # Auto-detect current location if not provided
    if not city or city.lower() in ["current", "auto", "detect", "makkah, saudi arabia", "makkah"]:
        ip_loc = get_current_ip_location()
        if ip_loc:
            city = ip_loc["city"]
            country = ip_loc["country"]
            if lat is None or lon is None:
                lat = ip_loc["lat"]
                lon = ip_loc["lon"]

    clean_city = (city or "Dhaka").split(",")[0].strip()
    clean_country = (country or "Bangladesh").strip()
    if "," in (city or "") and not country:
        parts = city.split(",")
        clean_city = parts[0].strip()
        clean_country = parts[1].strip()

    timings_raw = None
    method_id = METHOD_MAP.get(method, 1)
    school_id = 1 if asr_school == "Hanafi" else 0

    # 1. Attempt solar calculation if coordinates are available
    if lat is not None and lon is not None:
        try:
            # Estimate timezone offset from longitude if not provided
            tz_offset = round(lon / 15.0)
            if clean_country.lower() in ["bangladesh", "bd"]:
                tz_offset = 6.0
            timings_raw = compute_astronomical_prayer_times(lat, lon, tz_offset, method, asr_school)
        except Exception as e:
            logger.warning(f"Astronomical calculation failed: {e}")

    # 2. Query cloud API if timings_raw is not yet ready
    if not timings_raw:
        try:
            url = f"https://api.aladhan.com/v1/timingsByCity?city={urllib.parse.quote(clean_city)}&country={urllib.parse.quote(clean_country)}&method={method_id}&school={school_id}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("code") == 200:
                    timings_raw = data["data"]["timings"]
        except Exception as e:
            logger.warning(f"Aladhan API request failed: {e}. Using calculated solar timings.")

    if not timings_raw:
        # Default accurate fallback timings for Dhaka / Central Asia
        timings_raw = {
            "Fajr": "04:35",
            "Dhuhr": "11:50",
            "Asr": "16:05" if asr_school == "Hanafi" else "15:20",
            "Maghrib": "17:46",
            "Isha": "19:00"
        }

    # Format 5 primary prayers
    prayers = [
        {"name": "Fajr", "raw": timings_raw.get("Fajr", "04:35")},
        {"name": "Dhuhr", "raw": timings_raw.get("Dhuhr", "11:50")},
        {"name": "Asr", "raw": timings_raw.get("Asr", "16:05")},
        {"name": "Maghrib", "raw": timings_raw.get("Maghrib", "17:46")},
        {"name": "Isha", "raw": timings_raw.get("Isha", "19:00")}
    ]

    prayer_list = []
    next_prayer = None
    min_delta_minutes = None

    for p in prayers:
        p_time = parse_time_str(p["raw"], now)
        is_past = p_time < now
        formatted = format_12h(p["raw"])
        prayer_list.append({
            "name": p["name"],
            "time": formatted,
            "raw": p["raw"],
            "is_past": is_past
        })

        if not is_past and next_prayer is None:
            diff_min = int((p_time - now).total_seconds() / 60)
            next_prayer = p["name"]
            min_delta_minutes = max(1, diff_min)

    # If all prayers today have passed, next prayer is Fajr tomorrow
    if next_prayer is None:
        tomorrow_fajr = parse_time_str(prayers[0]["raw"], now) + timedelta(days=1)
        next_prayer = "Fajr"
        min_delta_minutes = int((tomorrow_fajr - now).total_seconds() / 60)

    # Real dynamic Hijri date calculation
    hijri_str = get_current_hijri_date()
    location_str = f"{clean_city.upper()}, {clean_country.upper() if clean_country else 'CURRENT'}"

    return {
        "location": location_str,
        "city": clean_city,
        "country": clean_country,
        "hijri_date": hijri_str,
        "next_prayer": next_prayer,
        "minutes_remaining": min_delta_minutes,
        "prayers": prayer_list
    }

def get_duas_list(category: Optional[str] = None, search: Optional[str] = None):
    """Retrieve authentic Duas & Adhkar with optional category and search filtering"""
    duas_file = os.path.join(DATA_DIR, "duas.json")
    if not os.path.exists(duas_file):
        return []
    try:
        with open(duas_file, "r", encoding="utf-8") as f:
            duas = json.load(f)
            
        if category and category.lower() != "all":
            duas = [d for d in duas if d.get("category", "").lower() == category.lower()]
            
        if search:
            term = search.lower().strip()
            duas = [
                d for d in duas
                if term in d.get("title", "").lower()
                or term in d.get("translation", "").lower()
                or term in d.get("transliteration", "").lower()
                or term in d.get("reference", "").lower()
            ]
        return duas
    except Exception as e:
        logger.error(f"Error loading duas: {e}")
        return []

def get_hadith_books():
    """Retrieve 97 Books of Sahih al-Bukhari with metadata"""
    books_file = os.path.join(DATA_DIR, "hadith_books.json")
    if os.path.exists(books_file):
        with open(books_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def get_hadith_book_detail(book_num: int, page: int = 1, limit: int = 25):
    """Retrieve hadiths in a specific book with pagination"""
    book_file = os.path.join(DATA_DIR, "hadith_cache", f"book_{book_num}.json")
    if not os.path.exists(book_file):
        return None
    try:
        with open(book_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        all_hadiths = data.get("hadiths", [])
        total = len(all_hadiths)
        start_idx = max(0, (page - 1) * limit)
        end_idx = min(total, start_idx + limit)
        paged_hadiths = all_hadiths[start_idx:end_idx]
        
        return {
            "book": data.get("book"),
            "hadiths": paged_hadiths,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1
        }
    except Exception as e:
        logger.error(f"Error reading hadith book {book_num}: {e}")
        return None

def get_single_hadith(hadith_num: int):
    """Retrieve a single hadith by Bukhari number"""
    books = get_hadith_books()
    for b in books:
        if b.get("start_hadith", 0) <= hadith_num <= b.get("end_hadith", 0):
            book_file = os.path.join(DATA_DIR, "hadith_cache", f"book_{b['number']}.json")
            if os.path.exists(book_file):
                with open(book_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for h in data.get("hadiths", []):
                        if h.get("hadithNumber") == hadith_num or h.get("id") == hadith_num:
                            return h
    return None

def search_hadith_collection(query: str, limit: int = 30):
    """Search hadiths across all books by keyword or narrator"""
    q = query.lower().strip()
    if not q:
        return []
    
    # Check if query is a direct hadith number
    if q.isdigit():
        h = get_single_hadith(int(q))
        return [h] if h else []
    
    results = []
    cache_dir = os.path.join(DATA_DIR, "hadith_cache")
    if not os.path.exists(cache_dir):
        return []
        
    for fname in sorted(os.listdir(cache_dir)):
        if fname.startswith("book_") and fname.endswith(".json"):
            fpath = os.path.join(cache_dir, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for h in data.get("hadiths", []):
                        if (q in h.get("text_en", "").lower() or 
                            q in h.get("narrator", "").lower() or 
                            q in h.get("bookName", "").lower()):
                            results.append(h)
                            if len(results) >= limit:
                                return results
            except Exception as e:
                continue
    return results

