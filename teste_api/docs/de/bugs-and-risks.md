# Analyse von Bugs, Vorschlägen und Risiken — Restful-Booker

## 1. Gefundene Bugs (bestätigt via Automatisierung)

Die Tests bestätigen das korrekte Verhalten gemäß der REST-Spezifikation (RFC 7231). Solange der Bug in der API nicht behoben ist, **schlägt der entsprechende Test fehl** — dieser Fehlschlag dient als Rückverfolgbarkeitssignal für den Bug.

| ID | Endpunkt | Beschreibung | Schweregrad | Fehlgeschlagener Test | Status |
|---|---|---|---|---|---|
| BUG-001 | `DELETE /booking/:id` | Liefert **201 Created** anstelle von **204 No Content**. Die REST-Semantik erfordert 204 für eine erfolgreiche Löschung. Bestätigt in 2 Requests: `DeleteBooking` und `Contract - Cleanup`. | Niedrig | `DeleteBooking`, `Contract - Cleanup (DeleteBooking)` | ❌ Aktiv |
| BUG-002 | `POST /booking` (XML) | Request mit `Content-Type: text/xml` liefert **418 I'm a Teapot** anstelle von 200. XML-Unterstützung ist dokumentiert, aber nicht implementiert. | Mittel | `CreateBooking - XML (Evidence Bug)` | ❌ Aktiv |
| BUG-003 | `POST /auth` | Ungültige Anmeldedaten liefern **200 OK** mit `{ "reason": "Bad credentials" }` im Body anstelle von **401 Unauthorized**. Jeder Client, der nur den Statuscode prüft, wertet den fehlgeschlagenen Login als Erfolg. | Mittel | `Auth - Invalid Credentials` | ❌ Aktiv |
| BUG-004 | `POST /booking` | Payload ohne Pflichtfeld (`firstname`) liefert **500 Internal Server Error** anstelle von **400 Bad Request**. Dies deutet auf eine fehlende Eingabevalidierung auf dem Server hin; in der Produktion könnten Stacktraces offengelegt werden. | Hoch | `CreateBooking - Missing Required Field` | ❌ Aktiv |
| BUG-005 | `GET /ping` | Health-Check liefert **201 Created** anstelle von **200 OK**. Der Code 201 bedeutet "Ressource erstellt", was semantisch für einen Verfügbarkeits-Endpunkt falsch ist. Monitoring-Tools, die 200 validieren, melden eine falsche Nichtverfügbarkeit. | Niedrig | `Ping - HealthCheck` | ❌ Aktiv |
| BUG-006 | Alle Fehler-Endpunkte | Fehlerantworten (403, 404) liefern einen **Klartext-Body** (`"Forbidden"`, `"Not Found"`) anstelle von strukturiertem JSON. Dies verhindert eine programmatische Fehlerbehandlung ohne String-Parsing. | Niedrig | — (derzeit keine Prüfung des Fehler-Bodys) | ⚠️ Dokumentiert |

---

## 2. Verbesserungsvorschläge (API UX/DX)

| Vorschlag | Zugehöriger Bug | Auswirkung |
|---|---|---|
| DELETE auf **204 No Content** standardisieren | BUG-001 | REST-Konformität, verbessert die Vorhersehbarkeit für Konsumenten |
| GET /ping korrigieren, um **200 OK** zu liefern | BUG-005 | Kompatibilität mit Monitoring-Tools (Health-Checks) |
| **401 Unauthorized** bei ungültigen Anmeldedaten liefern | BUG-003 | Erleichtert die Fehlerbehandlung über den Statuscode ohne Parsing des Bodys |
| **400 Bad Request** bei ungültigem/unvollständigem Payload liefern | BUG-004 | Vermeidet die Offenlegung von Server-Stacktraces; verbessert die DX |
| XML-Unterstützung korrigieren oder aus der Dokumentation entfernen | BUG-002 | Beseitigt Verwirrung durch den nicht dokumentierten Status 418 |
| Fehler-Body als JSON `{"reason": "..."}` standardisieren | BUG-006 | Stellt sicher, dass Konsumenten Fehler konsistent parsen können |
| **405 Method Not Allowed** bei unzulässigen Methoden liefern | OBS-SEC | Präzisere Diagnose bei der Integration (RFC 7231) |
| Token-Ablauf und Logout-Route implementieren | — | Sicherheitsverbesserung — Token ohne Ablaufdatum sind ein Risiko |

---

## 3. Risikoanalyse

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigierung |
|---|---|---|---|
| **Dateninstabilität:** Gemeinsam genutzte öffentliche API — IDs können von anderen Benutzern zwischen Anfragen geändert/gelöscht werden | Hoch | Mittel | Dynamisch generierte IDs durch den Test selbst verwenden; niemals Daten-IDs hardcoden |
| **Service-Nichtverfügbarkeit:** Heroku Free Tier kann Kaltstarts oder Instabilitäten aufweisen | Mittel | Hoch | Retry in der CI/CD; Überwachung via Health-Check vor Ausführung der Suite |
| **Ambiguität des 418-Status:** Erschwert Automatisierung und Diagnose realer Integrationsfehler | Hoch | Mittel | Test bestätigt 200 (korrekt); aktiver Fehlschlag verfolgt den Bug (BUG-002) |
| **Token ohne Ablaufdatum:** Unbegrenzt gültige Token vergrößern die Angriffsfläche | Niedrig | Hoch | Als Sicherheitsrisiko dokumentieren; neues Token für jede Ausführung generieren |
| **Fehlende Server-Validierung:** Fehlerhafte Payloads verursachen 500 statt 400 | Hoch | Mittel | In Negativtests aufnehmen; als BUG-004 melden |

---

## 4. Fazit

Die API erfüllt ihre pädagogische Rolle für QA-Studien gut, weist jedoch 6 Statuscode-Bugs auf, die den REST-Standards (RFC 7231) widersprechen. BUG-004 (500 bei ungültigem Payload) ist am kritischsten — er deutet auf eine fehlende Eingabevalidierung hin und kann in der Produktion Stacktraces offenlegen. BUG-003 (200 bei ungültigen Anmeldedaten) ist bei der realen Integration am folgenreichsten, da er die Erwartung jedes Clients bricht, der den Statuscode zur Erkennung von Authentifizierungsfehlern prüft.

> Die vollständige Analyse Dimension für Dimension (Verbs, Authorization, Data, Errors, Responsiveness) finden Sie in [vader-analysis.md](vader-analysis.md).
