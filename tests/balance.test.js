import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareStrategies} from '../tools/balance-audit.mjs';

test('textile-heavy legal ventures beat tin-heavy ventures after actual costs on average', () => {
  // Use full out-and-back ventures, rather than checking our markup formula.
  // The ordinary-only comparison also prevents scarce fine textiles from
  // concealing a balance problem with the regular textile market.
  for (const row of compareStrategies()) {
    assert.ok(row.ordinary > row.tin * 1.05,
      `${row.city}: ordinary textiles ${row.ordinary}, tin ${row.tin}`);
    assert.ok(row.textiles > row.tin * 1.2,
      `${row.city}: mixed textiles ${row.textiles}, tin ${row.tin}`);
  }
});
