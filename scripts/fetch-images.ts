/**
 * Fetches one freely-licensed product photo per item from Wikimedia Commons
 * (no API key — just a descriptive User-Agent) and writes:
 *   - client/public/products/<id>.<ext>   (the downloaded photo, ~800px wide)
 *   - data/products.json                 (imageUrl + imageCredit per product)
 *   - client/src/lib/iconicProductImages.ts (imageUrl + imageCredit per iconic product)
 *   - client/public/products/CREDITS.md  (attribution table)
 *
 * Run from the repo root: npx tsx scripts/fetch-images.ts
 *
 * Never fabricates an image or a credit: if no free-licensed, on-topic photo
 * is found after trying every query, the product is left without an
 * imageUrl and the UI falls back to its neutral icon placeholder.
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ICONIC_PRODUCTS } from "../client/src/lib/iconicProducts.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_JSON = path.join(ROOT, "data/products.json");
const IMAGES_DIR = path.join(ROOT, "client/public/products");
const CREDITS_PATH = path.join(IMAGES_DIR, "CREDITS.md");
const ICONIC_IMAGES_PATH = path.join(ROOT, "client/src/lib/iconicProductImages.ts");

const USER_AGENT = "BorderlessHackathon/1.0 (student project)";
const API = "https://commons.wikimedia.org/w/api.php";

interface ImageCredit {
  author: string;
  licenseName: string;
  licenseUrl: string;
  sourceUrl: string;
}

interface FetchResult {
  id: string;
  title: string;
  status: "found" | "placeholder";
  licenseName?: string;
  imagePath?: string;
  imageCredit?: ImageCredit;
  queryUsed?: string;
}

/** Query terms per product id, tried in order until one yields a usable
 * photo. Hand-written rather than derived from the title, since Commons
 * search quality is much better with plain product-type nouns than with
 * marketing adjectives ("Oversized", "Designer Style", "Preloved", ...). */
const QUERY_OVERRIDES: Record<string, string[]> = {
  "tb-001": ["linen shirt"],
  "tb-002": ["oak side table", "wooden side table"],
  "tb-003": ["ceramic dinnerware set", "ceramic dinner plates"],
  "tb-004": ["cream linen shirt folded", "white linen shirt folded", "linen shirt product photo"],
  "tb-005": ["dress shirt on hanger", "button down shirt rack", "striped linen shirt"],
  "tb-006": ["rattan chair"],
  "rk-001": ["upholstered accent chair", "armchair"],
  "rk-002": ["linen shirt"],
  "rk-003": ["wood tv stand", "wooden media console"],
  "rk-004": ["ceramic tea set", "japanese tea set"],
  "rk-005": ["denim jacket"],
  "rk-006": ["Chinese paper lampshade", "paper lantern lampshade", "washi paper lantern lamp"],
  "rk-007": ["ceramic teapot"],
  "rk-008": ["kimono jacket", "japanese kimono"],
  "cp-001": ["green velvet armchair", "moss green armchair", "green accent chair"],
  "cp-002": ["bouclé armchair", "lounge chair"],
  "cp-003": ["cotton hoodie"],
  "nv-001": ["white ceramic vase modern", "minimalist ceramic vase", "modern ceramic vase"],
  "nv-002": ["stoneware bowls", "ceramic bowls"],
  "nv-003": ["puffer jacket"],
  "fk-001": ["block print cotton dress", "cotton dress"],
  "fk-002": ["teak bookshelf", "wooden bookshelf"],
  "fk-003": ["jute area rug", "natural fiber rug", "jute rug flatlay"],
  "fk-004": ["linen shirt"],
  "fk-005": ["brass candle holder"],
  "ml-001": ["wool blanket folded", "plaid wool blanket", "wool blanket"],
  "ml-002": ["leather club chair", "leather armchair"],
  "ml-003": ["alpaca wool sweater", "wool sweater"],
  "ml-004": ["terracotta planter", "terracotta flower pot"],
  "ml-005": ["linen table runner"],
  "vt-001": ["denim jacket"],
  "vt-002": ["wool coat"],
  "vt-003": ["leather messenger bag", "leather satchel handbag", "vintage leather bag"],
  "vt-004": ["linen dress"],
  "vt-005": ["wooden stool"],
  "vt-006": ["linen shirt"],
  "iconic-indomie": ["Indomie Mi Goreng", "instant fried noodles package"],
  "iconic-shin-ramyun": ["Shin Ramyun", "Nongshim ramyun"],
  "iconic-kewpie": ["Kewpie mayonnaise bottle", "Kewpie mayonnaise"],
  "iconic-yerba-mate": ["yerba mate gourd", "yerba mate"],
  "iconic-linen": ["linen bedding", "linen bed sheets"],
  "iconic-saree": ["Banarasi saree", "silk saree"],
  "iconic-tea-set": ["chinese tableware teacup teapot", "blue and white porcelain tea set", "Jingdezhen porcelain"],
  "iconic-sheet-mask": ["sheet mask skincare", "korean sheet mask"],
};

const BANNED_KEYWORDS =
  /logo|diagram|map(?!le)|flag of|icon set|screenshot|chart|graph|advertisement|watermark|banner|poster|coat of arms/i;
const CROWD_KEYWORDS = /crowd|parade|festival crowd|ceremony|wedding party|protest|rally|group photo|audience/i;
/** Excludes artwork/archive scans that satisfy the license/mime/aspect
 * filters but aren't a photo of the product itself (e.g. a portrait
 * painting matched for a "shirt" query). */
const ARTWORK_KEYWORDS =
  /\bportrait\b|\bpainting\b|oil on canvas|\bengraving\b|\betching\b|\blithograph\b|watercolou?r|\bfresco\b|\bsculpture\b|\bstatue\b|\bdrawing\b|\billustration\b|\bmuseum\b|archaeological|millennium BC|\bmosque\b|gas mask|\bsoldiers?\b|\bmilitary\b|\bregiment\b|\bbattalion\b|casualties|war memorial|\bheadquarters\b/i;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGet(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params }).toString()}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 429 || res.status === 503) {
      const waitMs = 2000 * 2 ** attempt;
      console.error(`  rate limited (${res.status}), waiting ${waitMs}ms before retry...`);
      await sleep(waitMs);
      continue;
    }
    if (!res.ok) throw new Error(`Commons API ${res.status} for ${url}`);
    return res.json();
  }
  throw new Error(`Commons API still rate-limited after retries: ${url}`);
}

async function searchCommons(query: string): Promise<string[]> {
  const data = await apiGet({
    action: "query",
    list: "search",
    srsearch: query,
    srnamespace: "6",
    srlimit: "12",
  });
  return (data?.query?.search ?? []).map((r: { title: string }) => r.title);
}

interface ImageInfoEntry {
  title: string;
  url: string;
  thumburl?: string;
  width: number;
  height: number;
  mime: string;
  licenseShortName?: string;
  licenseUrl?: string;
  author?: string;
  descriptionUrl: string;
}

async function getImageInfo(titles: string[]): Promise<ImageInfoEntry[]> {
  if (titles.length === 0) return [];
  const data = await apiGet({
    action: "query",
    titles: titles.join("|"),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "800",
  });
  const pages = data?.query?.pages ?? {};
  const entries: ImageInfoEntry[] = [];
  for (const page of Object.values(pages) as any[]) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata ?? {};
    entries.push({
      title: page.title,
      url: info.url,
      thumburl: info.thumburl,
      width: info.width,
      height: info.height,
      mime: info.mime,
      licenseShortName: meta.LicenseShortName?.value,
      licenseUrl: meta.LicenseUrl?.value,
      author: meta.Artist?.value,
      descriptionUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
    });
  }
  // Preserve the search's relevance order.
  return titles.map((t) => entries.find((e) => e.title === t)).filter((e): e is ImageInfoEntry => !!e);
}

const FREE_LICENSE = /^(CC0|CC[- ]BY(?:[- ]SA)?|Public domain|PD)/i;

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function passesFilters(entry: ImageInfoEntry): boolean {
  if (!entry.thumburl) return false;
  if (!["image/jpeg", "image/png"].includes(entry.mime)) return false; // no SVG logos/diagrams
  if (!entry.licenseShortName || !FREE_LICENSE.test(entry.licenseShortName)) return false;
  if (BANNED_KEYWORDS.test(entry.title)) return false;
  if (CROWD_KEYWORDS.test(entry.title)) return false;
  if (ARTWORK_KEYWORDS.test(entry.title)) return false;
  if (!entry.width || !entry.height) return false;
  const ratio = entry.width / entry.height;
  if (ratio < 0.55 || ratio > 2.2) return false; // skip extreme portrait/panorama shots
  return true;
}

async function downloadImage(url: string): Promise<{ bytes: Buffer; ext: string }> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Image download ${res.status} for ${url}`);
  const contentType = res.headers.get("content-type") ?? "";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const bytes = Buffer.from(await res.arrayBuffer());
  return { bytes, ext };
}

async function fetchOneImage(id: string, title: string): Promise<FetchResult> {
  const queries = QUERY_OVERRIDES[id] ?? [title];

  for (const query of queries) {
    let titles: string[] = [];
    try {
      titles = await searchCommons(query);
    } catch (err) {
      console.error(`  search failed for "${query}":`, (err as Error).message);
      continue;
    }
    await sleep(600);

    let entries: ImageInfoEntry[] = [];
    try {
      entries = await getImageInfo(titles);
    } catch (err) {
      console.error(`  imageinfo failed for "${query}":`, (err as Error).message);
      continue;
    }
    await sleep(600);

    const match = entries.find(passesFilters);
    if (!match) continue;

    try {
      const { bytes, ext } = await downloadImage(match.thumburl!);
      const fileName = `${id}.${ext}`;
      await writeFile(path.join(IMAGES_DIR, fileName), bytes);

      const credit: ImageCredit = {
        author: match.author ? stripHtml(match.author) : "Unknown (Wikimedia Commons)",
        licenseName: match.licenseShortName!,
        licenseUrl: match.licenseUrl || "https://creativecommons.org/",
        sourceUrl: match.descriptionUrl,
      };

      return {
        id,
        title,
        status: "found",
        licenseName: credit.licenseName,
        imagePath: `/products/${fileName}`,
        imageCredit: credit,
        queryUsed: query,
      };
    } catch (err) {
      console.error(`  download failed for ${match.title}:`, (err as Error).message);
      continue;
    }
  }

  return { id, title, status: "placeholder" };
}

/** Product ids passed as CLI args are re-fetched even if they already have
 * an image, e.g. `npx tsx scripts/fetch-images.ts tb-004 rk-006` — used to
 * correct a specific wrong match without re-rolling everything else. */
const FORCE_IDS = new Set(process.argv.slice(2));

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });

  const productsData = JSON.parse(await (await import("fs/promises")).readFile(PRODUCTS_JSON, "utf-8"));
  const mainProducts: { id: string; title: string; imageUrl?: string; imageCredit?: ImageCredit }[] =
    productsData.products;
  const iconicProducts = ICONIC_PRODUCTS.map((p) => ({ id: p.id, title: p.productName }));

  // Resumable: skip products that already have a successful fetch from a
  // prior run (Commons rate-limits aggressively, so re-running to pick up
  // stragglers is the normal workflow — never re-download what we already
  // have).
  let existingIconicImages: Record<string, { imageUrl: string; imageCredit: ImageCredit }> = {};
  try {
    const mod = await import(ICONIC_IMAGES_PATH);
    existingIconicImages = mod.ICONIC_PRODUCT_IMAGES ?? {};
  } catch {
    existingIconicImages = {};
  }

  const allTargets = [...mainProducts, ...iconicProducts];
  const results: FetchResult[] = [];

  for (const target of allTargets) {
    const existing =
      "imageUrl" in target && target.imageUrl && target.imageCredit
        ? { imageUrl: target.imageUrl, imageCredit: target.imageCredit }
        : existingIconicImages[target.id];

    if (existing && !FORCE_IDS.has(target.id)) {
      console.log(`Skipping ${target.id} (${target.title}) — already fetched.`);
      results.push({
        id: target.id,
        title: target.title,
        status: "found",
        licenseName: existing.imageCredit.licenseName,
        imagePath: existing.imageUrl,
        imageCredit: existing.imageCredit,
      });
      continue;
    }

    console.log(`Fetching image for ${target.id} (${target.title})...`);
    const result = await fetchOneImage(target.id, target.title);
    results.push(result);
    console.log(`  -> ${result.status}${result.queryUsed ? ` via "${result.queryUsed}"` : ""}`);
  }

  // Merge results back into data/products.json for main products.
  const resultById = new Map(results.map((r) => [r.id, r]));
  for (const product of productsData.products) {
    const result = resultById.get(product.id);
    if (result?.status === "found") {
      product.imageUrl = result.imagePath;
      product.imageCredit = result.imageCredit;
    }
  }
  await writeFile(PRODUCTS_JSON, JSON.stringify(productsData, null, 2) + "\n");

  // Write iconic product images as a separate generated lookup module,
  // since ICONIC_PRODUCTS is a hand-authored TS array, not JSON.
  const iconicEntries = results
    .filter((r) => r.id.startsWith("iconic-") && r.status === "found")
    .map((r) => [r.id, { imageUrl: r.imagePath, imageCredit: r.imageCredit }] as const);
  const iconicModule = `/** Generated by scripts/fetch-images.ts — do not hand-edit.
 * Wikimedia Commons photo credits for ICONIC_PRODUCTS, keyed by id. */
import type { ImageCredit } from "@shared/types";

export const ICONIC_PRODUCT_IMAGES: Record<string, { imageUrl: string; imageCredit: ImageCredit }> = ${JSON.stringify(
    Object.fromEntries(iconicEntries),
    null,
    2
  )};
`;
  await writeFile(ICONIC_IMAGES_PATH, iconicModule);

  // Write the credits table.
  const lines = [
    "# Product photo credits",
    "",
    "Illustrative photos only — never the seller's own listing photos. Sourced from Wikimedia Commons under free licences, fetched by `scripts/fetch-images.ts`.",
    "",
    "| Product | File | Author | Licence | Source |",
    "| --- | --- | --- | --- | --- |",
    ...results
      .filter((r) => r.status === "found")
      .map(
        (r) =>
          `| ${r.title} | ${r.imagePath} | ${r.imageCredit!.author} | [${r.imageCredit!.licenseName}](${r.imageCredit!.licenseUrl}) | [source](${r.imageCredit!.sourceUrl}) |`
      ),
    "",
    "## No suitable free-licensed photo found (placeholder icon shown instead)",
    "",
    ...results.filter((r) => r.status === "placeholder").map((r) => `- ${r.title} (${r.id})`),
    "",
  ];
  await writeFile(CREDITS_PATH, lines.join("\n"));

  // Console summary table.
  console.log("\n--- Summary ---");
  const found = results.filter((r) => r.status === "found").length;
  console.log(`${found}/${results.length} products got a photo.\n`);
  console.log(
    results
      .map((r) => `${r.id.padEnd(16)} ${r.status === "found" ? "found    " : "placeholder"} ${r.licenseName ?? ""} — ${r.title}`)
      .join("\n")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
