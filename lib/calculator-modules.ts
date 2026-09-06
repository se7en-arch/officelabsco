// Shared between the server (app/calculator/page.tsx) and the client fallback
// path (components/calculator/CostCalculator.tsx) so "which module belongs to
// which product/color" is decided in exactly one place.

export type ModuleSeed = {
  productId: number; name: string; seriesName: string; categoryName: string; colorName?: string;
};

type ModuleRowLike = {
  id: string; name: string;
  qty?: Record<string, number>;
  materials?: Record<string, { portion: 'whole' | 'half'; qty: number }>;
  productId?: number; colorName?: string; seriesName?: string; categoryName?: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Makes sure every seed (one per product, or one per color variant for
 * multi-color products) has a matching module row, without ever discarding
 * data the user already entered:
 *  - exact productId+color match -> kept as-is
 *  - a leftover module for the same product with no color tag yet -> claimed
 *    for the first still-unmatched color (so any qty/materials already on it
 *    survive the product being split into color variants)
 *  - otherwise a fresh empty module is created
 * Modules that don't belong to any current seed (manual entries, or a
 * product that's since been archived) are preserved untouched.
 */
export function reconcileModules<T extends ModuleRowLike>(
  existing: T[],
  seeds: ModuleSeed[],
): { modules: T[]; changed: boolean } {
  const byProduct = new Map<number, T[]>();
  for (const m of existing) {
    if (m.productId != null) {
      const arr = byProduct.get(m.productId) ?? [];
      arr.push(m);
      byProduct.set(m.productId, arr);
    }
  }
  const consumed = new Set<T>();
  const result: T[] = [];
  let changed = false;

  for (const seed of seeds) {
    const pool = byProduct.get(seed.productId) ?? [];
    let match = pool.find(m => !consumed.has(m) && (m.colorName ?? undefined) === seed.colorName);
    if (!match && seed.colorName) {
      match = pool.find(m => !consumed.has(m) && m.colorName == null);
    }
    if (match) {
      consumed.add(match);
      // Only rewrite name/series/category the one time a still-generic module gets
      // promoted into a color variant (so the newly-split pair reads consistently).
      // Once a module already carries the right colorName, never touch it again —
      // that's the only way a user's own rename of the module survives future loads.
      const isFirstTimeColorClaim = match.colorName == null && seed.colorName != null;
      if (isFirstTimeColorClaim) {
        changed = true;
        result.push({ ...match, colorName: seed.colorName, name: seed.name, seriesName: seed.seriesName, categoryName: seed.categoryName });
      } else {
        result.push(match);
      }
    } else {
      changed = true;
      result.push({
        id: uid(), productId: seed.productId, colorName: seed.colorName,
        name: seed.name, seriesName: seed.seriesName, categoryName: seed.categoryName,
        qty: {}, materials: {},
      } as unknown as T);
    }
  }

  for (const m of existing) {
    if (!consumed.has(m)) result.push(m);
  }

  return { modules: result, changed };
}

export function buildModuleSeeds(
  products: { id: number; name: string; slug: string; seriesName: string; categoryName: string }[],
  colorVariants: Record<string, { name: string }[]>,
): ModuleSeed[] {
  const seeds: ModuleSeed[] = [];
  for (const p of products) {
    const variants = colorVariants[p.slug];
    if (variants && variants.length > 0) {
      for (const v of variants) {
        seeds.push({ productId: p.id, name: `${p.name} — ${v.name}`, seriesName: p.seriesName, categoryName: p.categoryName, colorName: v.name });
      }
    } else {
      seeds.push({ productId: p.id, name: p.name, seriesName: p.seriesName, categoryName: p.categoryName });
    }
  }
  return seeds;
}
