# Price balance in website release 2.3.0

## Research basis

Cécile Michel, “The Old Assyrian Trade in the light of Recent Kültepe
Archives,” *Journal of the Canadian Society for Mesopotamian Studies* 3
(2008), 71–82, describes tin selling in Anatolia at about twice its purchase
price and common textiles in Kaneš at about three times theirs. These are
gross sale multiples; transport, customs, losses, and other expenses reduce
the merchant's net profit.

Record: <https://shs.hal.science/halshs-00642827>

Cécile Michel and Klaas R. Veenhof, “The Textiles Traded by the Assyrians in
Anatolia (19th–18th centuries BC),” in *Textile Terminologies in the Ancient
Near East and Mediterranean from the Third to the First Millennia BC*
(2010), 210–271, documents considerable variation by type and quality.
There is no single historical textile price that represents all grades.

Record: <https://shs.hal.science/halshs-01186436>

The accessible text of these research publications was consulted through
mirrors of their author-deposited HAL versions. The game uses the relative
advantage of textiles as a design guide. Its exact price ranges, further-inland
premiums, restocking, iron limit and market calendar are classroom choices.
They are not claimed as prices or institutions attested in those cities in
1895 BCE. A higher margin on textiles also does not establish that textiles
provided most of every historical merchant's total profits; shipment quantities
and costs matter.

## What changed

Previously, all three export goods shared the same city percentage markup.
Tin also received a large seasonal price rise. With equal transport capacity,
tin-heavy consignments could earn substantially more than textile-heavy ones.

The editable scenario now gives ordinary and fine textiles larger typical
markups. At the central Kaneš markup, before weekly fluctuations and customs,
the sale multiples are 2.00 for tin, 3.25 for ordinary textiles and 3.50 for
fine textiles. Starting textile price centers are 8 and 11 silver per piece;
weekly variation remains. Tin's early ratio center is 15 shekels of tin per
silver shekel, changing to 14 later, instead of the former change from 12 to 9.
These settings allow textiles to carry more of the profit while retaining
price uncertainty and a reason to carry both exports. Fine textiles remain
limited in supply.

## Reproducible comparison

`npm run audit` compares tin-heavy, ordinary-textile-heavy and mixed-textile-heavy
legal consignments. Each uses six donkeys, the 7,200-silver starting loan,
the minimum share of the secondary export and a reserve for expenses. The
textile mix uses available fine textiles before ordinary pieces. Unspent silver
stays in the purse. Each caravan sells its goods and animals at the destination,
returns on foot and closes its accounts in Assur.

Mean final profit in silver, over 200 seeds per strategy and destination:

| Destination | Tin-heavy | Ordinary textiles | Ordinary and fine textiles |
| --- | ---: | ---: | ---: |
| Euphrates crossing | 908 | 1,118 | 1,305 |
| Kaneš | 2,281 | 2,613 | 3,132 |
| Durhumit | 3,762 | 4,212 | 4,993 |
| Purušhaddum | 4,972 | 5,432 | 6,423 |

These are controlled game comparisons, not historical estimates. Prices and
journey lengths vary. The audit disables attacks, incidents and animal deaths
to measure the price balance, while retaining actual daily bills, taxes and
customs. It does not establish the best strategy in every season or compare
all possible sequences of trades. Normal play retains those risks.
