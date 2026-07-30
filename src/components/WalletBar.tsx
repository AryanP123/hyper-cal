type Props = {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function WalletBar({ value, loading, onChange, onSubmit }: Props) {
  return (
    <form
      className="wallet-bar"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label className="wallet-label" htmlFor="wallet">
        Wallet
      </label>
      <input
        id="wallet"
        className="wallet-input"
        type="text"
        inputMode="text"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="0x…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      />
      <button className="wallet-btn" type="submit" disabled={loading || !value.trim()}>
        {loading ? 'Loading…' : 'Load'}
      </button>
    </form>
  )
}
