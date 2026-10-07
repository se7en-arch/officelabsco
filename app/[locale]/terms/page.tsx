import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  return en
    ? { title: "Terms of use – OfficeLabs Co", description: "Terms of use for officelabsco.com" }
    : { title: "Условия за ползване – OfficeLabs Co", description: "Общи условия за ползване на officelabsco.com" };
}

const SECTIONS = [
  { id: 'general',    title: 'Общи разпоредби' },
  { id: 'orders',     title: 'Поръчки' },
  { id: 'prices',     title: 'Цени и плащане' },
  { id: 'delivery',   title: 'Доставка' },
  { id: 'withdrawal', title: 'Право на отказ' },
  { id: 'returns',    title: 'Връщане на стоки' },
  { id: 'warranty',   title: 'Гаранция' },
  { id: 'ip',         title: 'Интелектуална собственост' },
  { id: 'liability',  title: 'Отговорност' },
  { id: 'law',        title: 'Приложимо право' },
  { id: 'contact',    title: 'Контакти' },
];

function TermsBg() {
  return (
    <LegalLayout
      title="Условия за ползване"
      updated="18 юли 2026"
      sections={SECTIONS}
      icon={
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 3L5 7.5V15c0 6.075 4.8 11.75 11 13 6.2-1.25 11-6.925 11-13V7.5L16 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M11 16l3.5 3.5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      }
    >

      <section className="lgl-section" id="general">
        <h2>Общи разпоредби</h2>
        <p>
          Настоящите Общи условия уреждат отношенията между <strong>OfficeLabs Co</strong>{' '}
          (наричано по-долу „Дружеството"), оператор на уебсайта{' '}
          <strong>officelabsco.com</strong>, и всяко лице, което достъпва или използва сайта.
        </p>
        <p>
          С посещаването и използването на сайта вие приемате настоящите условия изцяло.
          Ако не сте съгласни с тях, моля преустановете ползването на сайта.
        </p>
        <p>
          Дружеството си запазва правото да изменя условията по всяко време. Промените
          влизат в сила от момента на публикуването им. Продължаването на използването
          на сайта след публикуване на промените означава, че ги приемате.
        </p>
        <h3>Достъп до сайта</h3>
        <p>
          Сайтът е достъпен за лица над 18 години или за непълнолетни с изричното
          съгласие на родител или настойник. С извършването на поръчка вие потвърждавате,
          че отговаряте на това изискване.
        </p>
      </section>

      <section className="lgl-section" id="orders">
        <h2>Поръчки</h2>
        <p>
          Поставянето на артикул в количката не резервира наличността. Поръчката се
          счита за приета от наша страна след изпращане на потвърждение по имейл.
        </p>
        <h3>Процес на поръчка</h3>
        <ol>
          <li>Изберете продукт и го добавете в количката.</li>
          <li>Преминете към checkout и попълнете данните за доставка.</li>
          <li>Потвърдете поръчката.</li>
          <li>Ще получите имейл потвърждение на посочения адрес.</li>
        </ol>
        <h3>Точност на информацията</h3>
        <p>
          Полагаме усилия описанията и снимките на продуктите да бъдат точни. Въпреки
          това не гарантираме пълна идентичност на цветовете на монитора с реалния
          продукт. При съществено разминаване имате право да върнете стоката съгласно
          раздел „Право на отказ".
        </p>
        <h3>Анулиране на поръчка</h3>
        <p>
          Можете да анулирате поръчка до 2 часа след нейното подаване, като се свържете
          с нас на <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>.
          След изпращане на пратката анулирането не е възможно — приложима е процедурата
          за връщане.
        </p>
      </section>

      <section className="lgl-section" id="prices">
        <h2>Цени и плащане</h2>
        <p>
          Всички цени на сайта са в евро (€) и включват приложимите данъци. Дружеството
          си запазва правото да актуализира цените по всяко време. Приложима е цената,
          показана в момента на потвърждение на поръчката.
        </p>
        <h3>Начин на плащане</h3>
        <p>
          Плащането се извършва по банков път, по проформа фактура, която изпращаме след
          потвърждение на поръчката. Не приемаме наложен платеж и плащане с карта на сайта.
        </p>
        <h3>Фактуриране</h3>
        <p>
          При поискване издаваме фактура. За издаване на фактура към фирма е необходимо
          да попълните фирмените данни (ЕИК, ДДС номер, МОЛ) при оформяне на поръчката.
        </p>
      </section>

      <section className="lgl-section" id="delivery">
        <h2>Доставка</h2>
        <p>
          Доставките се извършват на територията на Република България. Производството и
          доставката отнемат <strong>30 работни дни</strong> след потвърждение на поръчката.
        </p>

        <h3>Условия за доставка</h3>
        <p>Доставката на поръчаните стоки може да се извършва:</p>
        <ul>
          <li>чрез куриерска фирма SPEEDY;</li>
          <li>чрез куриерска фирма CVC за палетни пратки;</li>
          <li>със собствен фирмен транспорт на „Office Labs Co.";</li>
          <li>чрез лично получаване от обект на Търговеца, когато тази възможност е избрана и потвърдена.</li>
        </ul>
        <p>
          Обичайният срок за доставка е от 2 до 4 работни дни, когато поръчаните стоки са
          налични на склад.
        </p>
        <p>
          При липса на наличност или при други обстоятелства, които могат да доведат до
          удължаване на срока, Клиентът се уведомява своевременно.
        </p>

        <h3>5.1. Доставка до гр. Пловдив и региона</h3>
        <p>
          „Office Labs Co." предлага безплатна доставка с фирмен транспорт до гр. Пловдив и
          региона.
        </p>
        <p>
          Посочените условия се прилагат при доставка с фирмен транспорт и при наличие на
          поръчаните стоки на склад.
        </p>

        <h3>5.2. Доставка до други населени места</h3>
        <p>
          „Office Labs Co." предлага безплатна доставка с фирмен транспорт до гр. София,
          Пазарджик, Асеновград, Карлово, Казанлък, Стара Загора, Димитровград, Хасково,
          Харманли, Кърджали, Момчилград, Ямбол и други населени места, обслужвани от
          Търговеца.
        </p>
        <p>
          Възможността за доставка с фирмен транспорт до конкретен адрес зависи от
          маршрутите и районите, обслужвани от Търговеца.
        </p>
        <p>
          За Клиенти, които имат качеството на потребители, окончателният размер на
          разходите за доставка, включително приложимият ДДС, се посочва преди
          финализиране на поръчката.
        </p>

        <h3>5.4. Лично получаване</h3>
        <p>
          Клиентът може да избере лично получаване на стоката от обект на „Office Labs
          Co.", когато тази възможност се предлага за съответната поръчка.
        </p>
        <p>
          Конкретният адрес и възможното време за получаване се посочват в онлайн магазина
          или се уточняват с Клиента.
        </p>

        <h3>Повредена или грешна пратка</h3>
        <p>
          При получаване на увредена или грешна стока, моля откажете приемането и се
          свържете с нас незабавно на{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>.
          Ще организираме замяна или възстановяване на сумата без допълнителни разходи
          за вас.
        </p>
      </section>

      <section className="lgl-section" id="withdrawal">
        <h2>Право на отказ</h2>
        <div className="lgl-notice">
          Съгласно Закона за защита на потребителите и Директива 2011/83/ЕС имате право
          да се откажете от поръчката, без да посочвате причина, в срок от{' '}
          <strong>14 календарни дни</strong> от датата на получаване на стоката.
        </div>
        <h3>Как да упражните правото</h3>
        <p>
          Изпратете ни уведомление по имейл на{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a> с посочване
          на номера на поръчката, преди изтичане на 14-дневния срок. Не е необходима
          специална форма — достатъчно е ясно изявление.
        </p>
        <h3>Изключения</h3>
        <p>Правото на отказ не се прилага за:</p>
        <ul>
          <li>Стоки, изработени по индивидуална поръчка или ясно персонализирани;</li>
          <li>Стоки, които поради своето естество не могат да бъдат върнати;</li>
          <li>Стоки с нарушена оригинална опаковка, показваща следи от употреба.</li>
        </ul>
        <h3>Възстановяване на сумата</h3>
        <p>
          Ще възстановим заплатената сума, включително разходите за доставка до вас,
          в срок до <strong>14 дни</strong> от получаване на стоката обратно или от
          доказателство, че сте я изпратили. Разходите за връщане на стоката са за
          ваша сметка, освен ако стоката е дефектна или грешна.
        </p>
      </section>

      <section className="lgl-section" id="returns">
        <h2>Връщане на стоки</h2>
        <p>
          Извън законовото право на отказ приемаме връщане на стоки в срок до{' '}
          <strong>30 дни</strong> от датата на покупка при следните условия:
        </p>
        <ul>
          <li>Стоката е в оригинална опаковка и непокътнато състояние;</li>
          <li>Придружена е от касов бон или фактура;</li>
          <li>Не показва следи от употреба или механични увреждания.</li>
        </ul>
        <p>
          За организиране на връщане се свържете с нас на{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a> с номера
          на поръчката и причината за връщане.
        </p>
      </section>

      <section className="lgl-section" id="warranty">
        <h2>Гаранция</h2>
        <p>
          Всички продукти се ползват с <strong>законова гаранция от 2 години</strong>{' '}
          съгласно Закона за защита на потребителите. При производствен дефект имате
          право на безплатен ремонт, замяна или възстановяване на сумата.
        </p>
        <h3>Рекламации</h3>
        <p>
          Рекламации се приемат в срок до 2 години от датата на покупка. За подаване
          на рекламация изпратете имейл на{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a> с описание
          на дефекта и снимки. Разглеждаме рекламации в срок до 30 дни.
        </p>
        <h3>Извън обхвата на гаранцията</h3>
        <ul>
          <li>Механични увреждания вследствие на неправилна употреба;</li>
          <li>Нормално износване при редовна употреба;</li>
          <li>Увреждания от неподходящи условия на съхранение.</li>
        </ul>
      </section>

      <section className="lgl-section" id="ip">
        <h2>Интелектуална собственост</h2>
        <p>
          Всички материали на сайта — текстове, снимки, лога, дизайн, графики и
          програмен код — са собственост на OfficeLabs Co или на съответните им
          притежатели и са защитени от законодателството за авторско право и
          интелектуална собственост.
        </p>
        <p>
          Забранено е копирането, възпроизвеждането, разпространението или използването
          на каквито и да е материали от сайта без изрично писмено разрешение от нас.
          Позволено е единствено лично, нетърговско ползване.
        </p>
      </section>

      <section className="lgl-section" id="liability">
        <h2>Ограничаване на отговорността</h2>
        <p>
          Полагаме максимални усилия за точност на информацията на сайта, но не
          гарантираме, че тя е пълна, вярна или актуална по всяко време.
        </p>
        <p>
          Не носим отговорност за вреди, причинени от: временна недостъпност на сайта,
          технически проблеми извън нашия контрол, действия на трети страни (куриери,
          платежни оператори) или неправилна употреба на продуктите.
        </p>
        <p>
          В никакъв случай нашата отговорност не може да надвишава стойността на
          конкретната поръчка, по повод на която е възникнала претенцията.
        </p>
      </section>

      <section className="lgl-section" id="law">
        <h2>Приложимо право</h2>
        <p>
          Настоящите условия се уреждат от законодателството на Република България.
          Всички спорове се отнасят за разглеждане от компетентния български съд.
        </p>
        <p>
          При спорове, свързани с онлайн покупки, имате право да се обърнете към
          Комисията за защита на потребителите (КЗП) или към платформата за онлайн
          решаване на спорове на Европейската комисия:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>.
        </p>
      </section>

      <section className="lgl-section" id="contact">
        <h2>Контакти</h2>
        <p>При въпроси относно настоящите Общи условия се свържете с нас:</p>
        <ul>
          <li><strong>Имейл:</strong> <a href="mailto:info@officelabsco.com">info@officelabsco.com</a></li>
          <li><strong>Уебсайт:</strong> <a href="https://officelabsco.com">officelabsco.com</a></li>
        </ul>
      </section>

    </LegalLayout>
  );
}

const SECTIONS_EN = [
  { id: 'general',    title: 'General provisions' },
  { id: 'orders',     title: 'Orders' },
  { id: 'prices',     title: 'Prices and payment' },
  { id: 'delivery',   title: 'Delivery' },
  { id: 'withdrawal', title: 'Right of withdrawal' },
  { id: 'returns',    title: 'Returns' },
  { id: 'warranty',   title: 'Warranty' },
  { id: 'ip',         title: 'Intellectual property' },
  { id: 'liability',  title: 'Limitation of liability' },
  { id: 'law',        title: 'Governing law' },
  { id: 'contact',    title: 'Contact us' },
];

function TermsEn() {
  return (
    <LegalLayout
      title="Terms of use"
      updated="18 July 2026"
      sections={SECTIONS_EN}
      icon={
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 3L5 7.5V15c0 6.075 4.8 11.75 11 13 6.2-1.25 11-6.925 11-13V7.5L16 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M11 16l3.5 3.5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      }
    >

      <section className="lgl-section" id="general">
        <h2>General provisions</h2>
        <p>
          These terms and conditions govern the relationship between <strong>OfficeLabs Co</strong>{' '}
          (hereinafter "the Company"), the operator of the website{' '}
          <strong>officelabsco.com</strong>, and any person who accesses or uses the site.
        </p>
        <p>
          By visiting and using the site you accept these terms in full. If you do not agree with them,
          please stop using the site.
        </p>
        <p>
          The Company reserves the right to amend these terms at any time. Changes take effect from the
          moment they are published. Continuing to use the site after changes are published means that
          you accept them.
        </p>
        <h3>Access to the site</h3>
        <p>
          The site is available to persons over 18 years of age, or to minors with the explicit consent
          of a parent or guardian. By placing an order you confirm that you meet this requirement.
        </p>
      </section>

      <section className="lgl-section" id="orders">
        <h2>Orders</h2>
        <p>
          Adding an item to your cart does not reserve stock. An order is considered accepted by us once a
          confirmation email is sent.
        </p>
        <h3>Ordering process</h3>
        <ol>
          <li>Choose a product and add it to your cart.</li>
          <li>Proceed to checkout and enter your delivery details.</li>
          <li>Confirm your order.</li>
          <li>You will receive a confirmation email at the address you provided.</li>
        </ol>
        <h3>Accuracy of information</h3>
        <p>
          We make every effort to ensure that product descriptions and photos are accurate. However, we do
          not guarantee that the colours on your screen will exactly match the real product. If there is a
          significant discrepancy, you have the right to return the goods under the section "Right of
          withdrawal".
        </p>
        <h3>Cancelling an order</h3>
        <p>
          You can cancel an order within 2 hours of placing it by contacting us at{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>. Once the order has been
          dispatched, cancellation is not possible — the returns procedure applies.
        </p>
      </section>

      <section className="lgl-section" id="prices">
        <h2>Prices and payment</h2>
        <p>
          All prices on the site are in euros (€) and include applicable taxes. The Company reserves the
          right to update prices at any time. The price shown at the moment the order is confirmed applies.
        </p>
        <h3>Payment method</h3>
        <p>
          Payment is made by bank transfer against a proforma invoice, which we send once your order is
          confirmed. We do not accept cash on delivery or card payments on the website.
        </p>
        <h3>Invoicing</h3>
        <p>
          We issue an invoice on request. To issue an invoice to a company, enter the company details (UIC,
          VAT number, company representative) when placing your order.
        </p>
      </section>

      <section className="lgl-section" id="delivery">
        <h2>Delivery</h2>
        <p>
          Deliveries are made within the Republic of Bulgaria. Production and delivery take{' '}
          <strong>30 working days</strong> from order confirmation.
        </p>

        <h3>Delivery terms</h3>
        <p>Delivery of the ordered goods may be carried out:</p>
        <ul>
          <li>by the courier company SPEEDY;</li>
          <li>by the courier company CVC, for pallet shipments;</li>
          <li>with "Office Labs Co."'s own company transport;</li>
          <li>by personal collection from a location of the Trader, when this option is selected and confirmed.</li>
        </ul>
        <p>
          The usual delivery time is 2 to 4 working days, when the ordered goods are in stock.
        </p>
        <p>
          If the goods are out of stock, or other circumstances may extend this period, the Customer is
          notified in good time.
        </p>

        <h3>5.1. Delivery to Plovdiv and the surrounding region</h3>
        <p>
          "Office Labs Co." offers free delivery by company transport to Plovdiv and the surrounding region.
        </p>
        <p>
          These terms apply to deliveries made by company transport, when the ordered goods are in stock.
        </p>

        <h3>5.2. Delivery to other towns</h3>
        <p>
          "Office Labs Co." offers free delivery by company transport to Sofia, Pazardzhik, Asenovgrad,
          Karlovo, Kazanlak, Stara Zagora, Dimitrovgrad, Haskovo, Harmanli, Kardzhali, Momchilgrad, Yambol
          and other towns served by the Trader.
        </p>
        <p>
          Whether delivery by company transport is available to a specific address depends on the Trader's
          routes and service areas.
        </p>
        <p>
          For Customers acting as consumers, the final delivery cost, including applicable VAT, is shown
          before the order is finalised.
        </p>

        <h3>5.4. Personal collection</h3>
        <p>
          The Customer may choose to collect the goods in person from a location of "Office Labs Co.",
          when this option is offered for the relevant order.
        </p>
        <p>
          The specific address and the available collection time are shown in the online store, or
          arranged directly with the Customer.
        </p>

        <h3>Damaged or incorrect parcel</h3>
        <p>
          If you receive damaged or incorrect goods, please refuse acceptance and contact us immediately at{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>. We will arrange a replacement or
          a refund at no additional cost to you.
        </p>
      </section>

      <section className="lgl-section" id="withdrawal">
        <h2>Right of withdrawal</h2>
        <div className="lgl-notice">
          Under the Consumer Protection Act and Directive 2011/83/EU you have the right to withdraw from the
          order without giving a reason within <strong>14 calendar days</strong> of receiving the goods.
        </div>
        <h3>How to exercise the right</h3>
        <p>
          Send us a notice by email to <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>,
          stating your order number, before the 14-day period expires. No special form is required — a clear
          statement is sufficient.
        </p>
        <h3>Exceptions</h3>
        <p>The right of withdrawal does not apply to:</p>
        <ul>
          <li>Goods made to individual order or clearly personalised;</li>
          <li>Goods which, by their nature, cannot be returned;</li>
          <li>Goods with a broken original packaging showing signs of use.</li>
        </ul>
        <h3>Refund</h3>
        <p>
          We will refund the amount paid, including the cost of delivery to you, within <strong>14 days</strong>{' '}
          of receiving the goods back or of proof that you have sent them. The cost of returning the goods is
          for your account, unless the goods are defective or incorrect.
        </p>
      </section>

      <section className="lgl-section" id="returns">
        <h2>Returns</h2>
        <p>
          Beyond the statutory right of withdrawal, we accept returns within <strong>30 days</strong> of the
          purchase date under the following conditions:
        </p>
        <ul>
          <li>The goods are in their original packaging and undamaged;</li>
          <li>They are accompanied by a receipt or invoice;</li>
          <li>They show no signs of use or mechanical damage.</li>
        </ul>
        <p>
          To arrange a return, contact us at <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>{' '}
          with your order number and the reason for the return.
        </p>
      </section>

      <section className="lgl-section" id="warranty">
        <h2>Warranty</h2>
        <p>
          All products come with a <strong>2-year statutory warranty</strong> under the Consumer Protection Act.
          In case of a manufacturing defect you are entitled to free repair, replacement or a refund.
        </p>
        <h3>Complaints</h3>
        <p>
          Complaints are accepted within 2 years of the purchase date. To file a complaint, send an email to{' '}
          <a href="mailto:info@officelabsco.com">info@officelabsco.com</a> describing the defect and attaching
          photos. We review complaints within 30 days.
        </p>
        <h3>Outside the scope of the warranty</h3>
        <ul>
          <li>Mechanical damage resulting from improper use;</li>
          <li>Normal wear from regular use;</li>
          <li>Damage caused by unsuitable storage conditions.</li>
        </ul>
      </section>

      <section className="lgl-section" id="ip">
        <h2>Intellectual property</h2>
        <p>
          All materials on the site — texts, photos, logos, design, graphics and program code — are the
          property of OfficeLabs Co or their respective owners and are protected by copyright and intellectual
          property law.
        </p>
        <p>
          Copying, reproducing, distributing or using any material from the site without our express written
          permission is prohibited. Use is permitted for personal, non-commercial purposes only.
        </p>
      </section>

      <section className="lgl-section" id="liability">
        <h2>Limitation of liability</h2>
        <p>
          We make every effort to keep the information on the site accurate, but we do not guarantee that it
          is complete, correct or up to date at all times.
        </p>
        <p>
          We are not liable for damage caused by temporary unavailability of the site, technical problems
          outside our control, actions of third parties (couriers, payment operators) or improper use of the
          products.
        </p>
        <p>
          In no event may our liability exceed the value of the specific order giving rise to the claim.
        </p>
      </section>

      <section className="lgl-section" id="law">
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of the Republic of Bulgaria. Any disputes shall be heard by the
          competent Bulgarian court.
        </p>
        <p>
          For disputes relating to online purchases you may contact the Bulgarian Commission for Consumer
          Protection (KZP) or use the European Commission's online dispute resolution platform:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>.
        </p>
      </section>

      <section className="lgl-section" id="contact">
        <h2>Contact us</h2>
        <p>For questions about these terms, contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@officelabsco.com">info@officelabsco.com</a></li>
          <li><strong>Website:</strong> <a href="https://officelabsco.com">officelabsco.com</a></li>
        </ul>
      </section>

    </LegalLayout>
  );
}

export default async function TermsPage() {
  const en = (await getLocale()) === 'en';
  return en ? <TermsEn /> : <TermsBg />;
}
