import React from "react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <strong>{message}</strong>
      {onRetry ? (
        <button className="button button-secondary" type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
