# LivingCity – Platforma do organizacji lokalnych wydarzeń

LivingCity to aplikacja webowa umożliwiająca organizowanie i przeglądanie lokalnych wydarzeń w mieście.
System pozwala użytkownikom wyszukiwać wydarzenia na mapie, zapisywać się na nie oraz zarządzać nimi jako organizator lub administrator.

Projekt składa się z dwóch części:

Frontend – aplikacja użytkownika (admin)
Backend – API serwera (server)
Baza danych – PostgreSQL

---

Wymagania

Przed uruchomieniem projektu należy zainstalować:

Node.js (zalecane 18 lub nowsze)
PostgreSQL (14 lub nowszy)

npm jest instalowany razem z Node.js

---

Struktura projektu

Projekt zawiera dwa główne foldery:

admin – aplikacja frontendowa (React + Vite)
server – backend API (Node.js + Express)

Frontend komunikuje się z backendem przez REST API.

---

Konfiguracja zmiennych środowiskowych

1. Backend (server)

W folderze server utwórz plik .env

Następnie dodaj:

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=livingcity
DB_USER=postgres
DB_PASSWORD=twoje_haslo_do_postgres

ACCESS_TOKEN_SECRET=super_secret_key
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES_DAYS=30

NODE_ENV=development

---

Konfiguracja bazy danych

Najpierw uruchom PostgreSQL.

Następnie utwórz bazę danych:

CREATE DATABASE livingcity;

Po utworzeniu bazy aplikacja backendowa będzie mogła się z nią połączyć przy użyciu danych z pliku .env.

---

Instalacja zależności

1. Backend

Przejdź do folderu server

cd server

Zainstaluj zależności:

npm install

2. Frontend

Przejdź do folderu admin

cd admin

Zainstaluj zależności:

npm install

---

Uruchomienie projektu

Projekt wymaga uruchomienia dwóch usług w osobnych terminalach.

1. Backend

Przejdź do folderu server

cd server

Uruchom serwer:

node index.js

Serwer powinien uruchomić się pod adresem:

http://localhost:3000

2. Frontend

Przejdź do folderu admin

cd admin

Uruchom aplikację:

npm run dev

Frontend będzie dostępny pod adresem:

http://localhost:5173

---

Testowanie API

Po uruchomieniu backendu można testować API np. w Postmanie.

Przykładowe endpointy:

POST /auth/login – logowanie użytkownika
POST /auth/register – rejestracja użytkownika
GET /api/events – pobranie listy wydarzeń
POST /api/events – dodanie wydarzenia
DELETE /api/events/:id – usunięcie wydarzenia

---

Architektura systemu

Frontend (React + Vite)
↓
Backend API (Node.js + Express)
↓
Baza danych (PostgreSQL)

