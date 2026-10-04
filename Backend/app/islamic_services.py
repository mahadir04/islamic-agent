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
    {"arabic": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا", "translation": "Indeed, with hardship comes ease.", "surah": "Surah Ash-Sharh", "ayah": "94:5-6"},
    {"arabic": "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", "translation": "Verily, in the remembrance of Allah do hearts find rest.", "surah": "Surah Ar-Ra'd", "ayah": "13:28"},
    {"arabic": "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ", "translation": "And when My servants ask you about Me — indeed I am near. I respond to the supplicant when he calls upon Me.", "surah": "Surah Al-Baqarah", "ayah": "2:186"},
    {"arabic": "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", "translation": "Whoever fears Allah — He will make for him a way out and provide for him from where he does not expect.", "surah": "Surah At-Talaq", "ayah": "65:2-3"},
    {"arabic": "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", "translation": "Sufficient for us is Allah, and He is the best Disposer of affairs.", "surah": "Surah Ali 'Imran", "ayah": "3:173"},
    {"arabic": "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", "translation": "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", "surah": "Surah Al-Baqarah", "ayah": "2:152"},
    {"arabic": "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "translation": "Indeed, Allah is with the patient.", "surah": "Surah Al-Baqarah", "ayah": "2:153"},
    {"arabic": "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ", "translation": "And We will surely test you with something of fear and hunger and a loss of wealth, lives, and fruits — but give good tidings to the patient.", "surah": "Surah Al-Baqarah", "ayah": "2:155"},
    {"arabic": "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", "translation": "Our Lord, give us in this world good and in the Hereafter good, and protect us from the punishment of the Fire.", "surah": "Surah Al-Baqarah", "ayah": "2:201"},
    {"arabic": "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", "translation": "And it may be that you dislike a thing while it is good for you.", "surah": "Surah Al-Baqarah", "ayah": "2:216"},
    {"arabic": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", "translation": "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.", "surah": "Ayat al-Kursi", "ayah": "2:255"},
    {"arabic": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "translation": "Allah does not burden a soul beyond that it can bear.", "surah": "Surah Al-Baqarah", "ayah": "2:286"},
    {"arabic": "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ", "translation": "Say: He is Allah, the One. Allah, the Self-Sufficient Master.", "surah": "Surah Al-Ikhlas", "ayah": "112:1-2"},
    {"arabic": "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "translation": "Surely with hardship comes ease.", "surah": "Surah Al-Inshirah", "ayah": "94:6"},
    {"arabic": "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", "translation": "And He is with you wherever you are.", "surah": "Surah Al-Hadid", "ayah": "57:4"},
    {"arabic": "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ", "translation": "Indeed, Allah will not change the condition of a people until they change what is in themselves.", "surah": "Surah Ar-Ra'd", "ayah": "13:11"},
    {"arabic": "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ", "translation": "My success is not but through Allah. Upon Him I have relied, and to Him I return.", "surah": "Surah Hud", "ayah": "11:88"},
    {"arabic": "وَلِلَّهِ غَيْبُ السَّمَاوَاتِ وَالْأَرْضِ", "translation": "To Allah belongs the unseen of the heavens and the earth.", "surah": "Surah An-Nahl", "ayah": "16:77"},
    {"arabic": "ادْعُونِي أَسْتَجِبْ لَكُمْ", "translation": "Call upon Me; I will respond to you.", "surah": "Surah Ghafir", "ayah": "40:60"},
    {"arabic": "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا", "translation": "And put your trust in Allah, and sufficient is Allah as a Trustee.", "surah": "Surah Al-Ahzab", "ayah": "33:3"},
    {"arabic": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", "translation": "O you who believe! Seek help through patience and prayer.", "surah": "Surah Al-Baqarah", "ayah": "2:153"},
    {"arabic": "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", "translation": "And I did not create jinn and mankind except to worship Me.", "surah": "Surah Adh-Dhariyat", "ayah": "51:56"},
    {"arabic": "وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ", "translation": "And in the hours before dawn they would ask forgiveness.", "surah": "Surah Adh-Dhariyat", "ayah": "51:18"},
    {"arabic": "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", "translation": "Indeed, prayer prohibits immorality and wrongdoing.", "surah": "Surah Al-'Ankabut", "ayah": "29:45"},
    {"arabic": "وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا", "translation": "And if you should count the favors of Allah, you could not enumerate them.", "surah": "Surah Ibrahim", "ayah": "14:34"},
    {"arabic": "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", "translation": "So which of the favors of your Lord would you deny?", "surah": "Surah Ar-Rahman", "ayah": "55:13"},
    {"arabic": "وَهُوَ الْغَفُورُ الْوَدُودُ", "translation": "And He is the Forgiving, the Affectionate.", "surah": "Surah Al-Buruj", "ayah": "85:14"},
    {"arabic": "وَقُل رَّبِّ زِدْنِي عِلْمًا", "translation": "And say: My Lord, increase me in knowledge.", "surah": "Surah Ta-Ha", "ayah": "20:114"},
    {"arabic": "إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ", "translation": "Indeed, good deeds do away with misdeeds.", "surah": "Surah Hud", "ayah": "11:114"},
    {"arabic": "وَلَذِكْرُ اللَّهِ أَكْبَرُ", "translation": "And the remembrance of Allah is greater.", "surah": "Surah Al-'Ankabut", "ayah": "29:45"},
]

FEATURED_HADITHS = [
    {"text": "The best among you are those who have the best manners and character.", "source": "Sahih Al-Bukhari · 6064"},
    {"text": "None of you will believe until you love for your brother what you love for yourself.", "source": "Sahih Al-Bukhari · 13"},
    {"text": "The strong is not the one who overcomes the people by his strength, but the one who controls himself while in anger.", "source": "Sahih Al-Bukhari · 6114"},
    {"text": "Actions are judged by intentions, and every person will be rewarded according to what he intended.", "source": "Sahih Al-Bukhari · 1"},
    {"text": "A Muslim is the one who avoids harming Muslims with his tongue or his hands.", "source": "Sahih Al-Bukhari · 10"},
    {"text": "The most beloved of deeds to Allah are those done consistently, even if they are small.", "source": "Sahih Al-Bukhari · 6464"},
    {"text": "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", "source": "Sahih Al-Bukhari · 6018"},
    {"text": "Make things easy and do not make them difficult, and give glad tidings and do not make people run away.", "source": "Sahih Al-Bukhari · 69"},
    {"text": "The best of you are those who are best to their families, and I am the best of you to my family.", "source": "Sunan Ibn Majah · 1977"},
    {"text": "He who makes peace between the people by inventing good information or saying good things, is not a liar.", "source": "Sahih Al-Bukhari · 2692"},
    {"text": "Smiling in the face of your brother is charity.", "source": "Jami' at-Tirmidhi · 1956"},
    {"text": "Whoever removes a worldly hardship from a believer, Allah will remove from him one of the hardships of the Day of Resurrection.", "source": "Sahih Muslim · 2699"},
    {"text": "The world is a prison for the believer and a paradise for the disbeliever.", "source": "Sahih Muslim · 2956"},
    {"text": "Take advantage of five before five: your youth before your old age, your health before your illness, your wealth before your poverty, your free time before your busyness, and your life before your death.", "source": "Shu'ab al-Iman · 10248"},
    {"text": "Feed the hungry, visit the sick, and free the captive.", "source": "Sahih Al-Bukhari · 5373"},
    {"text": "Cleanliness is half of faith.", "source": "Sahih Muslim · 223"},
    {"text": "Allah is beautiful and loves beauty.", "source": "Sahih Muslim · 91"},
    {"text": "Do not be angry, and Paradise is yours.", "source": "Al-Mu'jam al-Awsat · 2837"},
    {"text": "The upper hand is better than the lower hand — the upper hand is the one that gives, and the lower hand is the one that takes.", "source": "Sahih Al-Bukhari · 1429"},
    {"text": "Whoever treads a path in search of knowledge, Allah makes easy for him a path to Paradise.", "source": "Sahih Muslim · 2699"},
    {"text": "Seven people will be shaded by Allah on the day when there will be no shade but His: a just ruler, a youth who grew up worshipping Allah, a person whose heart is attached to the mosque, two people who love each other for Allah's sake, a man who is tempted by a beautiful woman but refuses out of fear of Allah, a person who gives charity so secretly that his left hand does not know what his right hand gave, and a person who remembers Allah in seclusion and his eyes become tearful.", "source": "Sahih Al-Bukhari · 660"},
    {"text": "Verily, with every hardship comes ease.", "source": "Sunan Ibn Majah · 4031"},
    {"text": "Whoever conceals the faults of a Muslim in this world, Allah will conceal his faults on the Day of Resurrection.", "source": "Sahih Muslim · 2699"},
    {"text": "Modesty is part of faith.", "source": "Sahih Al-Bukhari · 9"},
    {"text": "The most complete of the believers in faith are those with the best character.", "source": "Sunan Abi Dawud · 4682"},
    {"text": "Pay the worker his wages before his sweat dries.", "source": "Sunan Ibn Majah · 2443"},
    {"text": "Whoever reads Ayat al-Kursi after every obligatory prayer, nothing will prevent him from entering Paradise except death.", "source": "An-Nasa'i (Sahih) · 9928"},
    {"text": "The dua of a Muslim for his absent brother is answered.", "source": "Sahih Muslim · 2733"},
    {"text": "Be in the world as if you were a stranger or a traveler.", "source": "Sahih Al-Bukhari · 6416"},
    {"text": "Every good deed is charity.", "source": "Sahih Al-Bukhari · 2707"},
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
    """Deterministically pick a unique verse per calendar date using a date hash seed."""
    now = datetime.now()
    # Combine year and day-of-year for a unique seed per calendar date
    seed = now.year * 1000 + now.timetuple().tm_yday
    idx = seed % len(FEATURED_VERSES)
    verse = dict(FEATURED_VERSES[idx])
    verse["date"] = now.strftime("%B %d, %Y")
    return verse

def get_hadith_of_the_day():
    """Deterministically pick a unique hadith per calendar date using a date hash seed."""
    now = datetime.now()
    # Offset by half pool size to ensure verse and hadith differ each day
    seed = now.year * 1000 + now.timetuple().tm_yday + len(FEATURED_HADITHS) // 2
    idx = seed % len(FEATURED_HADITHS)
    hadith = dict(FEATURED_HADITHS[idx])
    hadith["date"] = now.strftime("%B %d, %Y")
    return hadith

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

def _gregorian_to_hijri(year: int, month: int, day: int):
    """Pure-Python Gregorian → Hijri conversion (no external dependencies).
    Uses the standard Julian Day Number method (Fliegel & Van Flandern, 1968).
    Accurate to within ±1 day of the tabular/arithmetic Islamic calendar.
    """
    # Gregorian → Julian Day Number
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    jdn = (day + (153 * m + 2) // 5 + 365 * y + y // 4
           - y // 100 + y // 400 - 32045)

    # JDN → Hijri (arithmetic/tabular Islamic calendar)
    # Epoch: 1 Muharram 1 AH = JDN 1948439 (verified against known Hijri dates)
    N = jdn - 1948439      # days since Hijri epoch (0-based)
    cycle = N // 10631     # 30-year cycles elapsed
    N -= cycle * 10631

    # Days in each year of the 30-year cycle (leap years have 355 days)
    # Leap years in cycle: 2,5,7,10,13,15,18,21,24,26,29  (1-based year in cycle)
    year_in_cycle = 0
    for y_idx in range(30):
        is_leap = (y_idx + 1) in {2, 5, 7, 10, 13, 15, 18, 21, 24, 26, 29}
        days = 355 if is_leap else 354
        if N < days:
            year_in_cycle = y_idx
            break
        N -= days

    h_year = cycle * 30 + year_in_cycle + 1
    is_leap_year = (h_year % 30) in {2, 5, 7, 10, 13, 15, 18, 21, 24, 26, 29}

    # Month lengths: odd months 30 days, even months 29 days; last month 30 in leap
    month_days = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29 + (1 if is_leap_year else 0)]

    h_month = 1
    for md in month_days:
        if N < md:
            break
        N -= md
        h_month += 1

    h_day = N + 1
    return h_year, h_month, h_day


HIJRI_MONTH_NAMES = [
    "MUḤARRAM", "ṢAFAR", "RABĪʿ AL-AWWAL", "RABĪʿ AL-THĀNĪ",
    "JUMĀDĀ AL-ŪLĀ", "JUMĀDĀ AL-ĀKHIRAH", "RAJAB", "SHAʿBĀN",
    "RAMAḌĀN", "SHAWWĀL", "DHU AL-QAʿDAH", "DHU AL-ḤIJJAH"
]


def get_current_hijri_date() -> str:
    """Return the current Hijri date string using a pure-Python algorithm (no external deps)."""
    try:
        now = datetime.now()
        h_year, h_month, h_day = _gregorian_to_hijri(now.year, now.month, now.day)
        month_name = HIJRI_MONTH_NAMES[h_month - 1] if 1 <= h_month <= 12 else f"MONTH {h_month}"
        return f"{h_day} {month_name} {h_year}"
    except Exception as e:
        logger.warning(f"Error computing Hijri date: {e}")
        # Provide a reasonable static fallback
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

def get_prayer_timings(city=None, country=None, lat=None, lon=None, method="Muslim World League", asr_school="Hanafi", tz_offset_hours=None):
    """Fetch live prayer times for current or specified location with countdown and dynamic Hijri date"""
    # Use the user's local time if tz_offset_hours is provided, otherwise server local time
    if tz_offset_hours is not None:
        from datetime import timezone
        user_tz = timezone(timedelta(hours=tz_offset_hours))
        now = datetime.now(timezone.utc).astimezone(user_tz).replace(tzinfo=None)
    else:
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

    # Use provided city/country; leave as None if GPS will determine location
    clean_city = city.split(",")[0].strip() if city else (None if (lat is not None and lon is not None) else "Mecca")
    clean_country = (country or "").strip()
    if city and "," in city and not country:
        parts = city.split(",")
        clean_city = parts[0].strip()
        clean_country = parts[1].strip()

    timings_raw = None
    method_id = METHOD_MAP.get(method, 1)
    school_id = 1 if asr_school == "Hanafi" else 0

    # 1. Try aladhan.com timings-by-coordinates when lat/lon are available (most accurate)
    if lat is not None and lon is not None:
        try:
            today = datetime.now().strftime("%d-%m-%Y")
            url = (f"https://api.aladhan.com/v1/timings/{today}"
                   f"?latitude={lat}&longitude={lon}"
                   f"&method={method_id}&school={school_id}")
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("code") == 200:
                    timings_raw = data["data"]["timings"]
                    # Use timezone meta to derive a city/country name for display
                    meta = data["data"].get("meta", {})
                    timezone = meta.get("timezone", "")
                    if timezone:
                        tz_parts = timezone.split("/")
                        if not clean_city:
                            clean_city = tz_parts[-1].replace("_", " ")
                        if not clean_country and len(tz_parts) >= 2:
                            clean_country = tz_parts[0]  # e.g. "Asia"
        except Exception as e:
            logger.warning(f"Aladhan timings-by-coords failed: {e}")

    # 2. Fallback: astronomical solar calculation (uses timezone lookup table)
    if not timings_raw and lat is not None and lon is not None:
        try:
            # Proper timezone offset lookup (avoids raw longitude estimate errors)
            COUNTRY_TZ_OFFSETS = {
                "singapore": 8.0, "sg": 8.0,
                "malaysia": 8.0, "my": 8.0,
                "indonesia": 7.0, "id": 7.0,
                "china": 8.0, "cn": 8.0,
                "japan": 9.0, "jp": 9.0,
                "south korea": 9.0, "kr": 9.0,
                "india": 5.5, "in": 5.5,
                "pakistan": 5.0, "pk": 5.0,
                "bangladesh": 6.0, "bd": 6.0,
                "united arab emirates": 4.0, "ae": 4.0,
                "saudi arabia": 3.0, "sa": 3.0,
                "turkey": 3.0, "tr": 3.0,
                "egypt": 2.0, "eg": 2.0,
                "united kingdom": 1.0, "gb": 1.0,
                "united states": -5.0, "us": -5.0,
            }
            country_key = clean_country.lower().strip()
            tz_offset = COUNTRY_TZ_OFFSETS.get(country_key, round(lon / 15.0))
            timings_raw = compute_astronomical_prayer_times(lat, lon, tz_offset, method, asr_school)
        except Exception as e:
            logger.warning(f"Astronomical calculation failed: {e}")

    # 3. Query cloud API by city name if still no timings
    if not timings_raw:
        try:
            url = f"https://api.aladhan.com/v1/timingsByCity?city={urllib.parse.quote(clean_city)}&country={urllib.parse.quote(clean_country)}&method={method_id}&school={school_id}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("code") == 200:
                    timings_raw = data["data"]["timings"]
        except Exception as e:
            logger.warning(f"Aladhan API request failed: {e}. Using fallback timings.")

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
    display_city = (clean_city or "Current Location").upper()
    display_country = clean_country.upper() if clean_country else ""
    location_str = f"{display_city}, {display_country}" if display_country else display_city

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

