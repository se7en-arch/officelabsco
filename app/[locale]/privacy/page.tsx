import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  return en
    ? { title: 'Privacy policy – OfficeLabs Co', description: 'How OfficeLabs Co collects, uses and protects your personal data.' }
    : { title: 'Политика за поверителност – OfficeLabs Co', description: 'Как OfficeLabs Co събира, използва и защитава личните ви данни.' };
}

const SECTIONS = [
  { id: 'controller', title: 'Администратор на данни' },
  { id: 'collect',    title: 'Какви данни събираме' },
  { id: 'use',        title: 'Как използваме данните' },
  { id: 'basis',      title: 'Правно основание (GDPR)' },
  { id: 'sharing',    title: 'Споделяне с трети страни' },
  { id: 'cookies',    title: 'Бисквитки' },
  { id: 'rights',     title: 'Вашите права' },
  { id: 'retention',  title: 'Съхранение на данните' },
  { id: 'security',   title: 'Сигурност' },
  { id: 'children',   title: 'Деца' },
  { id: 'changes',    title: 'Промени в политиката' },
  { id: 'contact',    title: 'Свържете се с нас' },
];

function PrivacyBg() {
  return (
    <LegalLayout
      title="Политика за поверителност"
      updated="18 юли 2026"
      sections={SECTIONS}
      icon={
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="14" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 14v-4a6 6 0 0 1 12 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="16" cy="21" r="2" fill="currentColor"/>
        </svg>
      }
    >

      <section className="lgl-section" id="controller">
        <h2>Администратор на данни</h2>
        <p>
          <strong>OfficeLabs Co</strong> е администратор на лични данни по смисъла
          на Общия регламент за защита на данните (GDPR, Регламент ЕС 2016/679).
        </p>
        <ul>
          <li><strong>Уебсайт:</strong> <a href="https://officelabsco.com">officelabsco.com</a></li>
          <li><strong>Имейл:</strong> <a href="mailto:info@officelabsco.com">info@officelabsco.com</a></li>
        </ul>
        <p>
          Тази политика описва какви лични данни събираме, защо и как ги защитаваме,
          когато използвате нашия уебсайт или правите поръчка при нас.
        </p>
      </section>

      <section className="lgl-section" id="collect">
        <h2>Какви данни събираме</h2>

        <h3>Данни, предоставени от вас при поръчка</h3>
        <ul>
          <li>Три имена, имейл адрес, телефонен номер</li>
          <li>Адрес за доставка (град, улица, пощенски код)</li>
          <li>Фирмени данни при заявка за фактура (наименование, ЕИК, ДДС номер, МОЛ)</li>
          <li>Избран куриер, начин на доставка и начин на плащане</li>
        </ul>

        <h3>Технически данни, събирани автоматично</h3>
        <ul>
          <li>IP адрес и приблизително географско местоположение (държава, град)</li>
          <li>Вид и версия на браузър (User-Agent)</li>
          <li>Страница, от която сте дошли (Referer)</li>
          <li>Предпочитан език на браузъра</li>
          <li>Часова зона</li>
        </ul>

        <h3>Маркетингови данни (UTM)</h3>
        <p>
          При посещение от рекламна връзка съхраняваме UTM параметри (utm_source,
          utm_medium, utm_campaign) единствено за анализ на ефективността на
          маркетинговите канали.
        </p>

        <h3>Данни от количката</h3>
        <p>
          Съдържанието на количката се съхранява локално в браузъра ви (localStorage)
          и не се предава на нашите сървъри, докато не финализирате поръчка.
        </p>
      </section>

      <section className="lgl-section" id="use">
        <h2>Как използваме данните</h2>

        <h3>Изпълнение на поръчки</h3>
        <p>
          Личните данни от поръчката се използват изключително за обработка и
          доставка, издаване на фактура при поискване и комуникация относно статуса
          на пратката.
        </p>

        <h3>Имейл известия</h3>
        <p>
          Изпращаме потвърждение по имейл непосредствено след поръчка. Не изпращаме
          маркетингови имейли без изрично съгласие от ваша страна.
        </p>

        <h3>Подобряване на услугата</h3>
        <p>
          Техническите данни (IP, браузър, UTM) се използват анонимно за анализ на
          трафика, подобряване на сайта и предотвратяване на злоупотреби.
        </p>

        <h3>Законови задължения</h3>
        <p>
          Пазим данните от поръчките (включително фактури) за срок от 5 години
          съгласно изискванията на ЗКПО и ЗДДС.
        </p>
      </section>

      <section className="lgl-section" id="basis">
        <h2>Правно основание (GDPR)</h2>
        <p>Обработваме личните ви данни на следните правни основания:</p>
        <ul>
          <li>
            <strong>Изпълнение на договор — чл. 6(1)(б) GDPR</strong> — данните,
            необходими за обработка на поръчката и доставката.
          </li>
          <li>
            <strong>Законово задължение — чл. 6(1)(в) GDPR</strong> — данни,
            необходими за счетоводна и данъчна отчетност.
          </li>
          <li>
            <strong>Легитимен интерес — чл. 6(1)(е) GDPR</strong> — технически
            данни за сигурност и предотвратяване на злоупотреби; UTM данни за
            оценка на маркетинговата ефективност.
          </li>
        </ul>
      </section>

      <section className="lgl-section" id="sharing">
        <h2>Споделяне с трети страни</h2>
        <p>
          Не продаваме и не отдаваме личните ви данни под наем. Данните могат да
          бъдат споделени единствено с:
        </p>

        <h3>Куриерски компании</h3>
        <p>
          Предаваме три имена, адрес и телефон на избрания куриер единствено с цел
          изпълнение на доставката.
        </p>

        <h3>Технически доставчици</h3>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — хостинг на уебсайта и съхранение на
            изображения. Данните се обработват в ЦОД в рамките на ЕС и САЩ съгласно{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              политиката за поверителност на Vercel
            </a>.
          </li>
          <li>
            <strong>Turso / ChiselStrike Inc.</strong> — база данни, в която се
            съхраняват поръчките.
          </li>
          <li>
            <strong>Resend Inc.</strong> — изпращане на транзакционни имейли
            (потвърждения за поръчки).
          </li>
        </ul>

        <h3>Държавни органи</h3>
        <p>
          Можем да разкрием данни пред компетентни органи, когато сме задължени по
          закон (напр. НАП, съд, прокуратура).
        </p>
        <p>
          Всички наши доставчици са обвързани с договорни задължения за защита на
          данните и са приели стандартни договорни клаузи на ЕК или разполагат с
          адекватно ниво на защита.
        </p>
      </section>

      <section className="lgl-section" id="cookies">
        <h2>Бисквитки</h2>
        <p>
          Сайтът използва минимален брой бисквитки, необходими за функционирането му.
          Не използваме бисквитки за проследяване или реклама.
        </p>

        <h3>Бисквитки, използвани от сайта</h3>
        <ul>
          <li>
            <strong>ol_preview</strong> — временна бисквитка за достъп по
            време на разработка. Ще бъде премахната след пускане на сайта.
          </li>
          <li>
            <strong>admin_token</strong> — удостоверяване за административния
            панел. Достъпна само за администратора.
          </li>
        </ul>

        <h3>Локално съхранение (localStorage)</h3>
        <p>
          Количката за пазаруване се съхранява в localStorage на вашия браузър
          под ключа <code>officelabsco-cart</code>. Тези данни не се изпращат на
          нашите сървъри и се изтриват при изчистване на данните на браузъра.
        </p>
        <p>
          Можете да деактивирате или изтриете бисквитки от настройките на браузъра
          си. Имайте предвид, че деактивирането може да повлияе на функционалността
          на сайта.
        </p>
      </section>

      <section className="lgl-section" id="rights">
        <h2>Вашите права</h2>
        <p>Като субект на данни по GDPR имате следните права:</p>
        <ul>
          <li>
            <strong>Право на достъп (чл. 15)</strong> — да получите информация
            какви данни обработваме за вас.
          </li>
          <li>
            <strong>Право на коригиране (чл. 16)</strong> — да поискате поправяне
            на неточни данни.
          </li>
          <li>
            <strong>Право на изтриване (чл. 17)</strong> — да поискате изтриване
            на данните ви, освен ако имаме законово задължение да ги пазим.
          </li>
          <li>
            <strong>Право на ограничаване (чл. 18)</strong> — да поискате
            ограничаване на обработката при определени обстоятелства.
          </li>
          <li>
            <strong>Право на преносимост (чл. 20)</strong> — да получите данните
            си в структуриран, машинно четим формат.
          </li>
          <li>
            <strong>Право на възражение (чл. 21)</strong> — да се противопоставите
            на обработка, базирана на легитимен интерес.
          </li>
          <li>
            <strong>Право на жалба</strong> — до Комисията за защита на лични данни
            (КЗЛД),{' '}
            <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer">cpdp.bg</a>,
            ако считате, че правата ви са нарушени.
          </li>
        </ul>
        <p>
          За упражняване на правата си изпратете имейл на{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>.
          Ще отговорим в срок до <strong>30 дни</strong>.
        </p>
      </section>

      <section className="lgl-section" id="retention">
        <h2>Съхранение на данните</h2>
        <ul>
          <li>
            <strong>Данни от поръчки</strong> — съхраняват се за <strong>5 години</strong>{' '}
            съгласно изискванията на ЗКПО и ЗДДС.
          </li>
          <li>
            <strong>Технически данни</strong> (IP, браузър, UTM) — съхраняват се
            заедно с поръчката за същия срок.
          </li>
          <li>
            <strong>Данни от незавършена поръчка</strong> — не се съхраняват на
            сървъра; остават само в localStorage на вашия браузър.
          </li>
        </ul>
        <p>
          След изтичане на сроковете данните се изтриват или анонимизират по
          сигурен начин.
        </p>
      </section>

      <section className="lgl-section" id="security">
        <h2>Сигурност</h2>
        <p>Прилагаме технически и организационни мерки за защита на данните ви:</p>
        <ul>
          <li>Целият трафик е криптиран чрез TLS/HTTPS;</li>
          <li>Паролите и токените се съхраняват като криптографски хешове (SHA-256);</li>
          <li>Достъпът до административния панел е защитен с парола;</li>
          <li>Базата данни е достъпна само чрез криптирана връзка с токен за удостоверяване;</li>
          <li>Не приемаме плащания с карта на сайта. Плащането се извършва по банков път по проформа фактура, а банковите данни на клиента се обработват само за издаване на фактурата.</li>
        </ul>
        <p>
          При установяване на нарушение на сигурността ще уведомим засегнатите лица
          и КЗЛД в законоустановените срокове.
        </p>
      </section>

      <section className="lgl-section" id="children">
        <h2>Деца</h2>
        <p>
          Сайтът не е предназначен за лица под 18 години и съзнателно не събира
          лични данни от непълнолетни. Ако разберем, че сме обработили данни на
          дете без родителско съгласие, ще ги изтрием незабавно.
        </p>
      </section>

      <section className="lgl-section" id="changes">
        <h2>Промени в политиката</h2>
        <p>
          Може да актуализираме тази политика периодично, за да отразим промени в
          законодателството или в нашата дейност. При съществени промени ще публикуваме
          известие на сайта. Препоръчваме да проверявате политиката редовно.
        </p>
        <p>
          Датата на последното обновяване е посочена в горната част на страницата.
        </p>
      </section>

      <section className="lgl-section" id="contact">
        <h2>Свържете се с нас</h2>
        <p>При въпроси, искания или жалби, свързани с личните ви данни:</p>
        <ul>
          <li><strong>Имейл:</strong> <a href="mailto:info@officelabsco.com">info@officelabsco.com</a></li>
          <li><strong>Уебсайт:</strong> <a href="https://officelabsco.com">officelabsco.com</a></li>
        </ul>
        <p>Ще отговорим на всяко запитване в срок до 30 дни от получаването му.</p>
      </section>

    </LegalLayout>
  );
}

const SECTIONS_EN = [
  { id: 'controller', title: 'Data controller' },
  { id: 'collect',    title: 'What data we collect' },
  { id: 'use',        title: 'How we use the data' },
  { id: 'basis',      title: 'Legal basis (GDPR)' },
  { id: 'sharing',    title: 'Sharing with third parties' },
  { id: 'cookies',    title: 'Cookies' },
  { id: 'rights',     title: 'Your rights' },
  { id: 'retention',  title: 'Data retention' },
  { id: 'security',   title: 'Security' },
  { id: 'children',   title: 'Children' },
  { id: 'changes',    title: 'Changes to this policy' },
  { id: 'contact',    title: 'Contact us' },
];

function PrivacyEn() {
  return (
    <LegalLayout
      title="Privacy policy"
      updated="18 July 2026"
      sections={SECTIONS_EN}
      icon={
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="14" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 14v-4a6 6 0 0 1 12 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="16" cy="21" r="2" fill="currentColor"/>
        </svg>
      }
    >

      <section className="lgl-section" id="controller">
        <h2>Data controller</h2>
        <p>
          <strong>OfficeLabs Co</strong> is the controller of personal data within the meaning
          of the General Data Protection Regulation (GDPR, Regulation (EU) 2016/679).
        </p>
        <ul>
          <li><strong>Website:</strong> <a href="https://officelabsco.com">officelabsco.com</a></li>
          <li><strong>Email:</strong> <a href="mailto:info@officelabsco.com">info@officelabsco.com</a></li>
        </ul>
        <p>
          This policy describes what personal data we collect, why, and how we protect it
          when you use our website or place an order with us.
        </p>
      </section>

      <section className="lgl-section" id="collect">
        <h2>What data we collect</h2>

        <h3>Data you provide when placing an order</h3>
        <ul>
          <li>Full name, email address, phone number</li>
          <li>Delivery address (city, street, postcode)</li>
          <li>Company details when you request an invoice (company name, UIC, VAT number, company representative)</li>
          <li>Chosen courier, delivery method and payment method</li>
        </ul>

        <h3>Technical data collected automatically</h3>
        <ul>
          <li>IP address and approximate location (country, city)</li>
          <li>Browser type and version (User-Agent)</li>
          <li>The page you came from (Referer)</li>
          <li>Preferred browser language</li>
          <li>Time zone</li>
        </ul>

        <h3>Marketing data (UTM)</h3>
        <p>
          When you visit from an advertising link, we store UTM parameters (utm_source,
          utm_medium, utm_campaign) solely to analyse the effectiveness of our marketing channels.
        </p>

        <h3>Cart data</h3>
        <p>
          The contents of your cart are stored locally in your browser (localStorage) and are
          not sent to our servers until you complete an order.
        </p>
      </section>

      <section className="lgl-section" id="use">
        <h2>How we use the data</h2>

        <h3>Fulfilling orders</h3>
        <p>
          Personal data from an order is used exclusively to process and deliver the order, to
          issue an invoice on request, and to communicate about the status of the delivery.
        </p>

        <h3>Email notifications</h3>
        <p>
          We send an order confirmation by email immediately after you place an order. We do not
          send marketing emails without your explicit consent.
        </p>

        <h3>Improving the service</h3>
        <p>
          Technical data (IP, browser, UTM) is used anonymously to analyse traffic, improve the
          website and prevent abuse.
        </p>

        <h3>Legal obligations</h3>
        <p>
          We keep order data (including invoices) for 5 years, as required by the Corporate Income
          Tax Act and the VAT Act.
        </p>
      </section>

      <section className="lgl-section" id="basis">
        <h2>Legal basis (GDPR)</h2>
        <p>We process your personal data on the following legal bases:</p>
        <ul>
          <li>
            <strong>Performance of a contract — Art. 6(1)(b) GDPR</strong> — data necessary to
            process and deliver your order.
          </li>
          <li>
            <strong>Legal obligation — Art. 6(1)(c) GDPR</strong> — data necessary for accounting
            and tax reporting.
          </li>
          <li>
            <strong>Legitimate interest — Art. 6(1)(f) GDPR</strong> — technical data for security
            and abuse prevention; UTM data to assess marketing effectiveness.
          </li>
        </ul>
      </section>

      <section className="lgl-section" id="sharing">
        <h2>Sharing with third parties</h2>
        <p>
          We do not sell or rent out your personal data. Data may only be shared with:
        </p>

        <h3>Courier companies</h3>
        <p>
          We pass your full name, address and phone number to the chosen courier solely to carry
          out the delivery.
        </p>

        <h3>Technical service providers</h3>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — website hosting and image storage. Data is processed in
            data centres within the EU and the USA, under{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              Vercel's privacy policy
            </a>.
          </li>
          <li>
            <strong>Turso / ChiselStrike Inc.</strong> — database in which orders are stored.
          </li>
          <li>
            <strong>Resend Inc.</strong> — sending transactional emails (order confirmations).
          </li>
        </ul>

        <h3>Public authorities</h3>
        <p>
          We may disclose data to competent authorities where we are required to do so by law
          (e.g. the National Revenue Agency, courts, prosecutors).
        </p>
        <p>
          All our providers are bound by contractual data protection obligations and have adopted
          the European Commission's standard contractual clauses or provide an adequate level of
          protection.
        </p>
      </section>

      <section className="lgl-section" id="cookies">
        <h2>Cookies</h2>
        <p>
          The site uses a minimal number of cookies that are necessary for it to work. We do not
          use tracking or advertising cookies.
        </p>

        <h3>Cookies used by the site</h3>
        <ul>
          <li>
            <strong>ol_preview</strong> — a temporary cookie for access during development. It will
            be removed after the site launches.
          </li>
          <li>
            <strong>admin_token</strong> — authentication for the admin panel. Available only to
            the administrator.
          </li>
        </ul>

        <h3>Local storage (localStorage)</h3>
        <p>
          The shopping cart is stored in the localStorage of your browser under the key{' '}
          <code>officelabsco-cart</code>. This data is not sent to our servers and is deleted when
          you clear your browser data.
        </p>
        <p>
          You can disable or delete cookies in your browser settings. Note that disabling them may
          affect the functionality of the site.
        </p>
      </section>

      <section className="lgl-section" id="rights">
        <h2>Your rights</h2>
        <p>As a data subject under the GDPR you have the following rights:</p>
        <ul>
          <li>
            <strong>Right of access (Art. 15)</strong> — to receive information about what data we
            process about you.
          </li>
          <li>
            <strong>Right to rectification (Art. 16)</strong> — to ask us to correct inaccurate data.
          </li>
          <li>
            <strong>Right to erasure (Art. 17)</strong> — to ask us to delete your data, unless we
            are legally required to keep it.
          </li>
          <li>
            <strong>Right to restriction (Art. 18)</strong> — to ask us to restrict processing in
            certain circumstances.
          </li>
          <li>
            <strong>Right to data portability (Art. 20)</strong> — to receive your data in a
            structured, machine-readable format.
          </li>
          <li>
            <strong>Right to object (Art. 21)</strong> — to object to processing based on legitimate
            interest.
          </li>
          <li>
            <strong>Right to complain</strong> — to the Bulgarian Commission for Personal Data
            Protection (CPDP),{' '}
            <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer">cpdp.bg</a>, if you
            believe your rights have been violated.
          </li>
        </ul>
        <p>
          To exercise your rights, email{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>.
          We will reply within <strong>30 days</strong>.
        </p>
      </section>

      <section className="lgl-section" id="retention">
        <h2>Data retention</h2>
        <ul>
          <li>
            <strong>Order data</strong> — kept for <strong>5 years</strong>, as required by the
            Corporate Income Tax Act and the VAT Act.
          </li>
          <li>
            <strong>Technical data</strong> (IP, browser, UTM) — kept together with the order for the
            same period.
          </li>
          <li>
            <strong>Unfinished orders</strong> — not stored on the server; they remain only in the
            localStorage of your browser.
          </li>
        </ul>
        <p>
          Once these periods expire, the data is deleted or anonymised securely.
        </p>
      </section>

      <section className="lgl-section" id="security">
        <h2>Security</h2>
        <p>We apply technical and organisational measures to protect your data:</p>
        <ul>
          <li>All traffic is encrypted with TLS/HTTPS;</li>
          <li>Passwords and tokens are stored as cryptographic hashes (SHA-256);</li>
          <li>Access to the admin panel is protected with a password;</li>
          <li>The database is accessible only over an encrypted connection with an authentication token;</li>
          <li>We do not accept card payments on the website. Payment is made by bank transfer against a proforma invoice, and the customer's bank details are processed only to issue the invoice.</li>
        </ul>
        <p>
          If a security breach is detected, we will notify the affected persons and the CPDP within
          the statutory deadlines.
        </p>
      </section>

      <section className="lgl-section" id="children">
        <h2>Children</h2>
        <p>
          The site is not intended for persons under 18, and we knowingly do not collect personal data
          from minors. If we learn that we have processed a child's data without parental consent, we
          will delete it immediately.
        </p>
      </section>

      <section className="lgl-section" id="changes">
        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time to reflect changes in legislation or in our
          business. For significant changes we will publish a notice on the site. We recommend that you
          check the policy regularly.
        </p>
        <p>
          The date of the last update is shown at the top of the page.
        </p>
      </section>

      <section className="lgl-section" id="contact">
        <h2>Contact us</h2>
        <p>For questions, requests or complaints related to your personal data:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@officelabsco.com">info@officelabsco.com</a></li>
          <li><strong>Website:</strong> <a href="https://officelabsco.com">officelabsco.com</a></li>
        </ul>
      </section>

    </LegalLayout>
  );
}

export default async function PrivacyPage() {
  const en = (await getLocale()) === 'en';
  return en ? <PrivacyEn /> : <PrivacyBg />;
}
