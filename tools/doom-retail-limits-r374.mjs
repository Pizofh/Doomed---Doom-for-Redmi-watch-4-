// SPDX-License-Identifier: GPL-2.0-only
// Chosen only from a factory-branded retail plan, never from user options.
export function retailPlan(plan){return plan?.kind==='review-ultimate-r374-manual'||plan?.kind==='review-packed-r378-manual'||plan?.kind==='synthetic-retail-r374';}
export function uploadLimits(plan){return retailPlan(plan)?
 Object.freeze({parts:6600,wireBytes:13400000,uploadMs:1200000}):
 Object.freeze({parts:4096,wireBytes:4900000,uploadMs:600000});}
