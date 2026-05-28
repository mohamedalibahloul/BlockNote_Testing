import pytest
import time
import random
import string

BASE_URL = "https://app-testing-ivory.vercel.app"


def uid():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"user_{int(time.time() * 1000)}_{suffix}"


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture
def new_user():
    u = uid()
    return {"username": u, "email": f"{u}@test.com", "password": "password123"}
