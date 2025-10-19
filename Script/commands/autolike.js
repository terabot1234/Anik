import requests
import time
import schedule
import logging
from datetime import datetime

# লগিং সেটআপ
logging.basicConfig(
    filename='freefire_autolike.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# কনফিগারেশন
FREEFIRE_UID = "YOUR_FREEFIRE_UID_HERE"  # গেম থেকে UID কপি করুন (যেমন: 123456789)
API_KEY = "YOUR_API_KEY_HERE"  # HL Gaming বা অন্য সার্ভিস থেকে API কী নিন
API_URL = "https://api.hlgamingofficial.com/freefire/likes"  # HL Gaming API (কাল্পনিক, বাস্তব API ব্যবহার করুন)
DAILY_LIMIT = 100  # Garena-এর দৈনিক লিমিট
REGION = "BD"  # আপনার রিজিয়ন (যেমন: BD, IN, BR)

def setup_environment():
    """প্রয়োজনীয় ডিপেনডেন্সি চেক করুন"""
    try:
        import requests
        import schedule
    except ImportError:
        print("ত্রুটি: প্রয়োজনীয় মডিউল নেই। ইনস্টল করা হচ্ছে...")
        import os
        os.system("pip install requests schedule")
        print("মডিউল ইনস্টল করা হয়েছে। স্ক্রিপ্ট পুনরায় চালান।")
        exit()

def validate_config():
    """কনফিগারেশন চেক করুন"""
    if not FREEFIRE_UID or FREEFIRE_UID == "YOUR_FREEFIRE_UID_HERE":
        logging.error("UID সেট করা হয়নি!")
        print("ত্রুটি: দয়া করে FREEFIRE_UID সেট করুন।")
        return False
    if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        logging.error("API কী সেট করা হয়নি!")
        print("ত্রুটি: দয়া করে API_KEY সেট করুন।")
        return False
    return True

def send_likes(uid, amount=DAILY_LIMIT, region=REGION):
    """Free Fire UID-তে লাইক পাঠায়"""
    if amount > DAILY_LIMIT:
        logging.warning(f"লিমিট অতিক্রম! {DAILY_LIMIT} এ সেট করা হয়েছে।")
        amount = DAILY_LIMIT
    
    payload = {
        "uid": uid,
        "amount": amount,
        "region": region,
        "api_key": API_KEY
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        data = response.json()
        
        if response.status_code == 200 and data.get("success"):
            message = f"সফল! {amount} লাইক পাঠানো হয়েছে UID: {uid}"
            logging.info(message)
            print(message)
            print(f"API মেসেজ: {data.get('message')}")
            return True
        else:
            error = data.get("error", "API ত্রুটি। পরে চেষ্টা করুন।")
            logging.error(f"লাইক পাঠাতে ব্যর্থ: {error}")
            print(f"ত্রুটি: {error}")
            return False
    except requests.exceptions.RequestException as e:
        logging.error(f"নেটওয়ার্ক ত্রুটি: {str(e)}")
        print(f"ত্রুটি ঘটেছে: {str(e)}")
        return False

def check_like_status(uid):
    """লাইকের স্ট্যাটাস চেক করে"""
    try:
        response = requests.get(f"{API_URL}/status?uid={uid}&api_key={API_KEY}", timeout=5)
        data = response.json()
        status = data.get("likes", "ডাটা পাওয়া যায়নি")
        logging.info(f"লাইক স্ট্যাটাস UID {uid}: {status}")
        print(f"লাইক স্ট্যাটাস: {status}")
    except requests.exceptions.RequestException as e:
        logging.error(f"স্ট্যাটাস চেকে ত্রুটি: {str(e)}")
        print(f"স্ট্যাটাস চেকে ত্রুটি: {str(e)}")

def daily_like_job():
    """দৈনিক লাইক পাঠানোর জন্য শিডিউল"""
    logging.info("দৈনিক লাইক পাঠানো শুরু...")
    print(f"{datetime.now()}: দৈনিক লাইক পাঠানো হচ্ছে...")
    if validate_config():
        if send_likes(FREEFIRE_UID):
            check_like_status(FREEFIRE_UID)

def main():
    """মেইন ফাংশন"""
    setup_environment()
    if not validate_config():
        return
    
    # তাৎক্ষণিক লাইক পাঠান
    daily_like_job()
    
    # প্রতিদিন সকাল ৪টায় লাইক পাঠানোর শিডিউল
    schedule.every().day.at("04:00").do(daily_like_job)
    
    print("দৈনিক শিডিউল চালু। প্রতিদিন সকাল ৪টায় লাইক পাঠানো হবে।")
    logging.info("শিডিউলার চালু।")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # প্রতি মিনিটে শিডিউল চেক

if __name__ == "__main__":
    main()
