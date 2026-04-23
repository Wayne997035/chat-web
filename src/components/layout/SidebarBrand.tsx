import { Icon } from '../ui/Icon';

interface SidebarBrandProps {
  onOpenCreate: () => void;
}

const SidebarBrand = ({ onOpenCreate }: SidebarBrandProps) => (
  <div style={{
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid var(--color-sb-border)',
    flexShrink: 0,
  }}>
    <Icon.Owl size={30} />
    <div>
      <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em', color: 'var(--color-sb-text)' }}>
        ChatOwl
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-sb-text-dim)', marginTop: 1 }}>
        加密即時通訊
      </div>
    </div>
    <button
      aria-label="新增對話"
      onClick={onOpenCreate}
      style={{
        marginLeft: 'auto',
        width: 30,
        height: 30,
        borderRadius: 8,
        background: 'var(--color-accent)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 150ms ease-out',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <Icon.Plus size={16} />
    </button>
  </div>
);

export default SidebarBrand;
