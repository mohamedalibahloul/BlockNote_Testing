import pytest
import time
import random
import string

BASE_URL = "https://app-testing-ivory.vercel.app"


def uid():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"user_{int(time.time() * 1000)}_{suffix}"


def register_user(page, username, email, password):
    page.goto(BASE_URL)
    page.click('[data-testid="tab-register"]')
    page.fill('[data-testid="register-username"]', username)
    page.fill('[data-testid="register-email"]', email)
    page.fill('[data-testid="register-password"]', password)
    page.click('[data-testid="register-submit"]')


# =============================================================================
# STC-AUTH-REG-001
# =============================================================================
@pytest.mark.meta(
    precondition="The app is accessible at BASE_URL. No user is logged in.",
    steps=[
        "Navigate to the app home page",
        "Click the 'Register' tab",
        "Observe the register form",
    ],
    expected_result="The register form is visible on screen.",
)
def test_stc_auth_reg_001_register_tab_shows_form(page):
    page.goto(BASE_URL)
    page.click('[data-testid="tab-register"]')
    assert page.locator('[data-testid="register-form"]').is_visible()


# =============================================================================
# STC-AUTH-REG-002
# =============================================================================
@pytest.mark.meta(
    precondition="The app is accessible. No existing account with the generated email exists.",
    steps=[
        "Navigate to the app home page",
        "Click the 'Register' tab",
        "Fill in a unique username, email, and password (>=6 chars)",
        "Click the register submit button",
        "Wait for redirect to the notes page",
    ],
    expected_result="User is redirected to the notes page. 'New note' button and username display are visible.",
)
def test_stc_auth_reg_002_valid_registration_lands_on_notes(page):
    u = uid()
    register_user(page, u, f"{u}@test.com", "password123")

    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)

    assert page.locator('[data-testid="new-note-btn"]').is_visible()
    assert page.locator('[data-testid="username-display"]').inner_text() == u


# =============================================================================
# STC-AUTH-REG-003
# =============================================================================
@pytest.mark.meta(
    precondition="A user account already exists with a known email.",
    steps=[
        "Register a new user with email X",
        "Wait for registration to succeed",
        "Logout",
        "Click the 'Register' tab",
        "Fill in a different username but the same email X",
        "Click the register submit button",
    ],
    expected_result="An inline error is shown indicating the email is already in use.",
)
def test_stc_auth_reg_003_duplicate_email_shows_error(page):
    u = uid()
    email = f"{u}@test.com"

    # First registration
    register_user(page, u, email, "password123")
    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)

    # Logout
    page.click('[data-testid="logout-btn"]')

    # Attempt duplicate registration
    page.click('[data-testid="tab-register"]')
    page.fill('[data-testid="register-username"]', f"{u}_2")
    page.fill('[data-testid="register-email"]', email)
    page.fill('[data-testid="register-password"]', "password123")
    page.click('[data-testid="register-submit"]')

    assert page.locator('[data-testid="register-error"]').is_visible()


# =============================================================================
# STC-AUTH-REG-004
# =============================================================================
@pytest.mark.meta(
    precondition="The app is accessible. No user is logged in.",
    steps=[
        "Navigate to the app home page",
        "Click the 'Register' tab",
        "Fill in a username, email, and a password shorter than 6 characters (e.g. '123')",
        "Click the register submit button",
    ],
    expected_result="Registration is rejected. The register form remains visible. Notes page is NOT shown.",
)
def test_stc_auth_reg_004_short_password_rejected(page):
    u = uid()
    register_user(page, u, f"{u}@test.com", "123")

    assert page.locator('[data-testid="register-form"]').is_visible()
    assert not page.locator('[data-testid="new-note-btn"]').is_visible()


# =============================================================================
# STC-AUTH-LOGIN-001
# =============================================================================
@pytest.mark.meta(
    precondition="A valid registered account exists (pre-created via registration flow).",
    steps=[
        "Navigate to the app home page",
        "Fill in the correct email and password",
        "Click the login submit button",
        "Wait for redirect to notes page",
    ],
    expected_result="User is successfully logged in. 'New note' button is visible.",
)
def test_stc_auth_login_001_valid_credentials_login(page):
    # Create account first
    u = uid()
    email = f"{u}@test.com"
    password = "password123"
    register_user(page, u, email, password)
    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)
    page.click('[data-testid="logout-btn"]')

    # Login
    page.fill('[data-testid="login-email"]', email)
    page.fill('[data-testid="login-password"]', password)
    page.click('[data-testid="login-submit"]')

    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)
    assert page.locator('[data-testid="new-note-btn"]').is_visible()


# =============================================================================
# STC-AUTH-LOGIN-002
# =============================================================================
@pytest.mark.meta(
    precondition="A valid registered account exists.",
    steps=[
        "Navigate to the app home page",
        "Fill in the correct email with a wrong password",
        "Click the login submit button",
    ],
    expected_result="An inline error message is shown. User is NOT redirected to notes page.",
)
def test_stc_auth_login_002_wrong_password_shows_error(page):
    # Create account first
    u = uid()
    email = f"{u}@test.com"
    register_user(page, u, email, "password123")
    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)
    page.click('[data-testid="logout-btn"]')

    # Login with wrong password
    page.fill('[data-testid="login-email"]', email)
    page.fill('[data-testid="login-password"]', "wrongpassword")
    page.click('[data-testid="login-submit"]')

    assert page.locator('[data-testid="login-error"]').is_visible()


# =============================================================================
# STC-AUTH-LOGIN-003
# =============================================================================
@pytest.mark.meta(
    precondition="The app is accessible. No user is logged in.",
    steps=[
        "Navigate to the app home page",
        "Fill in an email that has never been registered",
        "Fill in any password",
        "Click the login submit button",
    ],
    expected_result="An inline error message is shown for non-existent account.",
)
def test_stc_auth_login_003_nonexistent_user_shows_error(page):
    page.goto(BASE_URL)
    page.fill('[data-testid="login-email"]', "nobody@nowhere.com")
    page.fill('[data-testid="login-password"]', "anypassword")
    page.click('[data-testid="login-submit"]')

    assert page.locator('[data-testid="login-error"]').is_visible()


# =============================================================================
# STC-AUTH-LOGIN-004
# =============================================================================
@pytest.mark.meta(
    precondition="A valid registered account exists.",
    steps=[
        "Navigate to the app home page",
        "Log in with valid credentials",
        "Wait for notes page",
        "Click the logout button",
    ],
    expected_result="User is logged out and the login form is shown again.",
)
def test_stc_auth_login_004_logout_returns_to_login(page):
    # Create account first
    u = uid()
    email = f"{u}@test.com"
    register_user(page, u, email, "password123")
    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)
    page.click('[data-testid="logout-btn"]')

    # Login then logout
    page.fill('[data-testid="login-email"]', email)
    page.fill('[data-testid="login-password"]', "password123")
    page.click('[data-testid="login-submit"]')
    page.wait_for_selector('[data-testid="new-note-btn"]', timeout=10000)
    page.click('[data-testid="logout-btn"]')

    assert page.locator('[data-testid="login-form"]').is_visible()
