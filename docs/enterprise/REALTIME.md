# Realtime & Collaboration

## Architecture

```
┌──────────────┐     WebSocket      ┌──────────────┐
│  Client A    │◄──────────────────►│  Socket.IO   │
│  (Yjs doc)   │                    │  Server      │
└──────────────┘                    └──────┬───────┘
┌──────────────┐                           │
│  Client B    │◄──────────────────────────┤
│  (Yjs doc)   │                           │
└──────────────┘                           ▼
                                    ┌──────────────┐
                                    │ Redis Pub/Sub│
                                    │ (multi-node) │
                                    └──────────────┘
```

## CRDT Document Model

- **Yjs** document per resume: `Y.Map` for canvas elements, `Y.Array` for layers
- Persist snapshots to `resume_versions` every 30s debounced
- Full version history in PostgreSQL

## Presence

| Field | Transport |
|-------|-----------|
| Cursor position | WebSocket broadcast |
| Selected element | WebSocket |
| User avatar/name | Join payload |
| Active tool | WebSocket |

Room naming: `resume:{resumeId}`

## Comments

- Stored in PostgreSQL `comments` table
- Realtime notification via WebSocket `comment:added`
- Thread replies via `parentId`
- Resolve/unresolve for review workflows

## Team Workspaces

```
Organization
  └── Team (workspace)
        └── TeamMember (owner | editor | viewer)
              └── Resume (shared)
```

Permissions:
- **Owner:** billing, delete workspace
- **Editor:** edit resumes, invite
- **Viewer:** read-only, comment

## Version History

Every save creates optional `ResumeVersion`:
- Auto-save: debounced, max 50 versions per resume
- Manual snapshot: user-named ("Before interview prep")
- Diff: JSON patch between versions

## Deployment Options

| Option | Pros |
|--------|------|
| Custom Node server + Socket.IO | Full control, Yjs sync |
| Liveblocks / Partykit | Managed CRDT, faster ship |
| Supabase Realtime | Postgres changes only |

**Recommended path:** Start with Socket.IO + Redis adapter on Railway/Fly; migrate to Partykit if scale demands.

## Current Codebase

- Scaffold: `lib/websocket.ts` — analytics events only
- Target: `lib/enterprise/collaboration/presence.ts`
- Editor integration: `components/collaboration/PresenceLayer.tsx` (to build)

## Conflict Resolution

- Canvas: Yjs CRDT (last-write-wins per property)
- Form sections: Operational transform via server merge on save
- AI edits: Require user accept/reject (no auto-apply in collab mode)
