# Security Specification — SPDT NTP 2026 Proposed Commodities (`proposed_commodities`)

## 1. Data Invariants
1. **Path Variable Hardening**: Every `proposalId` must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
2. **Strict Schema Enforcement (`hasAll` & `hasOnly`)**: Every document in `/proposed_commodities/{proposalId}` must contain strictly the 11 required keys (`name`, `unit`, `sector`, `category`, `groupCode`, `groupLabel`, `officerCode`, `officerName`, `note`, `status`, `createdAtMs`) and no shadow/unexpected keys.
3. **Bounded Field Sizes & Enums**:
   - `name`: string, 2..160 chars
   - `unit`: string, 1..40 chars
   - `sector`: enum in `['KONSUMSI', 'TANAMAN_PANGAN', 'HORTIKULTURA', 'PERKEBUNAN', 'PETERNAKAN', 'PERIKANAN_TANGKAP', 'PERIKANAN_BUDIDAYA', 'KEHUTANAN']`
   - `category`: enum in `['KONSUMSI', 'PRODUKSI', 'BIAYA_PRODUKSI']`
   - `groupCode`: string, 2..40 chars
   - `groupLabel`: string, 2..160 chars
   - `officerCode`: string, 2..16 chars
   - `officerName`: string, 1..120 chars
   - `note`: string, 0..400 chars
   - `status`: enum in `['BELUM_ADA_KODE', 'DITINJAU_PML']`
   - `createdAtMs`: int/number `> 0`
4. **Immutable Timestamp (`createdAtMs`)**: During `update`, `incoming().createdAtMs == existing().createdAtMs` and only allowed mutable fields can change.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: Payload containing extra field `"isAdmin": true` -> REJECTED (`hasOnly`).
2. **Oversized Commodity Name**: `name` length 500 chars -> REJECTED (`size() <= 160`).
3. **Empty Commodity Name**: `name` length 1 char -> REJECTED (`size() >= 2`).
4. **Invalid Sector Enum**: `sector: "PERTAMBANGAN"` -> REJECTED.
5. **Invalid Category Enum**: `category: "LAINNYA"` -> REJECTED.
6. **Oversized Note**: `note` length 2000 chars -> REJECTED (`size() <= 400`).
7. **Invalid Status Enum**: `status: "APPROVED"` -> REJECTED.
8. **Type Poisoning on `createdAtMs`**: `createdAtMs: "2026-11-25"` (string instead of number) -> REJECTED.
9. **Path ID Poisoning**: `proposalId` with spaces or special characters -> REJECTED (`isValidId`).
10. **Immutable Timestamp Tampering**: `update` changing `createdAtMs` -> REJECTED.
11. **Missing Required Field**: Payload omitting `groupCode` -> REJECTED (`hasAll`).
12. **Unprotected Root Path Write**: Writing to `/other_collection/doc1` -> REJECTED (Global default-deny catch-all).
