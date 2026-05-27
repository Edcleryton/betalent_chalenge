# Strategie für Sicherheitstests — Restful-Booker

## 1. Umfang und Ziele

Die Sicherheitstests validieren, dass die Restful-Booker API:
1. **Authentifizierung erfordert** für Schreibvorgänge (PUT, PATCH, DELETE)
2. **Ungültige oder abgelaufene Token ablehnt** mit entsprechendem Status
3. **Keine falschen HTTP-Methoden akzeptiert** an spezifischen Endpunkten
4. **Stabil bleibt**, wenn unerwartete oder bösartige Header empfangen werden

> Die Sicherheitstests befinden sich in der Gruppe **„4. Security Validations“** der Postman-Collection.

---

## 2. Abgedeckte Szenarien

| ID | Name | Endpunkt | Technik | Erwartet |
|---|---|---|---|---|
| SEC-001 | Schreiben ohne Auth | `PUT /booking/1` | Anfrage ohne Authentifizierungs-Header | **403 Forbidden** |
| SEC-002 | DeleteBooking - Ungültiges Token | `DELETE /booking/1` | Cookie mit gefälschtem Token (`invalid_token_xyz_lab_test`) | **403 Forbidden** |
| SEC-003 | Method Tampering | `POST /booking/1` | Falsche HTTP-Methode auf ID-Route | **404 oder 405** |
| SEC-003b | PatchBooking - Ohne Auth | `PATCH /booking/1` | PATCH ohne Cookie oder Authorization | **403 Forbidden** |
| SEC-004 | Header Injection | `GET /booking` | Header mit XSS- und SQL-Injection-Payloads | **200** (Stabilität) |
| SEC-005 | UpdateBooking - Abgelaufenes Token | `PUT /booking/1` | Token mit gültigem Format, aber ungültigem Wert (`000000000000000000000000`) | **403 Forbidden** |

---

## 3. Angewendete Techniken

### 3.1 Auth Bypass (SEC-001, SEC-002, SEC-003b, SEC-005)
Überprüft, ob Schreibrouten Anfragen ohne Authentifizierung oder mit ungültigen Token ablehnen. Die API unterstützt zwei Authentifizierungsmethoden:
- **Cookie:** `Cookie: token=<wert>`
- **Basic Auth:** `Authorization: Basic <base64(admin:password123)>`

Die Tests SEC-001, SEC-003b und SEC-005 lassen die Authentifizierung weg oder fälschen sie, um zu bestätigen, dass der Status **403 Forbidden** zurückgegeben wird.

### 3.2 Method Tampering (SEC-003)
Sendet die HTTP-Methode `POST` an die Route `/booking/:id`, die nur `GET`, `PUT`, `PATCH` und `DELETE` akzeptiert. Validiert, dass die API keine falschen Methoden verarbeitet — erwartet wird **404 oder 405**.

### 3.3 Header Injection (SEC-004)
Sendet Header mit bösartigem Inhalt:
- `X-Custom-Header: <script>alert(1)</script>` — XSS-Payload
- `X-SQL-Injection: '; DROP TABLE bookings; --` — SQL-Injection-Payload
- `X-Forwarded-For: 127.0.0.1, 127.0.0.2, 127.0.0.1` — IP-Spoofing

Das Ziel ist zu verifizieren, dass die API **stabil bleibt** (200 zurückgibt) und diese Header nicht auf gefährliche Weise verarbeitet.

---

## 4. Identifizierte Risiken

| Risiko | Beweis | Empfehlung |
|---|---|---|
| Token ohne Ablaufdatum | Kein dokumentierter Logout-Mechanismus oder TTL | Token-Ablauf implementieren (z. B. JWT mit `exp`) |
| Status 403 ohne erklärenden Body | API liefert 403 mit leerem Body | `{ "reason": "Unauthorized" }` für bessere DX zurückgeben |
| Basic Auth mit festen Anmeldedaten | `admin:password123` in der Dokumentation hartkodiert | In der Produktion OAuth oder Rotation der Anmeldedaten verwenden |

---

## 5. Was nicht getestet wurde (außerhalb des Umfangs)

- **Rate Limiting / Brute Force:** Die API dokumentiert keine Limits für Versuche pro IP.
- **Body-Injektion:** Buchungsfelder mit SQL/XSS-Payloads (die API speichert keine Daten in einer exponierten relationalen Datenbank).
- **HTTPS/TLS:** Es wird davon ausgegangen, dass Heroku TLS korrekt verwaltet.
- **CORS:** Nicht dokumentiert und außerhalb des Umfangs von API-Tests.
