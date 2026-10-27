import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Camera, CaretRight, Check, LockKey, SignOut, UserCircle, Wallet, X } from "@phosphor-icons/react";
import "./account-menu.css";

const DEFAULT_AVATAR = "/account/default-portrait.png";
const PROFILE_KEY = "zhijian.account-display.v1";
function readDisplayProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
    return { name: typeof saved?.name === "string" ? saved.name : undefined, avatar: typeof saved?.avatar === "string" ? saved.avatar : undefined };
  } catch { return {}; }
}

export function AccountMenu({ account, onSignOut, onChangePassword, onOpenWallet }) {
  const [profile, setProfile] = useState(readDisplayProfile);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const trigger = useRef(null);
  const popup = useRef(null);
  const dialog = useRef(null);
  const fileInput = useRef(null);
  const menuId = useId();
  const titleId = useId();
  const name = account?.name || profile.name || "个人账户";
  const avatar = profile.avatar || account?.avatar || DEFAULT_AVATAR;
  const close = () => { setOpen(false); setPanel(null); setError(""); trigger.current?.focus(); };
  const showPanel = (next) => { setOpen(false); setError(""); setDraft({ name, avatar }); setPanel(next); };

  useEffect(() => {
    if (!open && !panel) return;
    const root = panel ? dialog.current : popup.current;
    root?.querySelector("input, button")?.focus();
    const outside = (event) => {
      if (open && !popup.current?.contains(event.target) && !trigger.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const keys = (event) => {
      if (event.key === "Escape") { event.preventDefault(); if (!busy) close(); return; }
      if (panel && event.key === "Tab") {
        const controls = [...root.querySelectorAll('button:not(:disabled), input:not([type="file"])')];
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keys);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", keys); };
  }, [open, panel, busy]);

  async function changeAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError("请选择不超过 2MB 的 JPG、PNG 或 WebP 图片。"); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => { setDraft((current) => ({ ...current, avatar: reader.result })); setError(""); };
      image.onerror = () => setError("图片无法打开，请选择有效的图片文件。");
      image.src = reader.result;
    };
    reader.onerror = () => setError("图片读取失败，请重新选择。");
    reader.readAsDataURL(file);
  }
  function saveProfile(event) {
    event.preventDefault();
    const next = { name: draft.name.trim(), avatar: draft.avatar };
    if (!next.name) { setError("请输入显示名称。"); return; }
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setProfile(next); close(); }
    catch { setError("当前浏览器无法保存，请尝试使用更小的头像图片。"); }
  }
  async function signOut() {
    setBusy(true);
    try { await onSignOut(); close(); }
    catch { setError("退出未完成，请稍后重试。"); }
    finally { setBusy(false); }
  }

  return <>
    <button ref={trigger} type="button" className={`account-avatar-trigger${open ? " is-open" : ""}`} aria-label="用户账户" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => { if (open) close(); else setOpen(true); }}>
      <img src={avatar} alt="" width="36" height="36" />
    </button>
    {open ? createPortal(<section ref={popup} id={menuId} className="account-popover" role="dialog" aria-label="账户菜单">
      <button type="button" className="account-identity" onClick={() => showPanel("profile")}>
        <img src={avatar} alt="" width="44" height="44" /><span><strong>{name}</strong><small>{account?.email || "欢迎使用智见"}</small></span><CaretRight size={16} />
      </button>
      <div className="account-membership"><div><span>当前版本</span><strong>{account?.plan || "教育版"}</strong></div><div><span>到期时间</span><b>{account?.expiresAt || "待获取"}</b></div></div>
      <div className="account-menu-actions">
        <button type="button" onClick={() => onOpenWallet ? (close(), onOpenWallet()) : showPanel("wallet")}><Wallet size={20} /><span><span>钱包余额</span><strong>{account?.balance ?? "—"}<small>智豆</small></strong></span><CaretRight size={15} /></button>
        <button type="button" onClick={() => showPanel("profile")}><UserCircle size={20} /><span>账号设置</span><CaretRight size={15} /></button>
        <button type="button" onClick={() => onChangePassword ? (close(), onChangePassword()) : showPanel("password")}><LockKey size={20} /><span>修改密码</span><CaretRight size={15} /></button>
      </div>
      <div className="account-menu-footer"><button type="button" onClick={() => showPanel("logout")}><SignOut size={20} /><span>退出登录</span><ArrowRight size={15} /></button></div>
    </section>, document.body) : null}
    {panel ? createPortal(<div className="account-dialog-backdrop" onClick={(event) => { if (event.target === event.currentTarget && !busy) close(); }}>
      <section ref={dialog} className="account-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header><button type="button" className="account-close" aria-label="返回账户菜单" disabled={busy} onClick={() => { setPanel(null); setError(""); setOpen(true); }}><ArrowLeft size={18} /></button><div className="account-dialog-title"><small>360 智见 · 教育版</small><h2 id={titleId}>{{ profile: "账号设置", wallet: "我的钱包", password: "修改密码", logout: "退出登录" }[panel]}</h2></div><button type="button" className="account-close" aria-label="关闭账户窗口" onClick={close} disabled={busy}><X size={19} /></button></header>
        {panel === "profile" ? <form onSubmit={saveProfile}>
          <div className="account-avatar-editor"><button type="button" className="account-upload" aria-label="更换头像" onClick={() => fileInput.current?.click()}><img src={draft.avatar} alt="当前头像" /><span><Camera size={16} /></span></button><div><strong>换一张喜欢的头像</strong><p>JPG、PNG 或 WebP，最大 2MB</p></div><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={changeAvatar} hidden /></div>
          <label className="account-name-field">显示名称<input value={draft.name || ""} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} maxLength={30} required /></label>
          <p className="account-local-note">头像与显示名称保存在当前浏览器。</p>
          {error ? <p className="account-error" role="alert">{error}</p> : null}
          <footer><button type="button" onClick={close}>取消</button><button type="submit" className="account-primary"><Check size={16} />保存设置</button></footer>
        </form> : <>
          <div className="account-empty-state">{panel === "wallet" ? <Wallet size={30} /> : panel === "password" ? <LockKey size={30} /> : <SignOut size={30} />}
            <h3>{panel === "wallet" ? "余额暂不可用" : panel === "password" ? "请通过账号管理员修改" : onSignOut ? "确定退出当前账号？" : "当前无需退出"}</h3>
            <p>{panel === "wallet" ? "连接登录账号后，可在这里查看智豆余额与消费记录。" : panel === "password" ? "当前页面暂不支持修改登录密码，请联系账号管理员。" : onSignOut ? "退出后，需要重新登录才能继续使用。" : "当前为界面预览，尚未建立登录会话。"}</p>
          </div>
          {error ? <p className="account-error" role="alert">{error}</p> : null}
          <footer>{panel === "logout" && onSignOut ? <><button type="button" onClick={close} disabled={busy}>取消</button><button type="button" className="account-primary" onClick={signOut} disabled={busy}>{busy ? "正在退出…" : "确定退出"}</button></> : <button type="button" className="account-primary" onClick={close}>我知道了</button>}</footer>
        </>}
      </section>
    </div>, document.body) : null}
  </>;
}
