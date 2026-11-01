// Player instructions shared by How to play and the Guide tab.
export const GUIDE = [
  [
    "The objective",
    "The game covers one trading year, starting in Assur in 1895 BCE. You receive an interest-free loan of 7,200 shekels of silver. Buy goods, transport them to other markets, and maximize your profit in Assur at the end of the year. The starting loan must be repaid or deducted from your final assets. Each player or team plays a separate game. If you are arrested, you lose regardless of your profit."
  ],
  [
    "The calendar",
    "The game shows two deadlines: the last day for caravans to arrive and the day of final accounting. Buying, selling, reading, and planning take no days. Only traveling and waiting advance the day. A caravan can depart only if the longest expected journey at the selected pace fits before caravan closure. After closure, you may travel until final accounting only if you carry no goods and own no animals or wagon. You may still carry silver."
  ],
  [
    "Silver and cargo",
    "All prices and balances are in shekels of silver. One talent is 60 minas, and one mina is 60 shekels of weight. Metal quantities are measured in minas; textiles are counted by piece. Buy donkeys before buying cargo. Each donkey carries 120 minas of metal or 30 pieces of textiles. Mixed loads share this capacity proportionally. Silver has no carrying limit. If an animal dies in town, reduce your cargo or buy another donkey before leaving. You cannot buy animals during a journey that uses the extra period for travel on foot."
  ],
  [
    "Exports from Assur",
    "If you leave Assur with tin or textiles, you must carry both. Tin and textiles must each make up at least one tenth of their combined current value in Assur. Ordinary and fine textiles count together for this requirement. The market shows the two shares. You may also leave without cargo."
  ],
  [
    "Market prices and supply",
    "The Market tab shows prices in your current town. Buy is the price you pay; Sell net is what you receive after any local sales tax. Prices are updated weekly and when the early tin supply changes. Reopening a screen does not change the prices. Displayed unit prices are rounded; transaction totals use full precision. Tin and ordinary textiles have unlimited supply. Fine textiles and donkeys in Assur have limited stock that is replenished periodically. Textiles usually offer a higher return than tin, particularly fine textiles. Tin remains useful as part of a mixed cargo. Later in the trading season, tin generally costs a little more silver. Local dealers usually pay less to buy goods back than they charge to sell them."
  ],
  [
    "Choosing a market",
    "The Euphrates crossing is the shortest journey from Assur, but its prices are usually lower than those farther inland. Kaneš offers higher prices but charges customs on imported tin and textiles. Durhumit usually offers still higher prices and sells copper. Purušhaddum usually offers the highest prices for imported goods, but it is farther away and taxes commodity sales. Compare the possible return with travel time, costs, and the time needed to send silver back to Assur. Future prices are uncertain."
  ],
  [
    "Routes and risks",
    "All roads can be traveled in either direction. The Assur–Euphrates road is relatively short and less dangerous than the mountain road to Kaneš. The other legal roads are safer but still carry a risk of loss. The direct copper road between Durhumit and Purušhaddum is long, and its travel time varies. Smuggler’s Track connects the Euphrates crossing directly to Durhumit. It avoids Kaneš and its customs but has a greater risk of attack and can lead to arrest. Travel times are uncertain when you plan. Once you depart, the game shows the planned duration. Delays can add days."
  ],
  [
    "Pace and escorts",
    "Normal pace is easier on the animals. Driving hard reduces caravan travel time but increases the risk of animal deaths. It does not make travel on foot faster. An escort has a daily cost and reduces the risk of attack and arrest. It does not prevent every loss or reduce animal deaths. The journey screen shows the escort charge and estimated daily costs before departure."
  ],
  [
    "Travel costs",
    "Departure fees include payment to the caravan leader when leaving Assur and any road toll. These fees use the recorded purchase cost of your cargo. Daily bills cover food, drivers, stabling, lodging, living costs, and any escort or wagon rent. Charges stated in tin are converted to silver using the current tin price in Assur; your carried tin is not consumed. Living costs and wagon rent continue while you wait in town."
  ],
  [
    "Animal losses and road decisions",
    "Animals can die in town or during travel. At a roadside lodging you may buy available replacement donkeys or sell spare animals, provided you keep enough capacity for your cargo. If the caravan becomes overloaded, buy replacements or abandon cargo. The game discards the cargo with the lowest value per donkey load first; copper within a wagon’s capacity is protected. Repairs or a damaged crossing may require you to pay for help or spend extra days. A delay that would exceed the travel deadline is not allowed."
  ],
  [
    "Cargo loss and arrest",
    "An attack can cause a total loss of your cargo, donkeys, and any wagon. You keep your purse and continue on foot. Silver in your Assur account, remittances, and wool held by an agent are unaffected. A traveler without cargo or transport has no consignment to lose. On Smuggler’s Track, a patrol can arrest you even if you are traveling on foot. Arrest ends the game as a loss."
  ],
  [
    "Customs and sales tax",
    "When you arrive in Kaneš, uncleared tin and textiles pay customs based on their current local selling value. The charge is higher for tin than for textiles. Clearance time is included in the planned journey. Cleared goods keep their seals on later visits. Goods bought in Kaneš are already cleared; goods bought elsewhere are not. A partial sale removes cleared and uncleared quantities proportionally. Purušhaddum taxes commodity sales, including copper and wool sold by agents. Donkey sales are exempt. Market selling prices already include the deduction for sales tax."
  ],
  [
    "Copper and wagons",
    "Copper is available in Durhumit and sells for more in Purušhaddum. A small wagon carries 600 minas of copper and costs 5 silver per week. A large wagon carries 1,200 minas and costs 9 silver per week. You may rent one wagon in Durhumit. It carries copper only and can travel only on the direct road between Durhumit and Purušhaddum. Rent is charged daily, including days spent in town. There is no deposit or minimum rental period. You may release the wagon in either town once the remaining cargo fits your other transport."
  ],
  [
    "Iron",
    "A trader at the Euphrates crossing occasionally offers a small quantity of iron. You can sell it at a higher price in Durhumit, but it may travel only on Smuggler’s Track. Sell or discard it before taking a legal road. You may buy iron at most twice during the entire trading season. Each successful purchase counts, even if you later sell, discard, or lose the iron. Declining an offer does not use your allowance. Each visit to the crossing produces at most one offer; waiting or reopening the market does not create another. There is one patrol check per journey on Smuggler’s Track, with no additional check for carrying iron."
  ],
  [
    "Wool contracts",
    "While in Purušhaddum on days 90–120, you may buy a wool contract at 0.50 silver per mina. An agent stores it without using caravan capacity or charging storage rent. On day 180, the agent sells it at an uncertain premium, deducts the sales tax and transfer fee, and sends the proceeds to Assur. The silver arrives on day 201. You do not need to remain in Purušhaddum. If you end the game before the proceeds arrive, they do not count toward your profit."
  ],
  [
    "Sending silver to Assur",
    "In a foreign town, use Agents to send silver from your purse to Assur. The fee is 3%, and delivery takes 21 days. The remaining silver is credited automatically to your Assur account. A transfer cannot be ordered if it would arrive after final accounting. In Assur, you may deposit or withdraw silver directly and repay debt. Your Assur account can pay your bills directly only while you are in Assur and not traveling."
  ],
  [
    "Keeping enough silver",
    "Keep silver in your purse for travel costs, customs, and replacement animals. If a necessary bill exceeds your available local funds, the unpaid amount becomes emergency debt with a one-time 10% handling fee. You cannot use this credit for voluntary purchases or investments. Repayments in Assur pay emergency debt first, then the starting loan."
  ],
  [
    "Final profit",
    "Your score is the profit secured in Assur at final accounting. Count the silver in your Assur account. If you are in Assur and not traveling, also count your purse, goods with local buyers, and donkeys at current Assur selling prices. Subtract the unpaid starting loan and any emergency debt. Loan amounts already repaid are not deducted again. Silver and goods abroad, unsold wool, unmarketable cargo, and transfers that have not arrived do not count. You may finish abroad if you have already sent silver to Assur. You can end the game early with Close books; otherwise it ends automatically on the final accounting day."
  ],
  [
    "Saving and classroom play",
    "The game saves after each successful action when browser storage is available. Use Save to download a backup or move your game to another device, then use Import to continue. Saves do not synchronize automatically across devices and can be erased by browser settings. Use one active tab per game. Export the final report for your referee to compare profits. The map shows relative locations and routes; it is not to scale. Save files and the game’s source code can be inspected."
  ]
];

export const ROAD_REPORTS = {
  "assur_crossing": "The shortest road in the network.",
  "crossing_kanes": "A longer mountain journey. Imports clear customs on arrival in Kaneš.",
  "kanes_durhumit": "A legal road between Kaneš and the copper market at Durhumit.",
  "kanes_purushhaddum": "A westward road between Kaneš and Purušhaddum.",
  "durhumit_purushhaddum": "A long road with variable travel time. Rented copper wagons use this route.",
  "smugglers_track": "A direct route between the Euphrates crossing and Durhumit, with a risk of arrest."
};
