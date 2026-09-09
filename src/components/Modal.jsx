export default function Modal({ titulo, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-border rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-cream">{titulo}</h2>
          <button onClick={onClose} className="text-muted hover:text-cream text-xl leading-none">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
