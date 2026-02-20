import { useEffect } from 'react';
import { useGameState, handlePermissionChoice } from '@engine/gameStore';

export function PermissionPrompt() {
  const { pendingPermission, dialogueComplete } = useGameState();

  const visible = pendingPermission && dialogueComplete && !pendingPermission.requesting;

  // Auto-grant: when a previously-granted permission comes back, skip ALLOW/DENY
  useEffect(() => {
    if (
      pendingPermission?.autoGrant &&
      dialogueComplete &&
      !pendingPermission.requesting
    ) {
      handlePermissionChoice(true);
    }
  }, [pendingPermission?.autoGrant, pendingPermission?.requesting, dialogueComplete]);

  // Keyboard: Y/Enter to allow, N/Escape to deny
  useEffect(() => {
    if (!visible || pendingPermission?.autoGrant) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') handlePermissionChoice(true);
      if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') handlePermissionChoice(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, pendingPermission?.autoGrant]);

  if (!pendingPermission || !dialogueComplete) return null;

  // Auto-grant: don't show buttons, go straight to requesting state
  if (pendingPermission.autoGrant) {
    return (
      <div className="permission-prompt">
        <span className="permission-waiting">ACTIVATING...</span>
      </div>
    );
  }

  if (pendingPermission.requesting) {
    return (
      <div className="permission-prompt">
        <span className="permission-waiting">WAITING FOR YOUR BROWSER...</span>
      </div>
    );
  }

  return (
    <div className="permission-prompt">
      <button
        className="permission-btn allow"
        onClick={() => handlePermissionChoice(true)}
      >
        [ ALLOW ]
      </button>
      <button
        className="permission-btn deny"
        onClick={() => handlePermissionChoice(false)}
      >
        [ DENY ]
      </button>
    </div>
  );
}
