# MCT Core Domain Model

My-Class-Track (MCT) is an offline-first Persian Progressive Web App (PWA) designed for therapy group management (دستیار گروه درمانی).

## Language

**Member (عضو):**
An individual participant in the therapy group.
_Avoid_: Patient, client, user (unless referring to app role).

**Session (جلسه):**
A scheduled therapy meeting on a specific date (Jalali calendar key), tracking attendance across two phases (Nوبت ۱ / نوبت ۲).
_Avoid_: Event, class-instance.

**Period (دوره):**
A grouping term for a sequence of sessions with assigned responsible members (مسئولان) for attendance, fees, and homework.
_Avoid_: Semester, term.

**Role (نقش):**
Permissions assigned to a user or member (`admin`, `support` / حامی, `follow` / پیگیر, `view` / مشاهده‌گر).
_Avoid_: Permission level, ACL.

**Attendance Status (وضعیت حضور):**
The state of a member in a session: `present` (حاضر), `delay` (تأخیر), `absent` (غایب), `problem` (مشکل), or `none` (ثبت‌نشده).
_Avoid_: Check-in state.

## Relationships

- A **Period** contains multiple **Sessions** and designates specific **Members** as responsible for tasks.
- A **Session** records attendance and status for each **Member** across two rounds (`p1`, `p2`).
- A **Member** belongs to a **Group** and may hold multiple **Roles** or responsibilities.

## Invariants

- Every session date key must be formatted uniquely as `YYYY-MM-DD` in Jalali calendar terms.
- Attendance statuses must strictly belong to the allowed set: `present`, `delay`, `absent`, `problem`, `none`.
- Role assignments cannot grant administrative privileges unless the role is explicitly `admin`.
