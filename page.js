import { projectUrl, publicKey } from "./config.js";

const $ = (id) => document.getElementById(id);
const translations = {
  ar: {
    title: "حذف حساب Dwallet", description: "حذف الحساب يمسح حساب Dwallet ونسخه السحابية ونشاطه المرتبط به نهائيًا. العناصر المحفوظة محليًا تُدار من الجهاز المحفوظة عليه.",
    ownership: "تحقّق من حسابك", email: "البريد الإلكتروني", password: "كلمة سر Dwallet", continue: "متابعة",
    recovery: "اختار حساب Google المرتبط بـDwallet، أو ادخل ببريد Dwallet وكلمة السر.",
    googleRetry: "إعادة تحميل تسجيل Google", googleUnavailable: "تعذّر تحميل Google. اضغط إعادة التحميل أو استخدم البريد وكلمة السر.",
    accountNotFound: "مفيش حساب Dwallet مرتبط بحساب Google ده. ما اتحذفش أي حساب.",
    confirmTitle: "تأكيد حذف الحساب", confirm: "أفهم إن الحساب والنسخ السحابية لا يمكن استرجاعهم.", delete: "حذف حسابي نهائيًا", cancel: "إلغاء",
    working: "جارٍ التنفيذ…", signInError: "تعذر تسجيل الدخول. راجع البيانات وتأكد إن الحساب مفعّل، أو جرّب تسجيل الدخول من جديد.",
    deleteError: "لم يتأكد اكتمال حذف الحساب. جرّب مرة تانية. لو انتهت الجلسة، سجّل دخول من جديد.",
    expired: "انتهت جلسة التحقق. سجّل الدخول من جديد.", done: "تم حذف حسابك وبياناته السحابية.",
  },
  it: {
    title: "Elimina il tuo account Dwallet", description: "L’eliminazione rimuove definitivamente l’account Dwallet, i backup sul cloud e le attività collegate. Gli elementi salvati sul dispositivo si gestiscono da quel dispositivo.",
    ownership: "Verifica il tuo account", email: "Indirizzo email", password: "Password di Dwallet", continue: "Continua",
    recovery: "Scegli l’account Google collegato a Dwallet o accedi con email e password di Dwallet.",
    googleRetry: "Ricarica l’accesso Google", googleUnavailable: "Impossibile caricare Google. Riprova o usa email e password.",
    accountNotFound: "Nessun account Dwallet è collegato a questo account Google. Nessun account è stato eliminato.",
    confirmTitle: "Conferma l’eliminazione", confirm: "Ho capito che l’account e i backup sul cloud non si possono recuperare.", delete: "Elimina definitivamente il mio account", cancel: "Annulla",
    working: "Operazione in corso…", signInError: "Impossibile accedere. Verifica i dati e che l’account sia confermato, oppure riprova.",
    deleteError: "Non è stato possibile confermare l’eliminazione. Riprova. Se la sessione è scaduta, accedi di nuovo.",
    expired: "La verifica è scaduta. Accedi di nuovo.", done: "Il tuo account e i suoi dati sul cloud sono stati eliminati.",
  },
};

const copy = Object.fromEntries(Array.from(document.querySelectorAll("[data-copy]"), (node) => [node.dataset.copy, node.textContent]));
Object.assign(copy, {
  working: "Working…",
  signInError: "Could not sign in. Check your details and account confirmation, then try again.",
  deleteError: "Deletion could not be confirmed. Try again. If your session has expired, sign in again.",
  expired: "Your verification expired. Sign in again.",
  done: "Your account and its cloud data were deleted.",
  googleRetry: "Reload Google sign-in",
  googleUnavailable: "Could not load Google sign-in. Retry or use your email and password.",
  accountNotFound: "No Dwallet account is linked to this Google account. No account was deleted.",
});

let language = "en";
let status = "";
let session = null;
let busy = false;
let googleCredential = null;
let googleAccountId = null;
let googleNonce = null;
let googleInitialized = false;

function localize(chosen) {
  language = Object.hasOwn(translations, chosen) ? chosen : "en";
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  $("language").value = language;
  document.querySelectorAll("[data-copy]").forEach((node) => {
    node.textContent = translate(node.dataset.copy);
  });
  document.title = translate("title");
  announce(status);
}

function translate(key) {
  return translations[language]?.[key] ?? copy[key];
}

function announce(key) {
  status = key;
  $("message").textContent = key ? translate(key) : "";
}

function setBusy(value) {
  busy = value;
  document.querySelectorAll("button").forEach((button) => { button.disabled = value; });
  $("google-sign-in").inert = value;
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
  window.google?.accounts.id.disableAutoSelect();
}

async function authenticate(path, body) {
  const response = await request(path, { body });
  if (!response.ok) throw new Error("sign_in");
  showOwner(await response.json());
  announce("");
}

$("language").addEventListener("change", (event) => localize(event.target.value));
localize(navigator.language.split("-")[0]);

$("email-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || session || googleCredential) return;
  const password = $("password").value;
  $("password").value = "";
  setBusy(true);
  announce("working");
  try {
    await authenticate("/auth/v1/token?grant_type=password", { email: $("email").value.trim(), password });
  } catch {
    announce("signInError");
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

function renderGoogle() {
  googleNonce = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  window.google.accounts.id.initialize({
    client_id: "123785427219-g9ogg41gufmu21pkfcgpff3emo43k8uj.apps.googleusercontent.com",
    callback: googleResult, nonce: googleNonce, auto_select: false,
  });
  window.google.accounts.id.renderButton($("google-sign-in"), {
    type: "standard", theme: "filled_black", size: "large", text: "continue_with",
    shape: "rectangular", width: 320,
  });
  googleInitialized = true;
  $("google-retry").hidden = true;
}

function loadGoogle() {
  if (googleInitialized) return;
  $("google-retry").hidden = true;
  const previous = document.getElementById("google-library");
  previous?.remove();
  const script = document.createElement("script");
  script.id = "google-library";
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = () => { try { renderGoogle(); } catch { unavailable(); } };
  script.onerror = unavailable;
  function unavailable() {
    $("google-retry").hidden = false;
    announce("googleUnavailable");
  }
  document.head.appendChild(script);
}
$("google-retry").addEventListener("click", loadGoogle);

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
loadGoogle();

