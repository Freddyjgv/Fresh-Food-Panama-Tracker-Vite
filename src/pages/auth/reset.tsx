import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, AlertTriangle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

type ViewState = "checking" | "ready" | "done" | "error";

function isStrongEnough(pw: string) {
  if (!pw) return false;
  const okLen = pw.length >= 8;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  return okLen && hasLetter && hasNumber;
}

function parseHashParams() {
  const h = typeof window !== "undefined" ? window.location.hash : "";
  if (!h || !h.startsWith("#")) return new URLSearchParams();
  return new URLSearchParams(h.slice(1));
}

export default function ResetPasswordPage() {
  // Cambio: Usamos useNavigate de react-router-dom
  const navigate = useNavigate();

  const [view, setView] = useState<ViewState>("checking");
  const [msg, setMsg] = useState<string | null>(null);

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    if (!pw1 || !pw2) return false;
    if (pw1 !== pw2) return false;
    if (!isStrongEnough(pw1)) return false;
    return true;
  }, [pw1, pw2]);

  useEffect(() => {
    let alive = true;

    function toError(message: string) {
      if (!alive) return;
      setView("error");
      setMsg(message);
    }

    async function ensureRecoverySession() {
      try {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
          if (!alive) return;
          if (event === "PASSWORD_RECOVERY") {
            setView("ready");
          }
        });

        const hp = parseHashParams();
        const access_token = hp.get("access_token");
        const refresh_token = hp.get("refresh_token");
        const type = (hp.get("type") || "").toLowerCase();

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            sub.subscription.unsubscribe();
            toError("El enlace de restablecimiento no es válido o ya expiró.");
            return;
          }

          if (typeof window !== "undefined" && window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        }

        const started = Date.now();
        const maxWaitMs = 1800;

        while (alive && Date.now() - started < maxWaitMs) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.access_token) {
            if (!alive) break;
            setView("ready");
            sub.subscription.unsubscribe();
            return;
          }
          await new Promise((r) => setTimeout(r, 200));
        }

        sub.subscription.unsubscribe();
        if (type === "recovery" || type === "invite") {
            setView("ready"); // Forzamos vista lista si detectamos el tipo correcto
        } else {
            toError("No detectamos un enlace de recuperación válido.");
        }
      } catch {
        toError("No pudimos procesar el restablecimiento.");
      }
    }

    ensureRecoverySession();
    return () => { alive = false; };
  }, []);

  async function onSave() {
    if (!canSave || saving) return;
    setSaving(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) {
        setMsg(error.message || "No se pudo actualizar la contraseña.");
        setSaving(false);
        return;
      }

      setView("done");
      setSaving(false);
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login"); // Cambio: navigation de react-router-dom
      }, 2000);
    } catch {
      setMsg("Ocurrió un error inesperado.");
      setSaving(false);
    }
  }

  return (
    <div className="wrap">
      <div className="card">
        <div className="head">
          <div className="brand">
             {/* Cambio: img estándar */}
            <img src="/brand/freshfood-logo.svg" alt="Fresh Food Panamá" className="logo" />
          </div>
          <div className="title">Restablecer contraseña</div>
          <div className="sub">Define una nueva clave para tu cuenta.</div>
        </div>

        <div className="ff-divider" style={{ margin: "12px 0", borderBottom: '1px solid #eee' }} />

        {view === "checking" ? (
          <div className="state">
            <div className="spinner" />
            <div>
              <div className="stateTitle">Validando enlace…</div>
              <div className="stateSub">Esto toma un instante.</div>
            </div>
          </div>
        ) : view === "error" ? (
          <div className="msgWarn">
            <div className="msgRow"><AlertTriangle size={16} /><b>Error</b></div>
            <div className="msgBody">{msg ?? "Enlace no válido."}</div>
            <div style={{ height: 10 }} />
            <div className="actions">
              <Link to="/login" className="btnSecondary"><ArrowLeft size={16} /> Volver a login</Link>
            </div>
          </div>
        ) : view === "done" ? (
          <div className="msgOk">
            <div className="msgRow"><CheckCircle2 size={16} /><b>Contraseña actualizada</b></div>
            <div className="msgBody">Listo. Te llevaremos al login en unos segundos.</div>
            <div style={{ height: 10 }} />
            <div className="actions">
              <Link to="/login" className="btnPrimary">Ir al login</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid">
              <label className="field">
                <span className="lbl">Nueva contraseña</span>
                <div className="inputWrap">
                  <Lock size={16} />
                  <input
                    type={show1 ? "text" : "password"}
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button type="button" className="eye" onClick={() => setShow1(!show1)}>
                    {show1 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="field">
                <span className="lbl">Confirmar contraseña</span>
                <div className="inputWrap">
                  <Lock size={16} />
                  <input
                    type={show2 ? "text" : "password"}
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Repite la contraseña"
                  />
                  <button type="button" className="eye" onClick={() => setShow2(!show2)}>
                    {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

            <div className="help">
              <span className={`dot ${isStrongEnough(pw1) ? "ok" : ""}`} />
              <span>8+ caracteres, 1 letra y 1 número.</span>
              {pw1 && pw2 && pw1 !== pw2 && <span className="bad">No coinciden.</span>}
            </div>

            <div className="actions" style={{ marginTop: 20 }}>
              <Link to="/login" className="btnSecondary">Cancelar</Link>
              <button className="btnPrimary" onClick={onSave} disabled={!canSave || saving}>
                {saving ? "Guardando…" : "Guardar contraseña"}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px 14px; background: #f6f8fb; font-family: sans-serif; }
        .card { width: 100%; max-width: 450px; background: #fff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .head { text-align: center; margin-bottom: 20px; }
        .logo { height: 40px; margin-bottom: 12px; }
        .title { font-size: 18px; font-weight: 800; color: #0f172a; }
        .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
        .grid { display: grid; gap: 16px; margin-top: 20px; }
        .field { display: grid; gap: 8px; }
        .lbl { font-size: 12px; font-weight: 700; color: #475569; }
        .inputWrap { display: flex; align-items: center; gap: 10px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; }
        .inputWrap input { flex: 1; border: none; outline: none; font-size: 14px; }
        .eye { border: none; background: none; color: #94a3b8; cursor: pointer; }
        .help { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 12px; color: #64748b; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; }
        .dot.ok { background: #10b981; }
        .bad { color: #ef4444; font-weight: 700; margin-left: auto; }
        .actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .btnPrimary { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btnPrimary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btnSecondary { text-decoration: none; color: #64748b; font-size: 12px; font-weight: 700; }
        .spinner { width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .msgWarn { background: #fff1f2; border: 1px solid #fecaca; padding: 12px; border-radius: 10px; color: #991b1b; }
        .msgOk { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; color: #166534; }
      `}</style>
    </div>
  );
}