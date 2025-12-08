# ActivityPub / Fediverse Integration Plan

## 1. Goals
- Turn From Abyss Media into a federated publisher node.
- Keep portal CMS (Django) focused on editorial experience while a new Fediverse gateway handles ActivityPub S2S.
- Support bi-directional interactions (Create/Announce/Like/Follow/Reply) for articles, reviews, shows, and community comments.

## 2. Architecture Overview
| Layer | Responsibility |
| --- | --- |
| **Portal (Django)** | Existing site, `/studio`, article rendering, admin auth.
| **Fediverse Gateway** | New microservice (Rust or Python) exposing ActivityPub endpoints: WebFinger, Actors, Inbox, Outbox, Signed Delivery, Moderation queue.
| **Worker Pool** | Async delivery queue + ingestion workers (HTTP Signatures, retries, fan-out).
| **Shared Store** | Postgres (existing) for content + new tables for federation state (actors, followers, activities). Redis/Kafka for queueing.

## 3. Core Endpoints
- `/.well-known/webfinger` → resolves `acct:actor@fromabyss.com` to actor ID.
- `/actors/{slug}` → Actor document (Person, Organization, Service). Must include `inbox`, `outbox`, `followers`, `following`, `publicKey`.
- `/inbox` (POST) → receives activities, verifies HTTP Signature, enqueues moderation.
- `/outbox` (GET/POST) → lists and emits activities. Creation limited to internal actors; remote fetch needed for dereferencing.
- `/activities/{id}` → canonical JSON-LD for each broadcast.

## 4. Actor Model
| Entity | Type | Example Handle |
| --- | --- | --- |
| Abyss brand | `Organization` | `@fromabyssmedia@fromabyss.com` |
| Channels (e.g., EndOfAbyss) | `Service`/`Group` | `@endofabyss@fromabyss.com` |
| Authors | `Person` | `@ed@fromabyss.com` |
| Automation bots | `Application` | `@newsbot@fromabyss.com` |

## 5. Activity Mapping
| Portal Event | ActivityPub |
| --- | --- |
| Publish article/review | `Create { Article }` from Person, `Announce` from channel |
| Push video/podcast | `Create { Video/Audio }` |
| Share/boost | `Announce` |
| Comment | `Create { Note }` w/ `inReplyTo` |
| Rating/like | `Like` |
| Deletion/update | `Delete` / `Update` |

## 6. Security Requirements
1. **HTTP Signatures** for all inbox/outbox requests.
2. **Asynchronous Delivery** with retry/backoff.
3. **JSON-LD Compliance** with `https://www.w3.org/ns/activitystreams` context.
4. **SSRF Protection** when dereferencing remote objects (URL allowlist, IP filtering).
5. **Moderation**: domain blocks, actor mutes, keyword filters, quarantine queues.

## 7. Implementation Phases
1. **Phase 0 – Documentation & Schema**
   - Finalize actor naming, domain policy, data schemas (followers, activities, inbox queue).
2. **Phase 1 – Outgoing Federation**
   - WebFinger + Actors + Outbox.
   - Announce new drops/reviews via ActivityPub but disable inbox (read-only node).
3. **Phase 2 – Incoming Federation**
   - Implement inbox processing, moderation workflows, Accept/Reject flows.
   - Map incoming `Create { Note }` to portal comments.
4. **Phase 3 – Advanced Features**
   - Fediverse reactions displayed on site, per-channel follower counts, Listen/View activities for media.
   - ActivityPub integration with OBS/stream schedule (optional).

## 8. Data Model Additions
- `fediverse_actor` table (id, type, handle, keys, profile JSON).
- `fediverse_follow` (local_actor_id, remote_actor_id, state).
- `fediverse_activity` (id, type, payload, status, delivery log).
- `inbox_queue` / `outbox_queue` tables or Redis streams.

## 9. Microservice Considerations
- Prefer isolated deployment (e.g., `fediverse.yml`) to shield media services from DDoS.
- Use Actix/Axum (Rust) or FastAPI (Python) depending on choice.
- Provide health endpoints and structured logging for moderation.
- Expose internal REST API for Django to push new content into the Fediverse gateway.

## 10. Next Steps
- Decide language (Rust recommended for high-throughput gateway).
- Generate keys for actors; store in secure vault.
- Build minimal prototype emitting `Announce` for new posts.
- Plan migration of `/studio` social section to consume new service metrics.

