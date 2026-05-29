import time
import random
import string

BASE_URL = "https://app-testing-ivory.vercel.app"


def uid():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"user_{int(time.time() * 1000)}_{suffix}"
