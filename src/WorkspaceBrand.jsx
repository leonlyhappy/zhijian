import "./workspace-brand.css";

export function WorkspaceBrand({ assistant, onHome }) {
  return <div className="workspace-brand-controls">
    {assistant ? <button id="xiaozhi-toggle" type="button" className={`workspace-assistant-button${assistant.expanded ? " active" : ""}`} aria-label={assistant.expanded ? "收起小智" : "展开小智"} aria-expanded={assistant.expanded} aria-controls={assistant.expanded ? "xiaozhi-panel" : undefined} onClick={assistant.onToggle}>
      <img src="/assistant/xiaozhi-female.png" alt="" width="24" height="24" />
      <span>问小智</span>
    </button> : null}
    <button type="button" className="education-brand-button" aria-label="360智见教育版，返回首页" onClick={onHome}>
      <span className="education-brand-artwork" aria-hidden="true"><img src="/brand/zhijian-education-book.png" alt="" width="2172" height="724" /></span>
    </button>
  </div>;
}
