import React from "react";

export default function EmptyState({ title, message }) {
  return (
    <div className="state state-empty">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
