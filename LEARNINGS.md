# Learnings

## Multiplayer
Für die Kommunikation zwischen Browser-App und Game-Server nutzen wir websockets. In Deno gibt es dazu ein Modul, welches das Aufsetzen eines entsprechenden Servers einfach macht (https://deno.land/x/websocket@v0.1.1/lib/websocket.ts). Standardmäßig bietet das Modul allerdings kein secure websockets, was im Netzwerk zu Problemen führen kann, da manche Browser unsichere remote-websocket-Verbindungen nicht zulassen.
Aus diesem Grund haben wir das websocket-Modul von Deno entsprechend angepasst.
Hierzu sind Änderungen in der depts.ts und ./lib/websocket.ts notwendig. Es muss die serveTLS-Methode aus dem http-standard-Modul importiert werden und die connect-Methode in ./lib/websocket.ts angepasst werden. Statt this.server = serve... muss einfach this.server = serveTLS mit den entsprechenden httpsOptions aufgerufen werden.

Der std-http-Server muss mit host: 0.0.0.0 initialisiert werden, damit Anfragen aus dem LAN etc. angenommen werden.

## Verwendung einer Engine
Zunächst wollten wir das Spiel "from scratch" selbst schreiben. Allerdings haben wir mit der Zeit gemerkt, welcher Aufwand hinter der Entwicklung einer eigenen "Engine" steckt. Die Implementierung von Steuerung, Kollisionsabfragen und Levelediting hätte wahrscheinlich dazu geführt, dass wir nicht zur Programmierung des eigentlichen Spiels gekommen wären. Aus diesem Grund haben wir uns auf die Suche nach bestehenden Web-Game-Engines gemacht und sind dabei auf melon.js und dem Leveleditor Tiled gestoßen, auf denen unser Projekt nun aufbaut.

## Warum Melon.js?

Tatsächlich bieten die neuesten Versionen der beliebtesten Browser (z. B. Chrome, Firefox und Edge) Unterstützung für fortschrittliches Grafik-Rendering (wie WebGL), was sehr interessante Möglichkeiten zur Spieleentwicklung bietet. Und um das Spiel zu entwickeln, haben wir nach einem Framework gesucht, das beim Schreiben des Codes hilft und dafür fertige Bibliotheken bereitstellt.

Nach Recherche im Internet, haben wir uns für eine Melon.js entschieden, weil:

- Für den Anfang ist es völlig unabhängig, es sind keine externen Abhängigkeiten erforderlich, damit es funktioniert.

- Es hat jedoch die Integration mit mehreren Tools von Drittanbietern, die uns das Entwicklungsprozess erleichtern, wie Tiled (mit dem die Karten und Bühnen für das Spiel erstellt werden können), TexturePacker (der auch dabei hilft, den erforderlichen Texturatlas zu erstellen, um das Sprite-Management zu vereinfachen und zu optimieren).

- 2D-Physik-Engine integriert. Das bedeutet, dass es ermöglicht, sofort auf eine sofort einsatzbereite realistische 2D-Bewegung und Kollisionserkennung zugreifen zu können.

- Unterstützung für die Sound-API, mit der die Soundeffekte und Hintergrundmusik mit herausragender Einfachheit hinzufügen können.

## https, wws und certBot

Während der Nutzung des Spiels werden keine sensiblen Daten übertragen, weshalb es aus diesem Grund nicht unbedingt notwendig gewesen wäre, eine sichere Verbindung zu unserem Server aufzubauen. Da wir allerdings Websockets nutzen und einige Browser unsichere Websocket-Verbindungen nur auf dem Localhost zu lassen, kamen wir um den Einsatz eines Zertifikates nicht herum. Zunächst haben wir dabei einfach mit einem selbstsigniertem Zertifikat gearbeitet, was allerdings den etwas aufwendigen Prozess eines manuellen Akzeptierens erforderlich machte. Das ist im Entwicklungsprozess noch annehmber, aber spätestens im Produktivbetrieb nicht tolerabel - zumal manche Browser, aus gutem Grund, tlw. sehr restrektive Einstellungen haben, was selbstsignierte Zertifikate anbelangt.

Zur Erstellung eines trustful certificate haben wir CertBot eingesetzt. Da wir unseren Web- und Game-Server auf einer Ubuntu-EC2-Maschine deployt haben, ist die Installation des CertBots einfach. Neben der Installation haben wir zudem eine Domain (kektus.de) registriert und in unserem DNS-Service einen A-Record für eine entsprechende Sub-Domain (commander.kektus.de) angelegt, welches auf die Public-IP unseres Servers verweist. CertBot verlangt jetzt lediglich die Eingabe der kontrollierten Domain und erstellt ein entsprechendes Zertifikat.


