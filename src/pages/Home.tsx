import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { getDisplayName, getInitials, formatMessagePreview, formatMessageTime } from '../utils/formatters';
import type { Room } from '../types';

// Deterministic gradient colors for avatars
const GRADIENT_PALETTE: [string, string][] = [
  ['#2563EB', '#6366F1'],
  ['#059669', '#0D9488'],
  ['#D97706', '#DC2626'],
  ['#7C3AED', '#DB2777'],
  ['#0891B2', '#0D9488'],
  ['#B45309', '#92400E'],
  ['#065F46', '#0F766E'],
];

function getRoomGradient(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PALETTE[Math.abs(hash) % GRADIENT_PALETTE.length];
}

function getRoomDisplayName(room: Room, currentUser: string): string {
  if (room.type === 'group') return room.name;
  if (room.type === 'direct' && room.members) {
    const other = room.members.find(m => m.user_id !== currentUser);
    if (other) return getDisplayName(other.user_id);
  }
  return room.name;
}

const Home = () => {
  const navigate = useNavigate();
  const { rooms, currentUser, setCurrentRoom, setRooms } = useChatStore();

  const { recentRooms, totalUnread, todayMsgs, mostActive, latestRoom } = useMemo(() => {
    const sorted = [...rooms].sort((a, b) => {
      const tA = a.last_message_time || a.created_at;
      const tB = b.last_message_time || b.created_at;
      return tB - tA;
    });
    return {
      sortedRooms: sorted,
      recentRooms: sorted.slice(0, 5),
      totalUnread: rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0),
      todayMsgs: rooms.filter(r => {
        if (!r.last_message_time) return false;
        const d = new Date(r.last_message_time * 1000);
        return d.toDateString() === new Date().toDateString();
      }).length,
      mostActive: sorted.find(r => r.last_message),
      latestRoom: sorted[0],
    };
  }, [rooms]);

  const handleViewRoom = (room: Room) => {
    const updatedRoom = { ...room, unread_count: 0 };
    setCurrentRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === room.id ? updatedRoom : r));
    navigate('/messages');
  };

  const displayName = getDisplayName(currentUser) || currentUser;

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      overflowY: 'auto',
      background: 'var(--color-main-bg)',
      color: 'var(--color-main-text)',
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '28px 28px 48px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>

        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(99,102,241,0.12) 50%, rgba(139,92,246,0.18) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 16,
          padding: '22px 26px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 240,
            height: 240,
            background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
            position: 'relative',
          }}>
            歡迎回來，{' '}
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA, #67E8F9)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {displayName}
            </span>
            ！今天有{' '}
            <span style={{ color: 'var(--color-cyan)', fontWeight: 800 }}>
              {totalUnread}
            </span>
            {' '}則未讀訊息
          </h1>
          <p style={{
            fontSize: 13.5,
            color: 'var(--color-main-text-dim)',
            margin: 0,
            position: 'relative',
          }}>
            共 <strong style={{ color: 'var(--color-main-text)' }}>{rooms.length}</strong> 個對話室，
            繼續與你的聯絡人保持連線
          </p>

          {/* Quick stat pills */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', position: 'relative' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.18)',
              fontSize: 12,
              backdropFilter: 'blur(8px)',
            }}>
              未讀{' '}
              <span style={{ fontWeight: 700, color: 'var(--color-cyan)' }}>{totalUnread}</span>
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.18)',
              fontSize: 12,
              backdropFilter: 'blur(8px)',
            }}>
              今日{' '}
              <span style={{ fontWeight: 700, color: 'var(--color-cyan)' }}>{todayMsgs}</span>
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.18)',
              fontSize: 12,
              backdropFilter: 'blur(8px)',
            }}>
              聊天室{' '}
              <span style={{ fontWeight: 700, color: 'var(--color-cyan)' }}>{rooms.length}</span>
            </span>
          </div>
        </div>

        {/* Hero carousel: 3 stat cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
              對話總覽
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
              style={{
                fontSize: 12,
                color: 'var(--color-main-text-dim)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              查看全部 →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12 }}>
            {/* Card 1: Most active */}
            <div style={{
              borderRadius: 14,
              padding: 18,
              border: '1px solid rgba(148,163,184,0.18)',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'radial-gradient(400px 200px at 100% 0%, rgba(34,211,238,0.2), transparent), linear-gradient(135deg, var(--color-main-bg-2), var(--color-main-bg-2))',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#FCA5A5',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}>
                  最活躍對話
                </span>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: '10px 0 8px 0' }}>
                  {mostActive ? getRoomDisplayName(mostActive, currentUser) : '尚無對話'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-main-text-dim)', lineHeight: 1.5 }}>
                  {mostActive?.last_message
                    ? formatMessagePreview(mostActive.last_message)
                    : '還沒有訊息'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-main-text-dim)', flexWrap: 'wrap' }}>
                {mostActive && (
                  <>
                    <span>類型 <strong style={{ color: 'var(--color-main-text)' }}>
                      {mostActive.type === 'group' ? '群組' : '私訊'}
                    </strong></span>
                    {mostActive.unread_count ? (
                      <span>未讀 <strong style={{ color: 'var(--color-cyan)' }}>{mostActive.unread_count}</strong></span>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {/* Card 2: Latest message */}
            <div style={{
              borderRadius: 14,
              padding: 18,
              border: '1px solid rgba(148,163,184,0.18)',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'radial-gradient(300px 200px at 100% 100%, rgba(139,92,246,0.18), transparent), linear-gradient(135deg, var(--color-main-bg-2), var(--color-main-bg-2))',
            }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.4)',
                  color: '#FCD34D',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}>
                  最新訊息
                </span>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: '10px 0 8px 0' }}>
                  {latestRoom ? getRoomDisplayName(latestRoom, currentUser) : '尚無對話'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-main-text-dim)' }}>
                {latestRoom?.last_message_time && (
                  <span>{formatMessageTime(latestRoom.last_message_time)}</span>
                )}
              </div>
            </div>

            {/* Card 3: Today activity */}
            <div style={{
              borderRadius: 14,
              padding: 18,
              border: '1px solid rgba(148,163,184,0.18)',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'radial-gradient(300px 200px at 0% 0%, rgba(245,158,11,0.15), transparent), linear-gradient(135deg, var(--color-main-bg-2), var(--color-main-bg-2))',
            }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(34,211,238,0.15)',
                  border: '1px solid rgba(34,211,238,0.4)',
                  color: '#67E8F9',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}>
                  今日活動
                </span>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: '10px 0 8px 0' }}>
                  {todayMsgs} 個對話有新消息
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-main-text-dim)' }}>
                <span>總計 <strong style={{ color: 'var(--color-main-text)' }}>{rooms.length}</strong> 個聊天室</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent chats section */}
        {recentRooms.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
                最近對話
              </div>
              <button
                onClick={() => navigate('/messages')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
                style={{
                  fontSize: 12,
                  color: 'var(--color-main-text-dim)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                查看全部
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentRooms.map(room => {
                const name = getRoomDisplayName(room, currentUser);
                const [gradFrom, gradTo] = getRoomGradient(room.id);
                const initials = getInitials(name);
                return (
                  <button
                    key={room.id}
                    onClick={() => handleViewRoom(room)}
                    aria-label={`開啟與 ${name} 的對話`}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded-[12px]"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'var(--color-main-bg-2)',
                      border: '1px solid var(--color-main-border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                      transition: 'border-color 150ms',
                      width: '100%',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.4)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-main-border)';
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--color-main-text)',
                        marginBottom: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {name}
                        {room.type === 'group' && (
                          <span style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: 'rgba(99,102,241,0.15)',
                            color: '#A78BFA',
                            border: '1px solid rgba(99,102,241,0.3)',
                            fontWeight: 500,
                          }}>
                            群組
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: 'var(--color-main-text-dim)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {formatMessagePreview(room.last_message) || '開始對話...'}
                      </div>
                    </div>

                    {/* Right side: time + unread */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 4,
                      flexShrink: 0,
                    }}>
                      {room.last_message_time && (
                        <span style={{ fontSize: 11, color: 'var(--color-main-text-dim)' }}>
                          {formatMessageTime(room.last_message_time)}
                        </span>
                      )}
                      {(room.unread_count || 0) > 0 && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#fff',
                          background: 'var(--color-accent)',
                          padding: '1px 7px',
                          borderRadius: 999,
                          minWidth: 20,
                          textAlign: 'center',
                        }}>
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 12 }}>
            快速操作
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => navigate('/messages')}
              aria-label="新增對話"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-[12px]"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(99,102,241,0.1))',
                border: '1px solid rgba(99,102,241,0.3)',
                cursor: 'pointer',
                color: 'inherit',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-indigo))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#fff',
                flexShrink: 0,
              }}>
                +
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-main-text)', marginBottom: 3 }}>
                  新增對話
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-main-text-dim)' }}>
                  開始新的聊天
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/contacts')}
              aria-label="聯絡人"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-[12px]"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 12,
                background: 'var(--color-main-bg-2)',
                border: '1px solid var(--color-main-border)',
                cursor: 'pointer',
                color: 'inherit',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #059669, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#fff',
                flexShrink: 0,
              }}>
                @
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-main-text)', marginBottom: 3 }}>
                  聯絡人
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-main-text-dim)' }}>
                  查看和管理聯絡人
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
