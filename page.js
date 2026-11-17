import { projectUrl, publicKey } from "./config.js";

const $ = (id) => document.getElementById(id);
const translations = {
  ar: {
    title: "حذف حساب Dwallet", description: "حذف الحساب يمسح حساب Dwallet ونسخه السحابية ونشاطه المرتبط به نهائيًا. العناصر المحفوظة محليًا تُدار من الجهاز المحفوظة عليه.",
    ownership: "تحقّق من حسابك", email: "البريد الإلكتروني", password: "كلمة سر Dwallet", continue: "متابعة",
    google: "المتابعة باستخدام Google", recovery: "لو بتسجّل دخول Dwallet من Google، اختار نفس حساب Google هنا.",
    confirmTitle: "تأكيد حذف الحساب", confirm: "أفهم إن الحساب والنسخ السحابية لا يمكن استرجاعهم.", delete: "حذف حسابي نهائيًا", cancel: "إلغاء",
    working: "جارٍ التنفيذ…", signInError: "تعذر تسجيل الدخول. راجع البيانات وتأكد إن الحساب مفعّل، أو جرّب تسجيل الدخول من جديد.",
    deleteError: "لم يتأكد اكتمال حذف الحساب. جرّب مرة تانية. لو انتهت الجلسة، سجّل دخول من جديد.",
    expired: "انتهت جلسة التحقق. سجّل الدخول من جديد.", done: "تم حذف حسابك وبياناته السحابية.",
  },
  it: {
    title: "Elimina il tuo account Dwallet", description: "L’eliminazione rimuove definitivamente l’account Dwallet, i backup sul cloud e le attività collegate. Gli elementi salvati sul dispositivo si gestiscono da quel dispositivo.",
    ownership: "Verifica il tuo account", email: "Indirizzo email", password: "Password di Dwallet", continue: "Continua",
    google: "Continua con Google", recovery: "Se accedi a Dwallet con Google, scegli lo stesso account Google.",
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
});

const oauthKey = "dwallet.delete.oauth";
let language = "en";
let status = "";
let session = null;
let busy = false;

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
  $("account-email").textContent = "";
  $("confirmation").hidden = true;
  $("confirm").checked = false;
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
  if (busy || session) return;
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

$("google").addEventListener("click", async () => {
  if (busy || session) return;
  setBusy(true);
  announce("working");
  try {
    const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
    sessionStorage.setItem(oauthKey, JSON.stringify({ verifier, startedAt: Date.now(), language }));
    const url = new URL("/auth/v1/authorize", projectUrl);
    url.search = new URLSearchParams({
      provider: "google",
      redirect_to: location.origin + location.pathname,
      code_challenge: challenge,
      code_challenge_method: "s256",
      prompt: "select_account",
    });
    location.assign(url);
  } catch {
    announce("signInError");
    setBusy(false);
  }
});

$("cancel").addEventListener("click", () => {
  clearSession();
  $("sign-in").hidden = false;
  announce("");
});

$("delete-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !session || !$("confirm").checked) return;
  setBusy(true);
  announce("working");
  try {
    const response = await request("/functions/v1/dwallet-delete-account", {
      token: session, body: { confirm: true }, timeout: 75000,
    });
    if (response.status === 204) {
      clearSession();
      $("email").value = "";
      announce("done");
    } else if (response.status === 401) {
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

async function handleRedirect() {
  const query = new URLSearchParams(location.search);
  if (!query.has("code") && !query.has("error") && !location.hash) return;
  history.replaceState(null, "", location.pathname);
  setBusy(true);
  try {
    const attempt = JSON.parse(sessionStorage.getItem(oauthKey) ?? "null");
    sessionStorage.removeItem(oauthKey);
    if (attempt?.language) localize(attempt.language);
    const code = query.get("code");
    if (!code || !attempt?.verifier || Date.now() - attempt.startedAt > 15 * 60000) {
      announce("expired");
      return;
    }
    await authenticate("/auth/v1/token?grant_type=pkce", { auth_code: code, code_verifier: attempt.verifier });
  } catch {
    announce("signInError");
  } finally {
    setBusy(false);
  }
}

window.addEventListener("pagehide", () => {
  if (!session) return;
  clearSession();
  $("sign-in").hidden = false;
  announce("");
});
handleRedirect();

