## **Problem: rozproszenie danych medycznych**

### **Czym są dane medyczne**

W tym kontekście dane medyczne obejmują:

* **Przyjmowane leki:** co i kiedy pacjent faktycznie bierze (także leki bez recepty i suplementy).  
* **Informacje o lekach:** dawkowanie, substancje czynne, informacje z ulotki (w tym przeciwwskazania, pokazywane jako fakty, bez automatycznych ostrzeżeń).  
* **Historię badań:** wyniki i daty wykonanych badań.  
* **Zdiagnozowane choroby:** aktualne i przebyte diagnozy.  
* **Objawy i samopoczucie:** subiektywny stan pacjenta w danym momencie (np. ból głowy, omdlenie).  
* **Zdjęcia:** zmiany skórne, rany, obrzęki, dokumentowane w czasie.

### **Główne problemy**

1. **Rozproszenie danych.** Informacje są w wielu miejscach (przychodnie, szpitale, laboratoria, aplikacje, papier). IKP zbiera dane oficjalne, ale nie wie, co pacjent faktycznie przyjmuje, jakie ma objawy ani jakie leki kupuje bez recepty.  
2. **Łatwo je zgubić lub zapomnieć.** Pacjent nie pamięta dawek, dat badań, objawów ani zaleceń z wizyty, a dokumenty łatwo się gubią.  
3. **Brak osadzenia w czasie.** Trudno zobaczyć dane na jednej osi czasu, np. powiązać objaw z momentem rozpoczęcia nowego leku.  
4. **Brak danych medycznych za granicą.** Lekarz za granicą nie ma dostępu do historii pacjenta, a pacjent często nie umie jej opisać w obcym języku.

### **Przykład z życia**

Pacjentka leczona na nowotwór krwi. Lekarze kolejno zmieniali leki, a po każdym wyniki krwi były złe. Nikt nie wiedział dlaczego. Pacjentka nie uznała za istotne, żeby wspomnieć o suplemencie z grzybów, który brała. Lekarze dowiedzieli się o nim przypadkiem, od jej córki.

Wniosek: **pacjent nie wie, co jest istotne.** Dlatego zapisujemy wszystko, co bierze (także suplementy i zioła), i pokazujemy to lekarzowi na równi z lekami z recepty.

### **Rozwiązanie w jednym zdaniu**

Prywatna oś czasu zdrowia na telefonie pacjenta, uzupełniana głosem, którą w kilka sekund można bezpiecznie pokazać dowolnemu lekarzowi, także za granicą.

### **Czym się wyróżniamy**

* **mojeIKP** wie, co lekarz przepisał. My wiemy, co pacjent faktycznie bierze, plus objawy, zdjęcia, notatki z wizyt i leki bez recepty, na jednej osi czasu.  
* **Bearable** to dziennik objawów do samoobserwacji. My łączymy dane własne z oficjalnymi dokumentami i projektujemy widok dla lekarza.  
* **Głos jako główny sposób obsługi:** wprowadzanie danych i zadawanie pytań o przeszłość.  
* **Local-first:** dane tylko na telefonie pacjenta, zaszyfrowane. **Historia zdrowia nigdy nie opuszcza telefonu.** Do modelu językowego idzie tylko pojedyncze pytanie lub notatka, anonimowo: bez imienia, profilu i historii, a serwer niczego nie zapisuje.  
* Konkurencja: mojeIKP, [https\://play.google.com/store/apps/dev?id=8979963710425634832\&hl=pl](https://play.google.com/store/apps/dev?id=8979963710425634832&hl=pl) (Bearable), [https\://play.google.com/store/apps/dev?id=4896576500808342115\&hl=pl](https://play.google.com/store/apps/dev?id=4896576500808342115&hl=pl) (do sprawdzenia: link nie działa)

### **Funkcje**

#### **Zbieranie danych**

* **Wpis głosowy:** „od rana boli mnie głowa, wzięłam ibuprom” → aplikacja rozpoznaje objaw i lek, pacjent zatwierdza jednym dotknięciem.  
* **Pytanie o wszystko, co pacjent bierze:** przy dodawaniu leków aplikacja pyta wprost o suplementy, witaminy, zioła i leki bez recepty („czy bierzesz coś jeszcze, nawet herbatki ziołowe?”).  
* **Baza leków** z Rejestru Produktów Leczniczych (dane otwarte): podpowiadanie nazw, substancje czynne, dawki.  
* **Import dokumentów z IKP:** pacjent pobiera dokument i udostępnia go aplikacji przez menu „Udostępnij”.  
* **Zdjęcie wyniku badania** z rozpoznawaniem tekstu na urządzeniu.  
* **Zdjęcia w czasie:** dodanie zdjęcia lub zrobienie z aplikacji

#### **Codzienność**

* Przypomnienia o lekach z potwierdzeniem „wziąłem / pominąłem”.  
* Przy odstawieniu lub zmianie leku pytanie o powód („mdłości”, „nie pomagało”).

#### **Wizyta u lekarza**

* **Lista na wizytę:** pacjent w dowolnej chwili mówi „powiem lekarzowi, że…”; przed wizytą lista wyświetla się automatycznie.  
* **Podsumowanie danych:** przy wizycie u lekarza aplikacja szykuje zestawienie danych, aby lekarz zobaczył potrzebne informacje.   
* **Widok dla lekarza:** w przeglądarce lekarza (przesył szyfrowany end-to-end). Od razu widać listę spraw od pacjenta, wszystko, co pacjent przyjmuje (leki na receptę, bez recepty, suplementy i zioła na równi), oraz oś czasu z wynikami badań. Niżej zdjęcia, wizyty i odstawione leki. Aplikacja niczego nie interpretuje: lekarz sam widzi, co się zbiega w czasie.  
* **Notatka głosowa po wizycie:** „lekarz zmienił lek na X, kontrola za miesiąc” → aplikacja proponuje zmiany w lekach i przypomnienie o kontroli do zatwierdzenia.

#### **Pytania o przeszłość (kluczowe scenariusze)**

* „Jakie leki brałam w ostatnich 2 miesiącach?” (oddawanie krwi)  
* „Kiedy ostatnio brałam leki przeciwzakrzepowe?” (przed zabiegiem)  
* „Od kiedy mam te bóle głowy?” (nowy lekarz)  
* Model językowy zamienia pytanie na filtr, a odpowiedź pochodzi z lokalnej bazy. Model nie dostaje całej historii.

#### **Za granicą**

* **Podsumowanie offline** w języku lekarza: alergie, aktualne leki, choroby, z międzynarodowymi kodami (ATC dla leków, ICD-10 dla chorób). Leki tłumaczone przez substancję czynną. Do pokazania na ekranie lub jako PDF.

### **Happy path**

1. Pani Anna, leczona na nowotwór krwi, instaluje aplikację i dodaje leki. Aplikacja pyta: „czy bierzesz coś jeszcze, nawet suplementy albo zioła?”. Anna dodaje suplement, który sama uważa za nieistotny.  
2. Codziennie potwierdza leki i suplement jednym dotknięciem. Wieczorem mówi: „od rana boli mnie głowa, wzięłam ibuprom” i zatwierdza wpis.  
3. Dodaje wyniki krwi po każdej zmianie leku. Na osi czasu widać, że wyniki są złe po każdym leku, a jedyną stałą jest suplement.  
4. Mówi: „powiem lekarzowi, że po nowym leku kręci mi się w głowie”. To trafia na listę na wizytę.  
5. Na wizycie lekarz pokazuje QR w przeglądarce, Anna go skanuje. Lekarz widzi oś czasu, wyniki badań, listę pytań i aktualne leki, w tym suplement na równi z lekami z recepty. Zauważa go od razu, bez przypadkowej rozmowy z rodziną.  
6. Po wizycie nagrywa notatkę: „odstawić suplement, kontrola morfologii za dwa tygodnie”. Aplikacja zapisuje odstawienie z powodem i ustawia przypomnienie.  
7. Przed oddaniem krwi pyta głosem: „jakie leki brałam w ostatnich dwóch miesiącach?” i dostaje listę z datami, razem z suplementem.  
8. Na wakacjach w Hiszpanii pokazuje lekarzowi podsumowanie po hiszpańsku, dostępne bez internetu.

### **Przesył danych**

* **Szyfrowanie end-to-end:** telefon pacjenta szyfruje dane, a odszyfrowuje je dopiero przeglądarka lekarza.  
* **Serwer jak listonosz z zaklejoną kopertą:** przekazuje zaszyfrowane dane, ale nie ma klucza. Nie przechowuje i nie widzi danych.  
* **Parowanie przez QR:** lekarz pokazuje kod z kluczem publicznym, pacjent go skanuje.  
* **Jednorazowe klucze:** nowe na każdą wizytę, po wizycie znikają. Nawet zachowana kopia zaszyfrowanych danych jest później bezużyteczna.  
* **Kod weryfikacyjny:** telefon i ekran lekarza pokazują te same 4 cyfry. Jeśli się zgadzają, nikt (także serwer) nie podszył się pod żadną stronę.  
* **Działa w każdej sieci**, także komórkowej i w sieci przychodni, bo korzysta z tego samego połączenia co strona.

### **Przechowywanie i szyfrowanie**

* Dane tylko na telefonie, w bazie szyfrowanej AES-256 (SQLCipher).  
* Klucz bazy chroniony sprzętowo (Android Keystore / iOS Keychain), nie opuszcza urządzenia.  
* Zdjęcia i nagrania jako osobno szyfrowane pliki. Nagrania usuwane po rozpoznaniu tekstu.  
* Blokada aplikacji biometrią.  
* Ochrona przed wyciekami: brak podglądu w przełączniku aplikacji, blokada zrzutów ekranu, brak danych medycznych w powiadomieniach („Czas na lek” zamiast nazwy leku), wyłączony systemowy backup danych aplikacji (kopię robi pacjent sam, patrz niżej).

### **Kopia zapasowa i nowy telefon**

* **Eksport do pliku po stronie użytkownika:** pacjent eksportuje dane do jednego pliku i sam decyduje, gdzie go zapisać (dysk w chmurze, komputer, pendrive).  
* **Plik jest zaszyfrowany hasłem pacjenta:** klucz wyprowadzany z hasła (Argon2id), szyfrowanie całości, czyli bazy i zdjęć. Bez hasła plik jest bezużyteczny, więc miejsce przechowywania nie musi być zaufane.  
* **Import na nowym telefonie:** pacjent wskazuje plik i podaje hasło. Aplikacja odszyfrowuje dane i zapisuje je w bazie zaszyfrowanej nowym kluczem urządzenia.  
* **Działa między Androidem a iOS**, bo hasło nie jest związane z konkretnym urządzeniem.  
* **Przypomnienie o eksporcie** (np. raz w miesiącu), bo bez kopii utrata telefonu oznacza utratę danych.  
* Świadoma konsekwencja: brak opcji „zapomniałem hasła”. Zapomniane hasło oznacza bezużyteczną kopię. Pacjent jest o tym wyraźnie informowany przy pierwszym eksporcie.

