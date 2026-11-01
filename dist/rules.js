// Editable scenario data. The starting loan has no interest.
// Tin ratios are tin shekels per silver shekel; 60 / ratio is silver per mina.
// export_markup_factors multiply each city's markup, not the whole selling price.
export const RULES = {
  "_help": "Edit the scenario here, then start a new game. Existing saves must match the current rules. Dice fields are [number_of_dice, sides]. Money is silver shekels; metal quantities are minas.",
  "title": "YATS · The Assur Caravan",
  "year": "1895 BCE",
  "starting_silver": 7200,
  "season": {
    "base_days": 196,
    "dice": [
      3,
      4
    ],
    "foot_grace_base": 21,
    "foot_grace_dice": [
      2,
      4
    ]
  },
  "finance": {
    "living_per_week": 1,
    "emergency_fee": 0.1,
    "remittance_fee": 0.03,
    "remittance_days": 21
  },
  "caravan": {
    "minimum_export_share": 0.1,
    "leader_fee": 0.05,
    "tin_shekels_per_donkey_day": 2,
    "stabling_tin_shekels": 1,
    "hotel_tin_shekels": 2,
    "donkey_weekly_mortality": 0.01,
    "hard_driving_weekly_mortality": 0.05,
    "hard_driving_speed_bonus": 0.1,
    "escort_cost_per_day": 1.25,
    "escort_loss_multiplier": 0.5,
    "escort_arrest_multiplier": 0.75,
    "incident_chance_per_day": 0.018,
    "guide_fee": 18,
    "repair_fee": 12,
    "guide_delay_days": 2,
    "repair_delay_days": 1,
    "nightly_replacement_dice": [
      1,
      2
    ]
  },
  "markets": {
    "quote_days": 7,
    "assur_resale_factor": 0.85,
    "import_purchase_factor": 1.12,
    "tin_early_ratio_base": 15,
    "tin_late_ratio_base": 14,
    "tin_ratio_dice": [
      1,
      2
    ],
    "tin_change_day_base": 25,
    "tin_change_day_spread": 3,
    "textile_base": 8,
    "textile_dice": [
      1,
      1
    ],
    "fine_textile_base": 11,
    "fine_textile_dice": [
      1,
      1
    ],
    "export_markup_factors": {
      "tin": 1,
      "textile": 2.25,
      "fine_textile": 2.5
    },
    "fine_restock_loads": 2,
    "fine_restock_dice": [
      3,
      4
    ],
    "fine_restock_days_per_roll": 7,
    "donkey_restock_days": 28,
    "donkey_stock_base": 12,
    "donkey_stock_dice": [
      1,
      4
    ],
    "donkey_assur_price_base": 20,
    "donkey_assur_price_spread": 1,
    "donkey_other_price_base": 20,
    "donkey_other_price_dice": [
      1,
      4
    ],
    "donkey_sale_base": 20,
    "donkey_sale_dice": [
      1,
      2
    ],
    "copper_ratio_base": 180,
    "copper_ratio_dice": [
      1,
      20
    ],
    "copper_markup_base": 1.0,
    "copper_markup_dice": [
      1,
      10
    ],
    "iron_offer_chance": 0.1,
    "iron_offer_minas": 1,
    "iron_purchase_limit": 2,
    "iron_silver_per_mina": 600,
    "iron_markup_base": 0.8,
    "iron_markup_dice": [
      1,
      4
    ]
  },
  "taxes": {
    "kanes_tin": 0.1,
    "kanes_textiles": 0.05,
    "purushhaddum_sales": 0.05,
    "clearance_dice": [
      1,
      3
    ]
  },
  "wool": {
    "buy_start": 90,
    "buy_end": 120,
    "sale_day": 180,
    "silver_per_mina": 0.5,
    "markup_base": 0.33,
    "markup_dice": [
      1,
      10
    ]
  },
  "wagons": {
    "small": {
      "name": "Small wagon",
      "capacity_minas": 600,
      "weekly_rent": 5
    },
    "large": {
      "name": "Large wagon",
      "capacity_minas": 1200,
      "weekly_rent": 9
    }
  },
  "goods": {
    "tin": {
      "name": "Tin",
      "unit": "mina",
      "step": 1,
      "units_per_donkey": 120,
      "description": "Buy tin in Assur and sell it in Anatolia. One donkey carries 120 minas."
    },
    "textile": {
      "name": "Textiles",
      "unit": "piece",
      "step": 1,
      "units_per_donkey": 30,
      "description": "Ordinary textiles. Exports from Assur must include both tin and textiles."
    },
    "fine_textile": {
      "name": "Fine textiles",
      "unit": "piece",
      "step": 1,
      "units_per_donkey": 30,
      "description": "Fine textiles are available only in Assur. Supply is limited and replenished in batches."
    },
    "copper": {
      "name": "Copper",
      "unit": "mina",
      "step": 1,
      "units_per_donkey": 120,
      "description": "Buy copper in Durhumit and sell it in Purušhaddum. Rent a wagon to carry larger quantities."
    },
    "iron": {
      "name": "Iron",
      "unit": "mina",
      "step": 1,
      "units_per_donkey": 120,
      "description": "Occasionally offered at the Euphrates crossing. You may buy iron at most twice per season. It may travel only on Smuggler’s Track."
    }
  },
  "cities": {
    "assur": {
      "name": "Assur",
      "subtitle": "On the Tigris",
      "description": "Buy donkeys, tin, and textiles here. Keep enough silver to pay travel costs and customs.",
      "markup_base": 0,
      "markup_dice": [
        1,
        1
      ],
      "map": [
        0.874,
        0.832
      ],
      "report": "Tin and textiles are available here. Tin prices usually rise after the early supply changes. Keep silver for travel costs."
    },
    "euphrates": {
      "name": "Euphrates crossing",
      "subtitle": "The river crossing",
      "description": "Sell your goods here, continue to Kaneš, or take Smuggler’s Track to Durhumit. The track carries a risk of arrest.",
      "markup_base": 0.4,
      "markup_dice": [
        1,
        12
      ],
      "map": [
        0.597,
        0.711
      ],
      "report": "Selling here takes less travel time but usually earns less than selling farther inland."
    },
    "kanes": {
      "name": "Kaneš",
      "subtitle": "Market and customs",
      "description": "Imported tin and textiles must clear customs on arrival. Sell here or continue to Durhumit or Purušhaddum.",
      "markup_base": 1.0,
      "markup_dice": [
        1,
        20
      ],
      "map": [
        0.412,
        0.464
      ],
      "report": "Tin and textiles usually sell for more than at the Euphrates crossing. Allow for customs charges and clearance time."
    },
    "durhumit": {
      "name": "Durhumit",
      "subtitle": "The copper market",
      "description": "Sell imported goods, buy copper, and hire a wagon for the direct road to Purušhaddum.",
      "markup_base": 1.5,
      "markup_dice": [
        1,
        20
      ],
      "map": [
        0.396,
        0.218
      ],
      "report": "Imported goods usually sell for more than in Kaneš. Copper is available here for sale in Purušhaddum."
    },
    "purushhaddum": {
      "name": "Purušhaddum",
      "subtitle": "The western market",
      "description": "Sell imported goods and copper here. Wool contracts are available during days 90–120. Commodity sales are taxed.",
      "markup_base": 2.0,
      "markup_dice": [
        2,
        12
      ],
      "map": [
        0.152,
        0.464
      ],
      "report": "Imported goods usually sell for the highest prices here. Sales tax and the long journey reduce the return. Wool contracts are available on days 90–120."
    }
  },
  "routes": [
    {
      "id": "assur_crossing",
      "a": "assur",
      "b": "euphrates",
      "name": "The western road",
      "days_base": 14,
      "days_dice": [
        1,
        2
      ],
      "days_signed": false,
      "loss_chance": 0.03,
      "toll": 0.05,
      "smuggling": false,
      "risk": "Exposed",
      "description": "This road crosses the Euphrates. Tolls and attacks can reduce your profit."
    },
    {
      "id": "crossing_kanes",
      "a": "euphrates",
      "b": "kanes",
      "name": "The mountain road",
      "days_base": 21,
      "days_dice": [
        1,
        6
      ],
      "days_signed": false,
      "loss_chance": 0.07,
      "toll": 0.05,
      "smuggling": false,
      "risk": "Dangerous",
      "description": "The most dangerous legal road. Unsealed imports require customs clearance when they arrive in Kaneš."
    },
    {
      "id": "kanes_durhumit",
      "a": "kanes",
      "b": "durhumit",
      "name": "The northern road",
      "days_base": 21,
      "days_dice": [
        1,
        4
      ],
      "days_signed": false,
      "loss_chance": 0.01,
      "toll": 0,
      "smuggling": false,
      "risk": "Relatively sheltered",
      "description": "A legal road between Kaneš and Durhumit."
    },
    {
      "id": "kanes_purushhaddum",
      "a": "kanes",
      "b": "purushhaddum",
      "name": "The western uplands",
      "days_base": 28,
      "days_dice": [
        1,
        8
      ],
      "days_signed": false,
      "loss_chance": 0.01,
      "toll": 0,
      "smuggling": false,
      "risk": "Relatively sheltered",
      "description": "A legal road between Kaneš and Purušhaddum."
    },
    {
      "id": "durhumit_purushhaddum",
      "a": "durhumit",
      "b": "purushhaddum",
      "name": "The copper road",
      "days_base": 35,
      "days_dice": [
        1,
        6
      ],
      "days_signed": true,
      "loss_chance": 0.01,
      "toll": 0,
      "smuggling": false,
      "risk": "Relatively sheltered",
      "description": "Rented copper wagons may use only this road."
    },
    {
      "id": "smugglers_track",
      "a": "euphrates",
      "b": "durhumit",
      "name": "Smuggler’s Track",
      "days_base": 30,
      "days_dice": [
        2,
        4
      ],
      "days_signed": false,
      "loss_chance": 0.09,
      "toll": 0.02,
      "smuggling": true,
      "arrest_dice": [
        6,
        6
      ],
      "risk": "Severe · arrest possible",
      "description": "Bypasses Kaneš and its customs. A patrol can arrest you and end the game."
    }
  ],
  "version": "2.3.0",
  "scenario_id": "YATS-WEB-2.3.0"
};
