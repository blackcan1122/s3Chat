import React from 'react'

function Impressum(){
return(
    <>
<main className="impressum-block">
      <h1>Impressum</h1>

      {/* § 5 DDG – core duty information */}
      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <dl>
          <dt>Name des Diensteanbieters</dt>
          <dd><strong>Marcel Schulz</strong></dd>

          <dt>Anschrift</dt>
          <dd>
            <strong>
              Dorfstraße 38<br />
              72141 Walddorfhäslach
            </strong>
          </dd>

          <dt>Kontakt</dt>
          <dd>
            E-Mail:&nbsp;
            <a href="mailto:marcel.s@live.de">
              marcel.s@live.de
            </a>
          </dd>
        </dl>
      </section>

      {/* § 18 MStV – person in charge for editorial content */}
      <section>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          <strong>
            Marcel Schulz
          </strong>
        </p>
      </section>

      {/* ------- Optional blocks below – delete if you don't want them ------- */}
      <section>
        <h2>Haftung für Links</h2>
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt verlinkter Seiten sind
          ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>
    </main>
    </>
)
}

export default Impressum;