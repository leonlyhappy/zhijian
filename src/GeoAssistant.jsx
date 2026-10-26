import { useEffect, useRef } from "react";
import { ArrowUp, CaretLeft, ArrowUpRight } from "@phosphor-icons/react";
import "./geo-assistant.css";

const AVATAR = "/assistant/xiaozhi-female.png";

export function GeoAssistant({ context, messages, input, typing, collapsed, onToggleCollapsed, onInputChange, onSend }) {
  const messageAreaRef = useRef(null);
  useEffect(() => {
    if (collapsed) return;
    const area = messageAreaRef.current;
    if (area) area.scrollTo({ top: area.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [messages, typing, collapsed]);

  const close = () => {
    onToggleCollapsed();
    document.getElementById("xiaozhi-toggle")?.focus();
  };
  if (collapsed) return null;
  const conversation = messages.filter((message) => message.kind !== "context");

  return <aside id="xiaozhi-panel" className="xiaozhi-panel" aria-label="GEO全局对话助手小智" onKeyDown={(event) => { if (event.key === "Escape") close(); }}>
    <header className="xiaozhi-profile">
      <img className="xiaozhi-portrait" src={AVATAR} alt="小智，GEO 工作助手" width="44" height="44" />
      <div><h2>小智</h2><p>你的 GEO 工作助手</p></div>
      <button type="button" className="xiaozhi-close" onClick={close} aria-label="收起对话面板" title="收起对话面板"><CaretLeft size={17} /></button>
    </header>
    <div className="xiaozhi-context"><span>当前页面</span><strong>{context.label}</strong></div>
    <div className="xiaozhi-conversation" ref={messageAreaRef} role="log" aria-label="与小智的对话" aria-live="polite" aria-relevant="additions text">
      {!conversation.length ? <div className="xiaozhi-welcome"><h3>有什么我可以帮你？</h3><p>围绕当前页面，<br />帮你理清进度与下一步。</p></div> : <div className="xiaozhi-conversation-label">本次对话</div>}
      {conversation.map((message) => <div className={`xiaozhi-message ${message.role}`} key={message.id}>
        {message.role === "assistant" ? <img src={AVATAR} width="24" height="24" alt="小智" /> : null}
        <div className="xiaozhi-bubble">{message.text}</div>
      </div>)}
      {typing ? <div className="xiaozhi-message assistant"><img src={AVATAR} width="24" height="24" alt="" /><div className="xiaozhi-bubble xiaozhi-typing" role="status" aria-label="小智正在回复"><i /><i /><i /></div></div> : null}
    </div>
    <div className="xiaozhi-composer">
      <div className="xiaozhi-suggestions" aria-label="建议问题">{context.chips.slice(0, 2).map((chip) => <button type="button" key={chip} onClick={() => onSend(chip)}><span>{chip}</span><ArrowUpRight size={13} /></button>)}</div>
      <form className="xiaozhi-input" onSubmit={(event) => { event.preventDefault(); onSend(input); }}>
        <textarea aria-label="向小智提问" value={input} onChange={(event) => onInputChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); onSend(input); } }} rows={2} placeholder="问问小智…" />
        <div><span>Enter 发送</span><button type="submit" disabled={!input.trim()} aria-label="发送消息"><ArrowUp size={17} weight="bold" /></button></div>
      </form>
      <p className="xiaozhi-input-hint">Shift + Enter 换行</p>
    </div>
  </aside>;
}
