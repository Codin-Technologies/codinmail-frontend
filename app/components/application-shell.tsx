'use client';

import type { UIThread, UIEmail } from '@/lib/features/mail/hooks/use-threads-adapter';
import {
  Archive,
  ArrowDownUp,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Hash,
  Inbox,
  LayoutGrid,
  ListFilter,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Plus,
  Reply,
  ReplyAll,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Forward,
  Clock3,
  EyeOff,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { CalendarWorkspace } from './calendar/calendar-workspace';
import { FilesWorkspace } from './files/files-workspace';
import { MeetWorkspace } from './meet/meet-workspace';
import { TaskWorkspace } from './tasks/task-workspace';
import { SaveToFilesDialog } from './files/modals/save-to-files-dialog';
import { loadFilesStore } from '@/lib/files/storage';
import { saveAttachmentToFiles } from '@/lib/files/service';
import { toast } from 'sonner';

type Email = UIEmail;
type Thread = UIThread;

type Workspace = 'mail' | 'chat' | 'contacts' | 'calendar' | 'meet' | 'files' | 'tasks' | 'ai';
type Theme = 'light' | 'dark' | 'system';
type ReadingPane = 'right' | 'bottom' | 'hidden';

const mailFolders = [
  { label: 'Inbox', icon: Inbox, href: '/f/inbox', count: 4 },
  { label: 'Starred', icon: Star, href: '/f/starred' },
  { label: 'Sent', icon: Send, href: '/f/sent' },
  { label: 'Drafts', icon: PenLine, href: '/f/drafts', count: 2 },
  { label: 'Archive', icon: Archive, href: '/f/archive' },
  { label: 'Trash', icon: X, href: '/f/trash' },
];

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ name, color = 'slate', online = false }: { name: string; color?: string; online?: boolean }) {
  return (
    <span className={`avatar avatar-${color}`} aria-label={name}>
      {initials(name)}
      {online && <span className="presence-dot" />}
    </span>
  );
}

const chatThreads = [
  { name: 'Maya Chen', detail: 'The launch notes are ready for review.', time: '9:41 AM', color: 'coral', unread: 2, online: true },
  { name: 'Product design', detail: 'Ari: I added the mobile states.', time: 'Yesterday', color: 'slate', unread: 0, online: false },
  { name: 'Engineering', detail: 'You: Shipping the new workspace today.', time: 'Tue', color: 'gold', unread: 0, online: false },
];

const chatMessages = [
  { author: 'Maya Chen', initials: 'MC', text: 'Quick check: are we still on for the customer walkthrough at 2?', time: '9:38 AM', own: false },
  { author: 'You', initials: 'YO', text: 'Yes. I will bring the updated proposal and the usage notes.', time: '9:39 AM', own: true },
  { author: 'Maya Chen', initials: 'MC', text: 'Perfect. I added the latest feedback to the project folder.', time: '9:41 AM', own: false },
];

const globalWorkspaces = [
  { label: 'Mail', value: 'mail' as const, icon: Mail },
  { label: 'Chat', value: 'chat' as const, icon: MessageCircle },
  { label: 'Contacts', value: 'contacts' as const, icon: Users },
  { label: 'Calendar', value: 'calendar' as const, icon: CalendarDays },
  { label: 'Meet', value: 'meet' as const, icon: Video },
  { label: 'Files', value: 'files' as const, icon: FileText },
  { label: 'Tasks', value: 'tasks' as const, icon: Check },
  { label: 'AI Assistant', value: 'ai' as const, icon: Sparkles },
];

export function ApplicationShell({ folderName, threads, searchQuery, initialWorkspace = 'mail', dataUnavailable = false }: { folderName: string; threads: Thread[]; searchQuery?: string; initialWorkspace?: Workspace; dataUnavailable?: boolean }) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [openWorkspace, setOpenWorkspace] = useState<Workspace | null>(null);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.id ?? null);
  const [query, setQuery] = useState(searchQuery ?? '');
  const [searchOpen, setSearchOpen] = useState(Boolean(searchQuery));
  const [theme, setTheme] = useState<Theme>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'dense'>('comfortable');
  const [readingPane, setReadingPane] = useState<ReadingPane>('right');
  const [accent, setAccent] = useState('#c92b2b');
  const [showSettings, setShowSettings] = useState(false);

  const filteredThreads = useMemo(() => {
    if (!query.trim()) return threads;
    const term = query.toLowerCase();
    return threads.filter((thread) => `${thread.subject} ${thread.emails[0]?.body} ${thread.emails[0]?.sender.firstName}`.toLowerCase().includes(term));
  }, [query, threads]);
  const selectedThread = filteredThreads.find((thread) => thread.id === selectedId) ?? filteredThreads[0];

  return (
    <div className="workspace-shell flex h-full w-full" data-density={density} data-theme={theme} data-reading-pane={readingPane} data-rail-collapsed={railCollapsed} data-sidebar-collapsed={sidebarCollapsed} style={{ '--accent-color': accent } as React.CSSProperties}>
      <GlobalRail workspace={workspace} folderName={folderName} openWorkspace={openWorkspace} onOpenWorkspace={setOpenWorkspace} onWorkspaceChange={setWorkspace} collapsed={railCollapsed} onToggle={() => setRailCollapsed((value) => !value)} onSettings={() => setShowSettings(true)} />
      {workspace !== 'calendar' && workspace !== 'meet' && workspace !== 'files' && (
        <ContextSidebar workspace={workspace} folderName={folderName} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      )}
      <div className="workspace-main min-w-0 flex-1 flex flex-col overflow-hidden">
        {sidebarCollapsed && workspace !== 'calendar' && workspace !== 'meet' && workspace !== 'files' && <button className="sidebar-expand" onClick={() => setSidebarCollapsed(false)} aria-label="Expand workspace navigation" title="Expand workspace navigation"><PanelLeftOpen size={16} /></button>}
        {dataUnavailable && <div role="status" className="flex min-h-9 items-center justify-between border-b border-amber-200 bg-amber-50 px-5 text-[11px] text-amber-900"><span>Mail data is temporarily unavailable. You can still use the workspace and its local tools.</span><span className="font-medium">Retry when connection is restored</span></div>}
        {query.trim() && <SearchResults query={query} />}

        {workspace === 'mail' ? (
          <div className="mail-workspace">
            <MailList folderName={folderName} threads={filteredThreads} selectedId={selectedThread?.id ?? null} onSelect={setSelectedId} query={query} searchOpen={searchOpen} onQueryChange={setQuery} onToggleSearch={() => setSearchOpen((value) => !value)} />
            <MailReadingPane thread={selectedThread} />
          </div>
        ) : workspace === 'chat' ? (
          <ChatWorkspace />
        ) : workspace === 'calendar' ? (
          <CalendarWorkspace />
        ) : workspace === 'meet' ? (
          <MeetWorkspace />
        ) : workspace === 'files' ? (
          <FilesWorkspace />
        ) : workspace === 'tasks' ? (
          <TaskWorkspace />
        ) : (
          <PlaceholderWorkspace workspace={workspace} />
        )}
      </div>
      {showSettings && <SettingsPanel theme={theme} density={density} readingPane={readingPane} accent={accent} onThemeChange={setTheme} onDensityChange={setDensity} onReadingPaneChange={setReadingPane} onAccentChange={setAccent} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function GlobalRail({ workspace, folderName, openWorkspace, onOpenWorkspace, onWorkspaceChange, collapsed, onToggle, onSettings }: { workspace: Workspace; folderName: string; openWorkspace: Workspace | null; onOpenWorkspace: (workspace: Workspace | null) => void; onWorkspaceChange: (workspace: Workspace) => void; collapsed: boolean; onToggle: () => void; onSettings: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <aside className="global-rail">
      <div className="brand-mark" aria-label="Codin Mail" title="Codin Mail">C</div>
      <div className="rail-contexts" aria-label="Global workspaces">
        {globalWorkspaces.map(({ label, value, icon: Icon }) => <div key={value} className={`rail-popover-trigger ${openWorkspace === value ? 'open' : ''}`} onMouseEnter={() => onOpenWorkspace(value)} onMouseLeave={() => onOpenWorkspace(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) onOpenWorkspace(null); }}><button className={`rail-item ${workspace === value ? 'active' : ''}`} onClick={() => { onWorkspaceChange(value); onOpenWorkspace(value); }} onFocus={() => onOpenWorkspace(value)} aria-label={label} title={collapsed ? label : undefined}><Icon size={19} /><span>{label}</span>{value === 'chat' && <i />}</button><WorkspaceNavigation workspace={value} folderName={folderName} onSelect={() => onOpenWorkspace(null)} /></div>)}
      </div>
      <div className="rail-bottom">
        <button className="rail-item" onClick={onToggle} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}<span>{collapsed ? 'Expand' : 'Collapse'}</span></button>
        <button className="rail-item" onClick={onSettings} aria-label="Settings" title={collapsed ? 'Settings' : undefined}><Settings size={19} /><span>Settings</span></button>
        <div className="relative"><button className="profile-button rail-profile" onClick={() => setProfileOpen((value) => !value)} aria-label="Open Kelvin Kijazi account menu"><Avatar name="Kelvin Kijazi" color="coral" online />{!collapsed && <ChevronDown size={14} />}</button>{profileOpen && <div className="absolute bottom-11 left-0 z-30 w-52 rounded-lg border border-border bg-card p-2 shadow-xl"><div className="border-b border-border px-2 py-2"><b className="block text-xs">Kelvin Kijazi</b><span className="mt-0.5 block text-[10px] text-muted-foreground">Super Admin · Codin Technology</span></div><Link href="/admin" onClick={() => setProfileOpen(false)} className="mt-1 flex h-8 items-center gap-2 rounded px-2 text-xs font-medium text-foreground hover:bg-muted"><ShieldCheck size={14} className="text-primary" />Organization Admin</Link><button onClick={() => { setProfileOpen(false); onSettings(); }} className="flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"><Settings size={14} />Settings</button></div>}</div>
      </div>
    </aside>
  );
}

function WorkspaceNavigation({ workspace, folderName, onSelect }: { workspace: Workspace; folderName: string; onSelect: () => void }) {
  const item = globalWorkspaces.find((entry) => entry.value === workspace);
  const links: { label: string; icon: typeof Mail; href?: string; count?: number }[] = workspace === 'mail' ? mailFolders : workspace === 'chat' ? [{ label: 'Direct messages', icon: MessageCircle }, { label: 'Group chats', icon: Users }, { label: 'Channels', icon: Hash }] : workspace === 'calendar' ? [{ label: 'My calendar', icon: CalendarDays }, { label: 'Shared calendars', icon: Users }] : workspace === 'meet' ? [{ label: 'Meet dashboard', icon: Video }, { label: 'Upcoming calls', icon: Clock3 }, { label: 'Past recordings', icon: FileText }] : workspace === 'files' ? [{ label: 'Home', icon: FileText, href: '/files' }, { label: 'My files', icon: FileText, href: '/files' }, { label: 'Shared with me', icon: Users, href: '/files' }, { label: 'Recent', icon: Clock3, href: '/files' }] : workspace === 'tasks' ? [{ label: 'My tasks', icon: Check }, { label: 'Due soon', icon: Clock3 }, { label: 'Completed', icon: Check }] : workspace === 'contacts' ? [{ label: 'All contacts', icon: Users }, { label: 'Recently viewed', icon: Clock3 }] : [{ label: 'Assistant home', icon: Sparkles }, { label: 'Recent prompts', icon: Clock3 }];
  return <div className="workspace-popover" role="navigation" aria-label={`${item?.label} navigation`}><div className="mail-popover-title"><span className="eyebrow">Codin Mail</span><strong>{item?.label}</strong></div>{workspace === 'mail' && <Link href={`/f/${folderName}/new`} onClick={onSelect} className="popover-compose"><PenLine size={15} /> Compose</Link>}<div className="popover-links">{links.map(({ label, icon: Icon, href, count }) => <Link key={label} href={href ?? '#'} onClick={onSelect} className={workspace === 'mail' && folderName === label.toLowerCase() ? 'active' : ''}><Icon size={15} /><span>{label}</span>{count && <b>{count}</b>}</Link>)}</div></div>;
}

function ContextSidebar({ workspace, folderName, collapsed, onToggle }: { workspace: Workspace; folderName: string; collapsed: boolean; onToggle: () => void }) {
  if (workspace === 'mail' || workspace === 'chat' || workspace === 'contacts' || workspace === 'calendar' || workspace === 'meet' || workspace === 'files' || workspace === 'tasks' || workspace === 'ai') return null;
  if (workspace !== 'mail' && workspace !== 'chat') return <aside className="context-sidebar"><div className="context-heading"><div><span className="eyebrow">Codin Mail</span><h2>{globalWorkspaces.find((item) => item.value === workspace)?.label}</h2></div><button className="icon-button" onClick={onToggle} aria-label="Collapse workspace navigation"><PanelLeftClose size={17} /></button></div><div className="sidebar-section"><p className="nav-label">Workspace</p><ContextLink icon={workspace === 'calendar' ? CalendarDays : workspace === 'tasks' ? Check : workspace === 'contacts' ? Users : workspace === 'ai' ? Sparkles : FileText} label={workspace === 'calendar' ? 'My calendar' : workspace === 'tasks' ? 'My tasks' : workspace === 'contacts' ? 'All contacts' : workspace === 'ai' ? 'Assistant home' : 'Recent'} active /><ContextLink icon={FileText} label="Shared with me" /></div><div className="sidebar-footer"><ShieldCheck size={15} /><span>Codin Mail workspace</span></div></aside>;
  return (
    <aside className="context-sidebar">
      <div className="context-heading"><div><span className="eyebrow">Workspace</span><h2>{workspace === 'mail' ? 'Mail' : 'Chat'}</h2></div><button className="icon-button" onClick={onToggle} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button></div>
      {workspace === 'mail' ? <>
        <Link href={`/f/${folderName}/new`} className="compose-button"><PenLine size={16} /> Compose email</Link>
        <nav className="context-nav" aria-label="Mail folders">
          <p className="nav-label">Folders</p>
          {mailFolders.map(({ label, icon: Icon, href, count }) => <Link key={label} href={href} className={`context-link ${folderName === label.toLowerCase() ? 'active' : ''}`}><Icon size={16} /><span>{label}</span>{count && <b>{count}</b>}</Link>)}
        </nav>
      </> : <>
        <button className="compose-button chat-compose"><Plus size={16} /> New conversation</button>
        <nav className="context-nav"><p className="nav-label">Conversations</p><ContextLink icon={MessageCircle} label="Direct messages" active count="3" /><ContextLink icon={Users} label="Group chats" /><ContextLink icon={Hash} label="Channels" /></nav>
        <div className="sidebar-section"><p className="nav-label">Your channels</p><ContextLink icon={Hash} label="product-design" /><ContextLink icon={Hash} label="engineering" /></div>
      </>}
      <div className="sidebar-footer"><ShieldCheck size={15} /><span>Codin Mail workspace</span></div>
    </aside>
  );
}

function ContextLink({ icon: Icon, label, active = false, count }: { icon: typeof Mail; label: string; active?: boolean; count?: string }) {
  return <button className={`context-link ${active ? 'active' : ''}`}><Icon size={16} /><span>{label}</span>{count && <b>{count}</b>}</button>;
}

function MailList({ folderName, threads, selectedId, onSelect, query, searchOpen, onQueryChange, onToggleSearch }: { folderName: string; threads: Thread[]; selectedId: string | null; onSelect: (id: string) => void; query: string; searchOpen: boolean; onQueryChange: (query: string) => void; onToggleSearch: () => void }) {
  return <section className="mail-list-panel" aria-label="Email threads">
    <div className="panel-heading"><div><span className="eyebrow">Email</span><h1>{folderName === 'inbox' ? 'Inbox' : folderName}</h1></div><div className="mail-heading-actions">{searchOpen && <div className="inline-search"><Search size={14} /><input autoFocus value={query} onChange={(event) => onQueryChange(event.target.value)} aria-label="Search email" placeholder="Search mail" /></div>}<button className="icon-button" onClick={onToggleSearch} aria-label={searchOpen ? 'Close search' : 'Search email'}><Search size={17} /></button><button className="icon-button" aria-label="Open apps"><LayoutGrid size={17} /></button></div></div>
    <div className="list-toolbar"><span><strong>{threads.length}</strong> conversations</span><div className="toolbar-controls"><label><ListFilter size={13} /><select aria-label="Filter conversations" defaultValue="all"><option value="all">All mail</option><option value="unread">Unread</option><option value="starred">Starred</option><option value="attachments">Attachments</option></select></label><label><ArrowDownUp size={13} /><select aria-label="Sort conversations" defaultValue="newest"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="sender">Sender</option><option value="subject">Subject</option></select></label></div></div>
    <div className="thread-list">
      {threads.length === 0 ? <div className="empty-state"><Mail size={28} /><strong>No messages here</strong><span>Your inbox is clear for now.</span></div> : threads.map((thread, index) => {
        const latest = thread.emails[0];
        const sender = latest?.sender ? `${latest.sender.firstName} ${latest.sender.lastName}` : 'Unknown sender';
        const unread = index < 2;
        return <Link href={`/f/${folderName}/${thread.id}`} key={thread.id} onClick={() => onSelect(thread.id)} className={`thread-row ${selectedId === thread.id ? 'selected' : ''} ${unread ? 'unread' : ''}`}>
          <Avatar name={sender} color={['coral', 'slate', 'gold', 'green'][index % 4]} />
          <div className="thread-copy"><div className="thread-meta"><strong>{sender}</strong><time>{thread.lastActivityDate ? new Date(thread.lastActivityDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</time></div><div className="thread-subject">{thread.subject || '(no subject)'}</div><p>{latest?.body || 'No preview available'}</p><div className="thread-tags">{index === 0 && <span className="tag red">Important</span>}{index === 1 && <Paperclip size={13} />}</div></div>
          {unread && <span className="unread-dot" />}
        </Link>;
      })}
    </div>
  </section>;
}

function MailReadingPane({ thread }: { thread?: Thread }) {
  const [saveOpen, setSaveOpen] = useState(false);
  if (!thread) return <section className="reading-pane empty-reading"><Mail size={34} /><h2>Select a conversation</h2><p>Choose an email to read it here.</p></section>;
  const latest = thread.emails[0];
  const sender = latest?.sender ? `${latest.sender.firstName} ${latest.sender.lastName}` : 'Unknown sender';
  return <article className="reading-pane">
    <div className="email-document"><div className="email-title-row"><div><div className="tag red">Project update</div><h2>{thread.subject || '(no subject)'}</h2><p className="thread-context">{thread.emails.length} messages · {new Set(thread.emails.map((email) => email.sender.id)).size} participants · Last activity {thread.lastActivityDate ? new Date(thread.lastActivityDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'recently'}</p></div><div className="message-header-actions"><button className="icon-button state-star" aria-label="Star conversation"><Star size={18} /></button><button className="icon-button" aria-label="Archive"><Archive size={17} /></button><button className="icon-button" aria-label="Delete"><Trash2 size={17} /></button><button className="icon-button" aria-label="Mark unread"><EyeOff size={17} /></button><button className="icon-button" aria-label="Snooze"><Clock3 size={17} /></button><button className="icon-button" aria-label="More actions"><MoreHorizontal size={17} /></button></div></div>
      <div className="email-sender"><Avatar name={sender} color="coral" /><div><strong>{sender}</strong><p>to Alex Morgan <ChevronDown size={12} /></p></div><time>{latest?.sentDate ? new Date(latest.sentDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</time></div>
      <div className="email-body">{latest?.body || 'This thread does not have a message body.'}</div>
      <div className="attachment-row"><div className="attachment"><Paperclip size={16} /><div><strong>project-brief.pdf</strong><span>2.4 MB · PDF</span></div><div className="ml-auto flex gap-2"><button className="secondary-button" onClick={() => setSaveOpen(true)}>Save to Codin Files</button></div></div></div>
      <div className="email-actions"><button className="primary-action"><Reply size={15} /> Reply</button><button className="secondary-button"><ReplyAll size={15} /> Reply all</button><button className="secondary-button"><Forward size={15} /> Forward</button><Link href="/tasks" className="secondary-button"><Check size={15} /> Create task</Link><button className="ai-action"><Sparkles size={14} /> Summarize</button><button className="bridge-button"><MessageCircle size={15} /> Discuss in chat</button></div>
    </div>
    {saveOpen && (
      <SaveToFilesDialog
        fileName="project-brief.pdf"
        folders={loadFilesStore().folders}
        onClose={() => setSaveOpen(false)}
        onSave={(folderId) => {
          saveAttachmentToFiles(loadFilesStore(), 'project-brief.pdf', folderId);
          toast.success('Saved to Codin Files');
          setSaveOpen(false);
        }}
      />
    )}
  </article>;
}

function ChatWorkspace() {
  const [active, setActive] = useState(0);
  return <div className="chat-workspace"><section className="chat-list-panel"><div className="panel-heading"><div><span className="eyebrow">Chat</span><h1>Messages</h1></div><button className="icon-button" aria-label="New message"><PenLine size={17} /></button></div><div className="chat-filter"><Search size={14} /><input placeholder="Find a conversation" aria-label="Find a conversation" /></div>{chatThreads.map((chat, index) => <button key={chat.name} onClick={() => setActive(index)} className={`chat-row ${active === index ? 'selected' : ''}`}><Avatar name={chat.name} color={chat.color} online={chat.online} /><div><div className="thread-meta"><strong>{chat.name}</strong><time>{chat.time}</time></div><p>{chat.detail}</p></div>{chat.unread > 0 && <b className="chat-unread">{chat.unread}</b>}</button>)}</section><section className="chat-conversation"><div className="conversation-header"><div className="conversation-person"><Avatar name={chatThreads[active].name} color={chatThreads[active].color} online={chatThreads[active].online} /><div><strong>{chatThreads[active].name}</strong><span>{chatThreads[active].online ? 'Active now' : 'Last seen yesterday'}</span></div></div><div><button className="icon-button" aria-label="Search conversation"><Search size={17} /></button><button className="icon-button" aria-label="More conversation actions"><MoreHorizontal size={17} /></button></div></div><div className="message-area"><div className="date-divider"><span>Today</span></div>{chatMessages.map((message) => <div key={message.text} className={`message-group ${message.own ? 'own' : ''}`}><Avatar name={message.author} color={message.own ? 'coral' : 'slate'} /><div><div className="message-meta"><strong>{message.author}</strong><time>{message.time}</time></div><p>{message.text}</p></div></div>)}<div className="typing-indicator"><span /><span /><span /> Maya is typing</div></div><div className="chat-composer"><div className="composer-input">Message {chatThreads[active].name}...</div><div className="composer-tools"><button className="icon-button" aria-label="Attach file"><Paperclip size={17} /></button><button className="icon-button" aria-label="Add emoji">☺</button><button className="send-button" aria-label="Send message"><Send size={16} /></button></div></div><div className="continue-email"><span>Need a formal record?</span><button><Mail size={14} /> Continue in email</button></div></section></div>;
}

function SettingsPanel({ theme, density, readingPane, accent, onThemeChange, onDensityChange, onReadingPaneChange, onAccentChange, onClose }: { theme: Theme; density: 'comfortable' | 'compact' | 'dense'; readingPane: ReadingPane; accent: string; onThemeChange: (value: Theme) => void; onDensityChange: (value: 'comfortable' | 'compact' | 'dense') => void; onReadingPaneChange: (value: ReadingPane) => void; onAccentChange: (value: string) => void; onClose: () => void }) {
  return <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Appearance settings"><div className="settings-panel"><div className="settings-heading"><div><span className="eyebrow">Preferences</span><h2>Appearance</h2></div><button className="icon-button" onClick={onClose} aria-label="Close settings"><X size={18} /></button></div><p className="settings-copy">Tune the workspace to match how you work.</p><div className="setting-group"><label>Theme</label><div className="segmented-control three">{(['light', 'dark', 'system'] as const).map((value) => <button key={value} className={theme === value ? 'selected' : ''} onClick={() => onThemeChange(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></div><div className="setting-group"><label>Accent color</label><div className="accent-picker">{['#c92b2b', '#176b87', '#96711f', '#34745b'].map((value) => <button key={value} aria-label={`Use ${value} accent`} className={accent === value ? 'selected' : ''} style={{ background: value }} onClick={() => onAccentChange(value)} />)}</div></div><div className="setting-group"><label>Interface density</label><div className="segmented-control three">{(['comfortable', 'compact', 'dense'] as const).map((value) => <button key={value} className={density === value ? 'selected' : ''} onClick={() => onDensityChange(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></div><div className="setting-group"><label>Reading pane</label><div className="segmented-control three">{(['right', 'bottom', 'hidden'] as const).map((value) => <button key={value} className={readingPane === value ? 'selected' : ''} onClick={() => onReadingPaneChange(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></div><div className="setting-note"><Sparkles size={16} /><span>Preferences apply immediately to this workspace.</span></div></div></div>;
}

function PlaceholderWorkspace({ workspace }: { workspace: Exclude<Workspace, 'mail' | 'chat' | 'calendar' | 'meet' | 'files'> }) {
  const item = globalWorkspaces.find((entry) => entry.value === workspace);
  const Icon = item?.icon ?? BriefcaseBusiness;
  const copy = workspace === 'contacts' ? 'People and relationships across your workspace.' : workspace === 'tasks' ? 'Action items from conversations and projects.' : 'Contextual help for the work in front of you.';
  return <section className="placeholder-workspace"><div className="placeholder-icon"><Icon size={24} /></div><span className="eyebrow">Workspace</span><h1>{item?.label}</h1><p>{copy}</p><button className="primary-action"><Plus size={15} /> Create {workspace === 'tasks' ? 'task' : workspace === 'contacts' ? 'contact' : 'item'}</button></section>;
}

function SearchResults({ query }: { query: string }) {
  const results = [
    { type: 'FILES', icon: FileText, title: `${query} Proposal.pdf`, detail: 'Sales / Clients / ABC Logistics' },
    { type: 'EMAIL', icon: Mail, title: `${query} project update`, detail: 'A conversation in Inbox' },
    { type: 'CHAT', icon: MessageCircle, title: `${query} discussion`, detail: 'Maya Chen · Today' },
    { type: 'MEET', icon: Video, title: `${query} Review`, detail: 'Meeting · Today 10:32' },
    { type: 'TASKS', icon: Check, title: `Prepare ${query} quotation`, detail: 'Due tomorrow' },
  ];
  return <div className="search-results" role="dialog" aria-label="Search results"><div className="search-results-heading"><span>Results for “{query}”</span><span>All types</span></div>{results.map(({ type, icon: Icon, title, detail }) => <button key={type} className="search-result"><span className="search-result-icon"><Icon size={15} /></span><span><b>{title}</b><small>{detail}</small></span><em>{type}</em></button>)}</div>;
}
