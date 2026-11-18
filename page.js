import { projectUrl, publicKey } from "./config.js";

const $ = (id) => document.getElementById(id);
const translations = {
  ar: {
    privacyPolicy: "سياسة الخصوصية",
    title: "حذف حساب Dwallet", description: "حذف الحساب يمسح حساب Dwallet ونسخه السحابية ونشاطه المرتبط به نهائيًا. العناصر المحفوظة محليًا تُدار من الجهاز المحفوظة عليه.",
    ownership: "تحقّق من حسابك", email: "البريد الإلكتروني", password: "كلمة سر Dwallet", continue: "متابعة",
    recovery: "اختار حساب Google المرتبط بـDwallet، أو ادخل ببريد Dwallet وكلمة السر.",
    google: "المتابعة باستخدام Google",
    accountNotFoundTitle: "الحساب مش موجود",
    accountNotFound: "حساب Google ده مش مسجّل في Dwallet. اختار حساب Google اللي بتستخدمه جوه التطبيق. ما اتحذفش أي حساب.",
    errorTitle: "في مشكلة محتاجة مراجعة", workingTitle: "لحظة من فضلك", doneTitle: "تم حذف الحساب",
    credentialsTitle: "راجع بيانات الدخول", invalidCredentials: "البريد غير مسجّل أو كلمة السر غير صحيحة. لو بتدخل Dwallet باستخدام Google، استخدم زر Google اللي تحت.",
    emailNotFound: "البريد ده مش مسجّل في Dwallet. راجع البريد واستخدم الحساب اللي بتدخل بيه التطبيق.",
    confirmEmailTitle: "أكد بريدك الإلكتروني", emailUnconfirmed: "افتح رسالة التأكيد اللي وصلتك من Dwallet وأكد البريد، وبعدها جرّب تاني.",
    rateLimitTitle: "محاولات كتير في وقت قصير", rateLimited: "استنى شوية قبل ما تحاول تسجيل الدخول تاني.",
    serviceTitle: "الخدمة مش متاحة مؤقتًا", serviceUnavailable: "خدمة تسجيل الدخول مش متاحة دلوقتي. جرّب كمان شوية.",
    connectionTitle: "تعذّر الاتصال", connectionError: "مقدرناش نتصل بخدمة تسجيل الدخول. تأكد من الإنترنت وجرّب تاني.",
    confirmTitle: "تأكيد حذف الحساب", confirm: "أفهم إن الحساب والنسخ السحابية لا يمكن استرجاعهم.", delete: "حذف حسابي نهائيًا", cancel: "إلغاء",
    working: "جارٍ التنفيذ…", signInError: "تعذر تسجيل الدخول. راجع البيانات وتأكد إن الحساب مفعّل، أو جرّب تسجيل الدخول من جديد.",
    deleteError: "لم يتأكد اكتمال حذف الحساب. جرّب مرة تانية. لو انتهت الجلسة، سجّل دخول من جديد.",
    expired: "انتهت جلسة التحقق. سجّل الدخول من جديد.", done: "تم حذف حسابك وبياناته السحابية. افتح Dwallet على كل جهاز ووصّله بالإنترنت لاختيار الاحتفاظ بخزنة محلية أو حذف نسخة الجهاز.",
    localCopy: "بعد الحذف، افتح Dwallet على كل جهاز ووصّله بالإنترنت. التطبيق هيسألك تحتفظ بخزنة محلية منفصلة ولا تحذف نسخة الجهاز.",
  },
  it: {
    privacyPolicy: "Informativa sulla privacy",
    title: "Elimina il tuo account Dwallet", description: "L’eliminazione rimuove definitivamente l’account Dwallet, i backup sul cloud e le attività collegate. Gli elementi salvati sul dispositivo si gestiscono da quel dispositivo.",
    ownership: "Verifica il tuo account", email: "Indirizzo email", password: "Password di Dwallet", continue: "Continua",
    recovery: "Scegli l’account Google collegato a Dwallet o accedi con email e password di Dwallet.",
    google: "Continua con Google",
    accountNotFoundTitle: "Account non trovato",
    accountNotFound: "Questo account Google non è registrato su Dwallet. Scegli l’account Google che usi nell’app. Nessun account è stato eliminato.",
    errorTitle: "Si è verificato un problema", workingTitle: "Attendi un momento", doneTitle: "Account eliminato",
    credentialsTitle: "Controlla i dati di accesso", invalidCredentials: "Email non registrata o password errata. Se accedi a Dwallet con Google, usa il pulsante Google qui sotto.",
    emailNotFound: "Questa email non è registrata su Dwallet. Controlla l’indirizzo e usa l’account con cui accedi all’app.",
    confirmEmailTitle: "Conferma la tua email", emailUnconfirmed: "Apri l’email di conferma di Dwallet, conferma l’indirizzo e riprova.",
    rateLimitTitle: "Troppi tentativi", rateLimited: "Attendi qualche minuto prima di provare ad accedere di nuovo.",
    serviceTitle: "Servizio temporaneamente non disponibile", serviceUnavailable: "Il servizio di accesso non è disponibile al momento. Riprova tra poco.",
    connectionTitle: "Connessione non riuscita", connectionError: "Impossibile contattare il servizio di accesso. Controlla la connessione e riprova.",
    confirmTitle: "Conferma l’eliminazione", confirm: "Ho capito che l’account e i backup sul cloud non si possono recuperare.", delete: "Elimina definitivamente il mio account", cancel: "Annulla",
    working: "Operazione in corso…", signInError: "Impossibile accedere. Verifica i dati e che l’account sia confermato, oppure riprova.",
    deleteError: "Non è stato possibile confermare l’eliminazione. Riprova. Se la sessione è scaduta, accedi di nuovo.",
    expired: "La verifica è scaduta. Accedi di nuovo.", done: "Account e dati cloud eliminati. Apri Dwallet su ogni dispositivo connesso per scegliere se conservare una cassaforte locale o eliminare la copia.",
    localCopy: "Dopo l’eliminazione, apri Dwallet su ogni dispositivo e collegalo a Internet. L’app ti chiederà se conservare una cassaforte locale separata o eliminare la copia sul dispositivo.",
  },
};

const copy = Object.fromEntries(Array.from(document.querySelectorAll("[data-copy]"), (node) => [node.dataset.copy, node.textContent]));
Object.assign(copy, {
  working: "Working…",
  signInError: "Could not sign in. Check your details and account confirmation, then try again.",
  deleteError: "Deletion could not be confirmed. Try again. If your session has expired, sign in again.",
  expired: "Your verification expired. Sign in again.",
  done: "Your account and its cloud data were deleted. Open Dwallet on each connected device to choose whether to keep a local vault or delete that device’s copy.",
  accountNotFoundTitle: "Account not found",
  accountNotFound: "This Google account isn’t registered with Dwallet. Choose the Google account you use in the app. Nothing has been deleted.",
  errorTitle: "Something went wrong", workingTitle: "Please wait", doneTitle: "Account deleted",
  credentialsTitle: "Check your sign-in details", invalidCredentials: "Email not registered or incorrect password. If you use Google to sign in to Dwallet, use the Google button below.",
  emailNotFound: "This email isn’t registered with Dwallet. Check the address and use the account you sign in to the app with.",
  confirmEmailTitle: "Confirm your email", emailUnconfirmed: "Open the Dwallet confirmation email, confirm your address, then try again.",
  rateLimitTitle: "Too many attempts", rateLimited: "Wait a few minutes before trying to sign in again.",
  serviceTitle: "Service temporarily unavailable", serviceUnavailable: "The sign-in service is temporarily unavailable. Please try again shortly.",
  connectionTitle: "Could not connect", connectionError: "We couldn’t reach the sign-in service. Check your internet connection and try again.",
});

const noticeTitles = {
  accountNotFound: "accountNotFoundTitle", emailNotFound: "accountNotFoundTitle",
  invalidCredentials: "credentialsTitle", emailUnconfirmed: "confirmEmailTitle",
  rateLimited: "rateLimitTitle", serviceUnavailable: "serviceTitle", connectionError: "connectionTitle",
  working: "workingTitle", done: "doneTitle",
};

let language = "en";
let status = "";
let session = null;
let busy = false;
let googleCredential = null;
let googleAccountId = null;
let googleNonce = null;
const googleAttemptKey = "dwallet.delete.google";
const googleClientId = "123785427219-g9ogg41gufmu21pkfcgpff3emo43k8uj.apps.googleusercontent.com";
const googleRedirectUri = "https://amr1823.github.io/dwallet-account-deletion/";

function localize(chosen) {
  language = Object.hasOwn(translations, chosen) ? chosen : "en";
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  $("language").value = language;
  document.querySelectorAll("[data-copy]").forEach((node) => {
    node.textContent = translate(node.dataset.copy);
  });
  document.title = translate("title");
  announce(status, { attention: false });
}

function translate(key) {
  return translations[language]?.[key] ?? copy[key];
}

function announce(key, { attention = true } = {}) {
  status = key;
  const message = $("message");
  const kind = key === "working" ? "loading" : key === "done" ? "success" : "error";
  message.hidden = !key;
  message.dataset.kind = kind;
  message.setAttribute("role", key && kind === "error" ? "alert" : "status");
  message.setAttribute("aria-live", key && kind === "error" ? "assertive" : "polite");
  $("message-icon").textContent = key ? (kind === "error" ? "!" : kind === "success" ? "✓" : "") : "";
  const titleKey = noticeTitles[key] ?? "errorTitle";
  $("message-title").textContent = key ? translate(titleKey) : "";
  $("message-text").textContent = key ? translate(key) : "";
  if (key && kind === "error" && attention) {
    message.focus({ preventScroll: true });
    message.scrollIntoView({ block: "center", behavior: "auto" });
  }
}

function setBusy(value) {
  busy = value;
  document.querySelectorAll("button").forEach((button) => { button.disabled = value; });
}

async function request(path, options = {}) {
  return fetch(projectUrl + path, {
    method: options.method ?? "POST",
    headers: {
      apikey: publicKey,
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: "Bearer " + options.token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(options.timeout ?? 20000),
  });
}

function showOwner(payload) {
  if (!payload?.access_token || !payload?.user?.email || !payload.user.email_confirmed_at) {
    throw new Error("invalid_session");
  }
  session = payload.access_token;
  $("account-email").textContent = payload.user.email;
  $("sign-in").hidden = true;
  $("confirmation").hidden = false;
}

function clearSession() {
  session = null;
  googleCredential = null;
  googleAccountId = null;
  $("account-email").textContent = "";
  $("confirmation").hidden = true;
  $("confirm").checked = false;
}

class EmailSignInError extends Error {
  constructor(reason) { super(reason); this.reason = reason; }
}

function emailErrorReason(response, payload) {
  if (response.status === 429) return "rateLimited";
  if (response.status >= 500) return "serviceUnavailable";
  const code = typeof payload?.error_code === "string" ? payload.error_code :
    typeof payload?.code === "string" ? payload.code : payload?.error;
  if (code === "over_request_rate_limit") return "rateLimited";
  if (code === "invalid_credentials" ||
      (code === "invalid_grant" && payload?.error_description === "Invalid login credentials")) return "invalidCredentials";
  if (code === "email_not_confirmed") return "emailUnconfirmed";
  if (code === "user_not_found") return "emailNotFound";
  return "signInError";
}

function setSignInFieldErrors(reason) {
  const invalid = reason === "invalidCredentials";
  for (const field of ["email", "password"]) {
    const affected = invalid || (field === "email" && ["emailNotFound", "emailUnconfirmed"].includes(reason));
    $(field).setAttribute("aria-invalid", String(affected));
    $(field).setAttribute("aria-describedby", affected ? "message-title message-text" : "");
  }
}

async function authenticate(path, body) {
  const response = await request(path, { body });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new EmailSignInError(emailErrorReason(response, payload));
  }
  try {
    showOwner(await response.json());
  } catch {
    throw new EmailSignInError("signInError");
  }
  announce("");
}

$("language").addEventListener("change", (event) => localize(event.target.value));
localize("en");
window.addEventListener("pageshow", () => localize(language));
for (const field of ["email", "password"]) {
  $(field).addEventListener("input", () => setSignInFieldErrors(""));
}

$("email-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || session || googleCredential) return;
  const password = $("password").value;
  $("password").value = "";
  setSignInFieldErrors("");
  setBusy(true);
  announce("working");
  try {
    await authenticate("/auth/v1/token?grant_type=password", { email: $("email").value.trim(), password });
  } catch (error) {
    const reason = error instanceof EmailSignInError ? error.reason : "connectionError";
    setSignInFieldErrors(reason);
    announce(reason);
  } finally {
    setBusy(false);
  }
});

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function googleResult(result) {
  if (busy || session || googleCredential || !result.credential) return;
  setBusy(true);
  announce("working");
  try {
    const response = await request("/functions/v1/dwallet-delete-account/google/verify", {
      body: { google_id_token: result.credential, nonce: googleNonce },
    });
    if (response.status === 404) {
      announce("accountNotFound");
      return;
    }
    if (!response.ok) throw new Error("google_verification");
    const account = await response.json();
    if (typeof account.email !== "string" || !account.email ||
        typeof account.account_id !== "string" || !/^[a-f0-9-]{36}$/i.test(account.account_id)) throw new Error("google_account");
    googleCredential = result.credential;
    googleAccountId = account.account_id;
    $("account-email").textContent = account.email;
    $("sign-in").hidden = true;
    $("confirmation").hidden = false;
    announce("");
  } catch {
    announce("signInError");
  } finally {
    setBusy(false);
  }
}

$("google").addEventListener("click", () => {
  if (busy || session || googleCredential) return;
  try {
    if (location.origin + location.pathname !== googleRedirectUri) throw new Error("redirect_origin");
    const attempt = {
      state: base64Url(crypto.getRandomValues(new Uint8Array(32))),
      nonce: base64Url(crypto.getRandomValues(new Uint8Array(32))),
      startedAt: Date.now(), language,
    };
    sessionStorage.setItem(googleAttemptKey, JSON.stringify(attempt));
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: googleClientId, redirect_uri: googleRedirectUri,
      response_type: "id_token", scope: "openid email",
      nonce: attempt.nonce, state: attempt.state, prompt: "select_account",
    });
    location.assign(url.href);
  } catch {
    announce("signInError");
  }
});

async function handleGoogleRedirect() {
  const fragment = new URLSearchParams(location.hash.slice(1));
  if (!fragment.has("id_token") && !fragment.has("error") && !fragment.has("state")) return;
  // Remove the credential from the address before performing any request.
  history.replaceState(null, "", location.pathname + location.search);
  try {
    const stored = sessionStorage.getItem(googleAttemptKey);
    sessionStorage.removeItem(googleAttemptKey);
    const attempt = JSON.parse(stored ?? "null");
    const age = Date.now() - attempt?.startedAt;
    const randomValue = /^[a-zA-Z0-9_-]{43}$/;
    if (!attempt || !randomValue.test(attempt.state ?? "") || !randomValue.test(attempt.nonce ?? "") ||
        !Number.isFinite(age) || age < -30000 || age > 10 * 60000 ||
        fragment.getAll("state").length !== 1 || fragment.get("state") !== attempt.state ||
        location.origin + location.pathname !== googleRedirectUri) {
      announce("expired");
      return;
    }
    localize(attempt.language);
    if (fragment.has("error")) {
      if (fragment.get("error") !== "access_denied") announce("signInError");
      return;
    }
    const credential = fragment.get("id_token");
    if (fragment.getAll("id_token").length !== 1 || !credential || credential.length > 12000) {
      announce("expired");
      return;
    }
    googleNonce = attempt.nonce;
    await googleResult({ credential });
  } catch {
    announce("expired");
  }
}

$("cancel").addEventListener("click", () => {
  clearSession();
  $("sign-in").hidden = false;
  announce("");
});

$("delete-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || (!session && !googleCredential) || !$("confirm").checked) return;
  setBusy(true);
  announce("working");
  try {
    const response = await request("/functions/v1/dwallet-delete-account" + (googleCredential ? "/google/delete" : ""), {
      token: session,
      body: googleCredential ? {
        google_id_token: googleCredential, nonce: googleNonce,
        expected_account_id: googleAccountId, confirm: true,
      } : { confirm: true },
      timeout: 75000,
    });
    if (response.status === 204) {
      clearSession();
      $("email").value = "";
      announce("done");
    } else if (response.status === 404) {
      clearSession();
      $("sign-in").hidden = false;
      announce("accountNotFound");
    } else if (response.status === 401 ||
        (response.status === 409 && (await response.json()).error === "account_changed")) {
      clearSession();
      $("sign-in").hidden = false;
      announce("expired");
    } else {
      announce("deleteError");
    }
  } catch {
    announce("deleteError");
  } finally {
    setBusy(false);
  }
});

window.addEventListener("pagehide", () => {
  if (!session && !googleCredential) return;
  clearSession();
  $("sign-in").hidden = false;
  announce("");
});
void handleGoogleRedirect();

